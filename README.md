# Arena - Music Community Platform

A Reddit-style community platform for sharing original music tracks, designed to be embedded in LearnWorlds.

## Features

- 🎵 Audio track sharing (MP3/WAV, < 10 minutes)
- ⬆️⬇️ Reddit-style voting system
- 💬 Threaded comments
- 🔥 Hot/New/Top sorting algorithms
- 🎨 Clean, modern UI

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS
- **Backend**: Next.js API Routes (serverless)
- **Database**: Supabase PostgreSQL
- **ORM**: Prisma
- **Storage**: Google Cloud Storage
- **Deployment**: Vercel

## Setup

### Prerequisites

- Node.js 18+
- Supabase account and project
- Google Cloud Storage bucket and service account
- Vercel account

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd futureproof-arena
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
- `GCS_PROJECT_ID`, `GCS_BUCKET_NAME`, `GCS_CLIENT_EMAIL`, `GCS_PRIVATE_KEY`: Your GCS credentials

4. Set up the database
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server
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

- `DATABASE_URL`
- `GCS_PROJECT_ID`
- `GCS_BUCKET_NAME`
- `GCS_CLIENT_EMAIL`
- `GCS_PRIVATE_KEY`

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

## Database Schema

See `prisma/schema.prisma` for the complete schema:

- **users**: Usernames from LearnWorlds
- **posts**: Audio track submissions
- **post_votes**: Upvotes/downvotes on posts
- **comments**: Threaded discussions
- **comment_votes**: Upvotes/downvotes on comments

## API Routes

- `GET /api/session` - Get/create user by username
- `POST /api/upload/signed-url` - Generate GCS upload URL
- `POST /api/posts` - Create a post
- `GET /api/posts` - List posts (with sorting)
- `GET /api/posts/[id]` - Get single post
- `POST /api/posts/[id]/vote` - Vote on post
- `GET /api/comments?postId=...` - Get comments for post
- `POST /api/comments` - Create comment
- `POST /api/comments/[id]/vote` - Vote on comment

## License

MIT

