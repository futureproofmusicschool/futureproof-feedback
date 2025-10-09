/**
 * Sends a webhook to Zapier when a new track is posted
 */
export async function sendNewTrackWebhook(data: {
  title: string;
  username: string;
  genre: string;
  postId: string;
}) {
  const webhookUrl = process.env.ZAPIER_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.warn('ZAPIER_WEBHOOK_URL not configured, skipping webhook');
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: data.title,
        username: data.username,
        genre: data.genre,
        postId: data.postId,
        newBoardUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://futureproof-feedback.vercel.app'}/?sort=new`,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      console.error('Failed to send webhook:', response.status, response.statusText);
    } else {
      console.log('✅ Webhook sent successfully for post:', data.postId);
    }
  } catch (error) {
    console.error('Error sending webhook:', error);
    // Don't throw - we don't want webhook failures to break post creation
  }
}


