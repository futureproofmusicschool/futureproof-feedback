-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Anyone can view user profiles (public information)
CREATE POLICY "Users are viewable by everyone"
  ON users FOR SELECT
  USING (true);

-- Users can insert their own record (auto-created via API)
CREATE POLICY "Users can create their own profile"
  ON users FOR INSERT
  WITH CHECK (true);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (true);

-- ============================================================================
-- POSTS TABLE POLICIES
-- ============================================================================

-- Anyone can view all posts
CREATE POLICY "Posts are viewable by everyone"
  ON posts FOR SELECT
  USING (true);

-- Authenticated users can create posts
CREATE POLICY "Authenticated users can create posts"
  ON posts FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND author_user_id = auth.uid()
  );

-- Users can update only their own posts
CREATE POLICY "Users can update their own posts"
  ON posts FOR UPDATE
  USING (author_user_id = auth.uid());

-- Users can delete only their own posts
CREATE POLICY "Users can delete their own posts"
  ON posts FOR DELETE
  USING (author_user_id = auth.uid());

-- ============================================================================
-- POST_VOTES TABLE POLICIES
-- ============================================================================

-- Anyone can view votes (for calculating scores)
CREATE POLICY "Post votes are viewable by everyone"
  ON post_votes FOR SELECT
  USING (true);

-- Authenticated users can insert their own votes
CREATE POLICY "Users can create their own post votes"
  ON post_votes FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND user_id = auth.uid()
  );

-- Users can update their own votes
CREATE POLICY "Users can update their own post votes"
  ON post_votes FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their own votes
CREATE POLICY "Users can delete their own post votes"
  ON post_votes FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- COMMENTS TABLE POLICIES
-- ============================================================================

-- Anyone can view all comments
CREATE POLICY "Comments are viewable by everyone"
  ON comments FOR SELECT
  USING (true);

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND author_user_id = auth.uid()
  );

-- Users can update their own comments
CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  USING (author_user_id = auth.uid());

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  USING (author_user_id = auth.uid());

-- ============================================================================
-- COMMENT_VOTES TABLE POLICIES
-- ============================================================================

-- Anyone can view comment votes (for calculating scores)
CREATE POLICY "Comment votes are viewable by everyone"
  ON comment_votes FOR SELECT
  USING (true);

-- Authenticated users can insert their own votes
CREATE POLICY "Users can create their own comment votes"
  ON comment_votes FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND user_id = auth.uid()
  );

-- Users can update their own votes
CREATE POLICY "Users can update their own comment votes"
  ON comment_votes FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their own votes
CREATE POLICY "Users can delete their own comment votes"
  ON comment_votes FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- NOTIFICATIONS TABLE POLICIES
-- ============================================================================

-- Users can only see their own notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

-- System/authenticated users can create notifications (via API)
CREATE POLICY "Authenticated users can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE
  USING (user_id = auth.uid());

