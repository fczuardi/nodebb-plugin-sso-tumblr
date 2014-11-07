(function(module) {
	"use strict";

	var User = module.parent.require('./user'),
		meta = module.parent.require('./meta'),
		db = module.parent.require('../src/database'),
		shortId = require('shortid'),
		passport = module.parent.require('passport'),
		passportTumblr = require('passport-tumblr').Strategy,
		fs = module.parent.require('fs'),
		path = module.parent.require('path'),
		async = module.parent.require('async'),
		winston = module.parent.require('winston'),
		nconf = module.parent.require('nconf');

	var constants = Object.freeze({
		'name': "Tumblr",
		'admin': {
			'route': '/plugins/sso-tumblr',
			'icon': 'fa-tumblr-square'
		}
	});

	var Tumblr = {};

	Tumblr.init = function(app, middleware, controllers, callback) {
		function render(req, res, next) {
			res.render('admin/plugins/sso-tumblr', {});
		}

		app.get('/admin/plugins/sso-tumblr', middleware.admin.buildHeader, render);
		app.get('/api/admin/plugins/sso-tumblr', render);

		callback();
	}

	Tumblr.getStrategy = function(strategies, callback) {
		meta.settings.get('sso-tumblr', function(err, settings) {
			if (!err && settings['id'] && settings['secret']) {
				passport.use(new passportTumblr({
					consumerKey: settings['id'],
					consumerSecret: settings['secret'],
					callbackURL: nconf.get('url') + '/auth/tumblr/callback',
					passReqToCallback: true
				}, function(req, accessToken, refreshToken, profile, done) {
					Tumblr.login(profile.username, profile._json.response.user.blogs[0].url , function(err, user) {
						if (err) {
							return done(err);
						}
						done(null, user);
					});
				}));

				strategies.push({
					name: 'tumblr',
					url: '/auth/tumblr',
					callbackURL: '/auth/tumblr/callback',
					icon: 'fa-tumblr-square',
					scope: ''
				});
			}

			callback(null, strategies);
		});
	};

	Tumblr.login = function(tumblrid, blogUrl, callback) {
		Tumblr.getUidByTumblrId(tumblrid, function(err, uid) {
			if(err) {
				return callback(err);
			}

			if (uid !== null) {
				// Existing User
				callback(null, {
					uid: uid
				});
			} else {
				// New User
				var success = function(uid, merge) {
					// Save tumblr-specific information to the user
					var data = {
						tumblrid: tumblrid
					};

					if (!merge) {

						var baseHostname = blogUrl.replace(/https?:\/\//, '').replace(/\/$/, ''); // i.e. david.tumblr.com
						var blogAvatar = 'http://api.tumblr.com/v2/blog/' + baseHostname + '/avatar/512';

						if (blogAvatar && 0 < blogAvatar.length) {
							data.uploadedpicture = blogAvatar;
							data.picture = blogAvatar;

						}

						data.website = blogUrl;
					}

					async.parallel([
						function(callback2) {
							db.setObjectField('tumblrid:uid', tumblrid, uid, callback2);
						},
						function(callback2) {
							User.setUserFields(uid, data, callback2);
						}
					], function(err, results) {
						if (err) {
							return callback(err);
						}

						callback(null, {
							uid: uid
						});
					});
				};

				// Create user with fake email because Tumblr doesn't give it back to us.
				var fakeEmail = tumblrid + '@tumblr.com';
				User.create({username: shortId.generate(), email: fakeEmail}, function(err, uid) {
					if(err) {
						return callback(err);
					}

					success(uid, false);
				});
			}
		});
	};

	Tumblr.getUidByTumblrId = function(tumblrid, callback) {
		db.getObjectField('tumblrid:uid', tumblrid, function(err, uid) {
			if (err) {
				return callback(err);
			}
			callback(null, uid);
		});
	};

	Tumblr.addMenuItem = function(custom_header, callback) {
		custom_header.authentication.push({
			"route": constants.admin.route,
			"icon": constants.admin.icon,
			"name": constants.name
		});

		callback(null, custom_header);
	};

	Tumblr.deleteUserData = function(uid, callback) {
		async.waterfall([
			async.apply(User.getUserField, uid, 'tumblrid'),
			function(oAuthIdToDelete, next) {
				db.deleteObjectField('tumblrid:uid', oAuthIdToDelete, next);
			}
		], function(err) {
			if (err) {
				winston.error('[sso-tumblr] Could not remove OAuthId data for uid ' + uid + '. Error: ' + err);
				return callback(err);
			}
			callback(null, uid);
		});
	};

	module.exports = Tumblr;
}(module));