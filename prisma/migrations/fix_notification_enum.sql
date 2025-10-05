-- Fix missing NotificationType enum
-- This recreates the enum type that got lost

-- First, check if it exists and drop if needed (in case it's corrupted)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'NotificationType') THEN
        DROP TYPE "NotificationType" CASCADE;
    END IF;
END $$;

-- Recreate the enum type
CREATE TYPE "NotificationType" AS ENUM ('COMMENT_ON_POST', 'REPLY_TO_COMMENT');

-- If notifications table exists but column is wrong type, fix it
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'type'
    ) THEN
        -- Alter the column to use the enum type
        ALTER TABLE notifications 
        ALTER COLUMN type TYPE "NotificationType" 
        USING type::text::"NotificationType";
    END IF;
END $$;

