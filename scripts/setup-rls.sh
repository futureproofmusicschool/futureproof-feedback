#!/bin/bash

# Setup Row Level Security for Futureproof Feedback
# This script applies RLS policies to your Supabase database

set -e

echo "🔒 Setting up Row Level Security..."
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set"
    echo ""
    echo "Please set your DATABASE_URL:"
    echo "  export DATABASE_URL='your-supabase-connection-string'"
    echo ""
    echo "Or run with:"
    echo "  DATABASE_URL='your-connection-string' ./scripts/setup-rls.sh"
    exit 1
fi

echo "📋 Step 1: Applying database RLS policies..."
psql "$DATABASE_URL" -f prisma/migrations/20251005_add_rls_policies/migration.sql

if [ $? -eq 0 ]; then
    echo "✅ Database RLS policies applied successfully!"
else
    echo "❌ Failed to apply database RLS policies"
    exit 1
fi

echo ""
echo "📋 Step 2: Storage bucket policies..."
echo ""
echo "⚠️  Storage bucket policies must be applied manually via Supabase Dashboard:"
echo ""
echo "1. Go to: https://supabase.com/dashboard/project/_/auth/policies"
echo "2. Navigate to Storage → Policies"
echo "3. Apply the policies from SECURITY_SETUP.md"
echo ""
echo "Or run the SQL commands from SECURITY_SETUP.md in the SQL Editor:"
echo "   https://supabase.com/dashboard/project/_/sql"
echo ""

echo "✅ RLS setup complete!"
echo ""
echo "📖 For more information, see SECURITY_SETUP.md"
echo ""

# Verify RLS is enabled
echo "🔍 Verifying RLS status..."
echo ""
psql "$DATABASE_URL" -c "
SELECT 
    schemaname,
    tablename, 
    CASE WHEN rowsecurity THEN '✅ Enabled' ELSE '❌ Disabled' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
"

echo ""
echo "Done! 🎉"

