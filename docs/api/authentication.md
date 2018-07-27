
# Authentication

## Server to Server

This can be done with either client credentials flow or Resource Owner Password Credentials flow.

### Resource Owner Password Credentials

make a POST request to the OAuth providers auth/oauth/token endpoint, with the params:

```json
{
  "grant_type"    : "password",
  "username"      : "user@example.com",
  "password"      : "sekret",
  "authority"     : "sgrp-12345",
  "client_id"     : "51950dbd4d73154fdf0a",
  "client_secret" : "c5119adad999683f560f",
  "scope"         : "public"
}
```

Then, you'll receive the access token back in the response:

```json
{
  "access_token": "1f0af717251950dbd4d73154fdf0a474a5c5119adad999683f5b450c460726aa",
  "token_type": "bearer",
  "expires_in": 7200
}
```


### Client Credentials

This is similar to the above except you don't need to provide a username or password.
However your application needs to have a resource owner attached to the application model otherwise the flow won't work.
