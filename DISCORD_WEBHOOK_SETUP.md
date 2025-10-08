# Discord Webhook Integration

This app automatically posts to Discord via Zapier webhook whenever a new track is submitted to the forum.

## Setup Instructions

### 1. Environment Variables

Add these environment variables to your Vercel project:

```bash
# Zapier Webhook URL (required)
ZAPIER_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/YOUR_WEBHOOK_ID

# Application URL (optional, defaults to futureproof-feedback.vercel.app)
NEXT_PUBLIC_APP_URL=https://your-custom-domain.com
```

### 2. Webhook Payload

When a new track is posted, the webhook sends the following JSON payload to Zapier:

```json
{
  "title": "Track Title",
  "username": "artist_username",
  "genre": "Electronic",
  "postId": "uuid-of-post",
  "newBoardUrl": "https://your-app.vercel.app/?sort=new",
  "timestamp": "2025-01-08T12:00:00.000Z"
}
```

### 3. Zapier Configuration

In Zapier, set up a webhook trigger that:
1. Catches the webhook from the URL above
2. Formats a message for Discord using the payload data
3. Posts to your Discord channel

**Example Discord message format:**
```
🎵 **New Track Posted!**

**{title}** by **{username}**
Genre: {genre}

[View on Feedback Forum]({newBoardUrl})
```

### 4. Link to 'New' Board

Users can access the 'New' board (chronologically sorted posts) at:
```
https://your-app-domain.com/?sort=new
```

This URL will show all posts sorted by newest first.

## How It Works

When a user submits a new track:
1. The post is created in the database (`/api/posts` POST endpoint)
2. The post is automatically upvoted by the author
3. A webhook is triggered asynchronously to notify Zapier
4. Zapier posts the formatted message to Discord with a link back to the forum

The webhook call is non-blocking and won't affect the user's experience if it fails.

## Testing

To test the webhook:
1. Set the `ZAPIER_WEBHOOK_URL` environment variable in Vercel
2. Submit a new track through the forum
3. Check your Discord channel for the notification

If the webhook URL is not configured, the app will log a warning but continue to work normally.

