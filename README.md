# Feedback - Music Community Platform

A Reddit-style community platform for sharing original music tracks and getting feedback from fellow producers, designed to be embedded in LearnWorlds.

## Features

- 🎵 Audio track sharing (MP3/WAV, < 10 minutes) with genre tagging
- ⬆️⬇️ Reddit-style voting system for posts and comments
- 💬 Threaded comments with reply notifications
- 🔔 Real-time notification system for comments and replies
- 🔥 Hot/New/Top sorting algorithms (Reddit-style hot algorithm)
- 🔒 Secure audio streaming with signed URLs
- 🎨 Modern dark purple UI with glowing effects
- ✏️ Rich descriptions for context and feedback requests

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS
- **Backend**: Next.js API Routes (serverless)
- **Database**: Supabase PostgreSQL
- **ORM**: Prisma
- **Storage**: Supabase Storage (with signed URLs)
- **Deployment**: Vercel


## Setup

### Prerequisites

- Node.js 18+
- Supabase account and project
- Vercel account (for deployment)

### Installation

1. Clone the repository
```bash
git clone https://github.com/futureproofmusicschool/futureproof-feedback.git
cd futureproof-feedback
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
- `DATABASE_URL`: Your Supabase connection string (use the pooling connection)
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (for admin operations)
- `SUPABASE_STORAGE_BUCKET`: Your Supabase storage bucket name (default: "audio-files")

4. Set up the database
```bash
npx prisma generate
npx prisma db push
```

5. Apply Row Level Security policies (recommended)
```bash
# Database RLS
DATABASE_URL="your-connection-string" ./scripts/setup-rls.sh

# Storage policies (run in Supabase SQL Editor)
# See: prisma/migrations/storage_policies.sql
```

See [SECURITY_SETUP.md](./SECURITY_SETUP.md) for detailed security configuration.

6. Run the development server
```bash
npm run dev
```

## Deployment

### Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel project settings
4. Deploy

### Environment Variables

Make sure to set these in your Vercel project:

- `DATABASE_URL` - Supabase PostgreSQL connection string (pooling)
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `SUPABASE_STORAGE_BUCKET` - Storage bucket name (e.g., "audio-files")

## LearnWorlds Integration

### Embedding

Embed the application in LearnWorlds using an iframe:

```html
<iframe 
  src="https://your-app.vercel.app/?u={{USER.USERNAME}}"
  width="100%"
  height="800px"
  frameborder="0"
></iframe>
```

The `u={{USER.USERNAME}}` parameter passes the LearnWorlds username to the app.

### Security

- The app enforces iframe-only access via CSP headers
- All API calls require the `x-username` header
- No traditional authentication system (trusts LearnWorlds parent)
- Audio files are served via signed URLs that expire after 1 hour
- User authorization checks for delete operations (author only)
- **Row Level Security (RLS)** enabled on all database tables for defense-in-depth
- Storage bucket policies protect audio file access

**📖 See [SECURITY_SETUP.md](./SECURITY_SETUP.md) for complete security configuration.**

## Database Schema

See `prisma/schema.prisma` for the complete schema:

- **users**: Usernames from LearnWorlds
- **posts**: Audio track submissions with title, genre, description, and storage path
- **post_votes**: Upvotes/downvotes on posts
- **comments**: Threaded discussions with parent-child relationships
- **comment_votes**: Upvotes/downvotes on comments
- **notifications**: User notifications for comments and replies

## API Routes

### Posts
- `POST /api/posts` - Create a new post
- `GET /api/posts` - List posts with sorting (hot/new/top)
- `GET /api/posts/[id]` - Get single post with details
- `GET /api/posts/[id]/signed-url` - Get signed URL for audio playback
- `POST /api/posts/[id]/vote` - Vote on post (upvote/downvote/remove)
- `DELETE /api/posts/[id]/delete` - Delete post (author only)

### Comments
- `GET /api/comments?postId=...` - Get comments for a post
- `POST /api/comments` - Create comment or reply
- `POST /api/comments/[id]/vote` - Vote on comment
- `DELETE /api/comments/[id]/delete` - Delete comment (author only)

### Notifications
- `GET /api/notifications` - Get user notifications (unread by default)
- `POST /api/notifications/mark-read` - Mark notifications as read
- `POST /api/notifications/clear` - Clear all notifications for user

### Upload
- `POST /api/upload/signed-url` - Generate Supabase Storage upload URL

### Session
- `GET /api/session` - Get/create user session

## Sorting Algorithms

### Hot (Default)
Uses Reddit's hot algorithm to balance popularity with recency:
- Recent posts with engagement rank higher
- Uses logarithmic scaling for votes
- Old posts gradually sink even with high scores

### New
Simple chronological sorting by creation date (newest first)

### Top
Sorts by total score (upvotes - downvotes), with ties broken by recency

## UI Theme

Modern dark purple theme inspired by music production software:
- Deep dark backgrounds (#0A0A0F, #1A1A2E)
- Vibrant purple accents (#8B5CF6, #A78BFA, #C084FC)
- Purple glow effects on interactive elements
- 2px borders for visual prominence
- Bold typography for emphasis

## License

MIT

