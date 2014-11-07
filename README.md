# NodeBB Tumblr SSO

NodeBB Plugin that allows users to login/register via their Tumblr account.

## Installation

    npm install nodebb-plugin-sso-tumblr

## Configuration

1. Go to [Tumblr OAuth Apps](http://www.tumblr.com/oauth/apps)
1. Once signed in, click +Register application
1. Fill in all the details
1. Set your "OAuth 2.0 Redirect URLs" as the domain you access your NodeBB with `/auth/tumblr/callback` appended to it (e.g. `https://www.mygreatwebsite.com/auth/tumblr/callback`)
1. Click Register
1. Copy and paste OAuth consumer key and OAuth consumer secret keys