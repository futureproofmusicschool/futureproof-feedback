# Deployment Instructions

Your Feedback app is ready to deploy! The database schema and storage bucket are already set up in Supabase.

## Environment Variables for Vercel

You need to add these environment variables to your Vercel project. Go to:
`https://vercel.com/johnvon-futureproofms-projects/futureproof-arena/settings/environment-variables`

Add the following variables (for **Production**, **Preview**, and **Development**):

### DATABASE_URL
```
postgres://postgres:@5d4LH.g8g7d2Py@db.teonbgjmuzysypukdqul.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1
```

### NEXT_PUBLIC_SUPABASE_URL
```
https://teonbgjmuzysypukdqul.supabase.co
```

### NEXT_PUBLIC_SUPABASE_ANON_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlb25iZ2ptdXp5c3lwdWtkcXVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MjUzNDEsImV4cCI6MjA3NTEwMTM0MX0.VXQx80Iq5ksAObsnhgx2WvtDo3v4MlKvCBnGYm1KGkU
```

### SUPABASE_SERVICE_ROLE_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlb25iZ2ptdXp5c3lwdWtkcXVsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTUyNTM0MSwiZXhwIjoyMDc1MTAxMzQxfQ.9ukbA835LxYdDfqhoYfcNmOP2CFqY7dO9A9JMhLonns
```

## After Adding Environment Variables

1. Go to the Deployments tab
2. Click "Redeploy" on the latest deployment
3. Or run: `vercel --prod` from the project directory

## Your Deployment URL

Your app will be available at:
`https://futureproof-feedback.vercel.app` (or the URL shown in Vercel)

## Embedding in LearnWorlds

Once deployed, embed it in LearnWorlds using:

```html
<iframe 
  src="https://your-vercel-url.vercel.app/?u={{USER.USERNAME}}"
  width="100%"
  height="800px"
  style="border: none;"
></iframe>
```

Replace `your-vercel-url.vercel.app` with your actual Vercel deployment URL.

## What's Already Done

✅ Database schema created in Supabase
✅ Storage bucket created for audio files
✅ All API routes implemented
✅ UI components built
✅ Reddit-style sorting (Hot/New/Top)
✅ Voting system
✅ Threaded comments
✅ Audio upload with validation
✅ LearnWorlds iframe integration
✅ Security headers configured

## Testing

To test locally:
1. Create a `.env.local` file with the environment variables above
2. Run `npm run dev`
3. Visit `http://localhost:3000/?u=testuser`

