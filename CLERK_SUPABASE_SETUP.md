# Supabase JWT Configuration for Clerk Integration

## Step 1: Get your Clerk JWKS URL

Your Clerk JWKS URL should be: `https://clerk.your-domain.com/.well-known/jwks.json`

For your app, it would be something like:
`https://climbing-stallion-72.clerk.accounts.dev/.well-known/jwks.json`

## Step 2: Configure Supabase Project Settings

1. Go to your Supabase project dashboard
2. Navigate to: Settings > Auth > JWT Settings
3. Set the following:

### JWT Secret (Custom)

Instead of the default Supabase JWT secret, you need to configure it to accept Clerk tokens.

### JWT Settings:

- **JWT Verification Method**: JWKS (JSON Web Key Set)
- **JWKS URI**: `https://your-clerk-domain.clerk.accounts.dev/.well-known/jwks.json`
- **JWT Claims**: Configure to map Clerk claims to Supabase

## Step 3: Alternative - Use Supabase Environment Variables

If the UI doesn't work, you can set these environment variables in Supabase:

```
JWT_SECRET_SOURCE=jwks
JWT_JWKS_URI=https://your-clerk-domain.clerk.accounts.dev/.well-known/jwks.json
JWT_AUD=authenticated
JWT_ISSUER=https://your-clerk-domain.clerk.accounts.dev
```

## Step 4: Verify Clerk JWT Template

Make sure your Clerk JWT template (named "supabase") contains:

```json
{
  "aud": "authenticated",
  "role": "{{user.public_metadata.role || 'user'}}",
  "email": "{{user.email_address}}",
  "sub": "{{user.id}}"
}
```

## Step 5: Test the Configuration

After setting this up, your `createSupabaseServerClient` should work properly with RLS policies.
