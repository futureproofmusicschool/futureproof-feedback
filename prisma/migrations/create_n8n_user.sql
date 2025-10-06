-- Create a dedicated read-only user for n8n workflows
-- This user can read notifications and mark them as read, but nothing else

-- Create the role
CREATE ROLE agent_reader WITH LOGIN PASSWORD 'YOUraseerCUREpa23s!';

-- Grant connection to database
GRANT CONNECT ON DATABASE postgres TO agent_reader;

-- Grant usage on public schema
GRANT USAGE ON SCHEMA public TO agent_reader;

-- Grant SELECT on tables needed for notifications
GRANT SELECT ON users TO agent_reader;
GRANT SELECT ON posts TO agent_reader;
GRANT SELECT ON comments TO agent_reader;
GRANT SELECT ON notifications TO agent_reader;

-- Grant UPDATE on notifications table (to mark as read)
GRANT UPDATE (is_read, read_at) ON notifications TO agent_reader;

-- Grant access to sequences (for potential future needs)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO agent_reader;

-- Ensure future tables also have appropriate permissions
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT SELECT ON TABLES TO agent_reader;

-- Verify the user was created
SELECT 
    usename as username,
    usesuper as is_superuser,
    usecreatedb as can_create_db
FROM pg_user 
WHERE usename = 'agent_reader';

