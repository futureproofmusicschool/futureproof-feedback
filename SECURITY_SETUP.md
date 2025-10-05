# Security Setup Guide

This guide explains how to implement Row Level Security (RLS) for the Futureproof Feedback platform.

## Overview

The application uses a hybrid security model:
- **API Layer**: Acts as trusted intermediary, using service role key
- **Database RLS**: Provides defense-in-depth for direct database access
- **Storage Policies**: Secures audio file access

## ⚠️ Important: Current Architecture Limitations

This application currently uses **username-based authentication from LearnWorlds** (not Supabase Auth). The API middleware validates the `x-username` header and uses the **service role key** which **bypasses RLS**.

### What This Means

**RLS policies will NOT be enforced** for API operations because:
1. All API routes use `supabaseAdmin` (service role client)
2. Service role has `bypassrls` privilege
3. No Supabase Auth JWTs are used (no `auth.uid()` available)

### Why Implement RLS Anyway?

The RLS policies provide **defense-in-depth** security for:
- ✅ **Direct database access** via Supabase Dashboard
- ✅ **SQL clients** connecting with non-service-role credentials
- ✅ **Future API changes** that might use anon key + proper auth
- ✅ **Third-party tools** that connect to your database
- ✅ **Accidental exposure** of the anon key
- ✅ **Security audits** and compliance requirements

### Current Security Model

```
LearnWorlds (iframe) 
  → Username in URL param
  → API Middleware (validates x-username header)
  → Creates/fetches User in DB
  → Performs operations with service role key
  → RLS is bypassed ✋
```

### Recommended: Migrate to Proper Auth

For RLS to actively protect your API operations, you need to:
1. Create Supabase Auth users for LearnWorlds usernames
2. Generate JWTs for authenticated users
3. Use anon key + JWT instead of service role
4. Let RLS policies enforce authorization automatically

See the "Migrating to Proper Auth" section below for details.

## Database RLS Policies

### Applying the Migration

Run the RLS migration to enable policies:

```bash
npx prisma migrate dev --name add_rls_policies
```

Or apply directly to your Supabase database:

```bash
psql $DATABASE_URL -f prisma/migrations/20251005_add_rls_policies/migration.sql
```

### Policy Summary

**Users Table**:
- ✅ Anyone can view profiles (public data)
- ✅ Users can create/update their own profile

**Posts Table**:
- ✅ Anyone can view posts
- ✅ Only authenticated users can create posts
- ✅ Users can only update/delete their own posts

**Comments Table**:
- ✅ Anyone can view comments
- ✅ Only authenticated users can create comments
- ✅ Users can only update/delete their own comments

**Votes Tables** (posts & comments):
- ✅ Anyone can view votes (for score calculation)
- ✅ Users can only manage their own votes

**Notifications Table**:
- ✅ Users can only see their own notifications
- ✅ Users can only update/delete their own notifications

## Storage Bucket Policies

### Setup Instructions

The `audio-tracks` bucket needs RLS policies to secure audio files. Run these commands in the Supabase SQL Editor:

```sql
-- Enable RLS on the storage.objects table for our bucket
-- Note: This affects only the audio-tracks bucket

-- Policy 1: Anyone can view/download audio files (public read)
CREATE POLICY "Public audio files are accessible to everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'audio-tracks');

-- Policy 2: Authenticated users can upload audio files
CREATE POLICY "Authenticated users can upload audio files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'audio-tracks'
  AND auth.role() = 'authenticated'
);

-- Policy 3: Users can only update their own files
-- (matches owner column in storage.objects)
CREATE POLICY "Users can update their own audio files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'audio-tracks'
  AND auth.uid()::text = owner
);

-- Policy 4: Users can only delete their own files
CREATE POLICY "Users can delete their own audio files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'audio-tracks'
  AND auth.uid()::text = owner
);
```

### Create the Bucket (if not exists)

If you haven't created the `audio-tracks` bucket yet:

1. Go to your Supabase Dashboard → Storage
2. Click "Create bucket"
3. Name: `audio-tracks`
4. Public bucket: **ON** (for easier signed URL generation)
5. File size limit: 50 MB (10-minute MP3 at 320kbps ≈ 24MB)
6. Allowed MIME types: `audio/mpeg`, `audio/wav`, `audio/mp3`

Or via SQL:

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'audio-tracks',
  'audio-tracks',
  true,
  52428800, -- 50 MB in bytes
  ARRAY['audio/mpeg', 'audio/wav', 'audio/mp3']
);
```

## Migrating to Proper Auth (Future)

If you want to migrate from service role operations to proper Supabase Auth:

### 1. Update Supabase Client Usage

Currently using service role everywhere:
```typescript
// lib/supabase.ts
export const supabaseAdmin = createClient(url, serviceKey); // bypasses RLS
```

Would change to:
```typescript
// For server-side with user context
export function getSupabaseClient(accessToken: string) {
  return createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } }
  });
}
```

### 2. Implement JWT Generation

Since users come from LearnWorlds (not Supabase Auth), you'd need to:

1. Create users in Supabase Auth when they first access the app
2. Generate proper JWTs for them
3. Pass those JWTs to the client
4. Use anon key + JWT instead of service key

Example API change:
```typescript
// Instead of using supabaseAdmin everywhere
const supabase = getSupabaseClient(userAccessToken);
const { data } = await supabase.from('posts').select('*');
// RLS policies now automatically apply
```

### 3. Update API Middleware

The middleware would need to:
1. Check `x-username` header (LearnWorlds)
2. Get or create Supabase Auth user for that username
3. Generate JWT for that user
4. Attach JWT to request context
5. Use client with JWT instead of service role

## Testing RLS Policies

### Test as Different Users

Using Supabase SQL Editor, you can test policies by switching roles:

```sql
-- Test as anonymous user
SET ROLE anon;
SELECT * FROM posts; -- Should work (public read)
INSERT INTO posts (...) VALUES (...); -- Should fail

-- Reset role
RESET ROLE;

-- Test as authenticated user (requires JWT simulation)
SET request.jwt.claim.sub = 'user-uuid-here';
SET ROLE authenticated;
SELECT * FROM posts; -- Should work
INSERT INTO posts (author_user_id, ...) VALUES (current_setting('request.jwt.claim.sub')::uuid, ...);
-- Should work
```

### Check Which Policies Apply

```sql
-- View all policies on a table
SELECT * FROM pg_policies WHERE tablename = 'posts';

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

## Security Advisors

Run Supabase's built-in security advisor to check for issues:

1. Go to Supabase Dashboard → Advisors
2. Check for:
   - Tables without RLS
   - Missing indexes on policy columns
   - Performance issues

Or check via this SQL:

```sql
-- Find tables without RLS enabled
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename NOT IN (
    SELECT tablename FROM pg_tables WHERE rowsecurity = true
  );
```

## Performance Considerations

RLS policies can impact query performance. Follow these best practices:

### 1. Add Indexes on Policy Columns

```sql
-- Already have these from schema, but ensure they exist:
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_user_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_post_votes_user ON post_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_votes_user ON comment_votes(user_id);
```

### 2. Use SELECT Wrapper for auth.uid()

The policies already use this pattern:
```sql
-- Efficient: auth.uid() is called once
USING (author_user_id = auth.uid())

-- Less efficient (calls auth.uid() per row):
USING ((auth.uid()) = author_user_id)
```

### 3. Monitor Slow Queries

```sql
-- Enable slow query logging (adjust threshold as needed)
ALTER DATABASE postgres SET log_min_duration_statement = 1000; -- 1 second
```

## Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)

