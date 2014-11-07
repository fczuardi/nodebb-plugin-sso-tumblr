<h1><i class="fa fa-tumblr-square"></i> Tumblr Accounts Social Authentication</h1>
<hr />

<form class="sso-tumblr">
	<div class="alert alert-warning">
		<p>
			Create a <strong>Tumblr Application</strong> via the
			<a href="http://developer.tumblr.com/">Tumblr Developer Network</a> and then paste
			your application details here.
		</p>
		<br />
		<input type="text" name="id" title="API Key" class="form-control input-lg" placeholder="API Key"><br />
		<input type="text" name="secret" title="Secret Key" class="form-control" placeholder="Secret Key">
		<p class="help-block">
			The appropriate "OAuth 2.0 Redirect URLs" is your NodeBB's URL with `/auth/tumblr/callback` appended to it.
		</p>
	</div>
</form>

<button class="btn btn-lg btn-primary" type="button" id="save">Save</button>

<script>
	require(['settings'], function(Settings) {
		Settings.load('sso-tumblr', $('.sso-tumblr'));

		$('#save').on('click', function() {
			Settings.save('sso-tumblr', $('.sso-tumblr'));
		});
	});
</script>