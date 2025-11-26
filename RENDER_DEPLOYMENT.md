# Deploying test-url to Render

## Prerequisites
- GitHub account
- Render account (free tier)
- Push your code to a GitHub repository

## Step 1: Push to GitHub
```bash
git add .
git commit -m "Prepare test-url for Render deployment"
git push origin main
```

## Step 2: Create PostgreSQL Database on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New +** → **PostgreSQL**
3. Configure:
   - **Name**: `test-url-db`
   - **Database**: `test_url_db`
   - **User**: `test_url_user`
   - **Region**: Choose closest to you
   - **Plan**: Free
4. Click **Create Database**
5. Wait for database to be provisioned
6. Copy the **Internal Database URL** (it looks like: `postgresql://user:pass@host:5432/dbname`)

## Step 3: Create Web Service on Render

1. Click **New +** → **Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `test-url`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Runtime**: Node
   - **Build Command**: `pnpm install && pnpm nx build test-url`
   - **Start Command**: `node dist/apps/test-url/main.js`
   - **Plan**: Free

## Step 4: Configure Environment Variables

In the **Environment** section, add:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` (Render's default) |
| `DB_HOST` | From database Internal URL |
| `DB_PORT` | `5432` |
| `DB_USER` | From database Internal URL |
| `DB_PASSWORD` | From database Internal URL |
| `DB_NAME` | From database Internal URL |
| `DB_SSL` | `true` |

**Note**: You can parse the Internal Database URL:
```
postgresql://USER:PASSWORD@HOST:5432/DATABASE_NAME
```

Or use the **Add from Database** button to auto-populate these values.

## Step 5: Deploy

1. Click **Create Web Service**
2. Render will automatically build and deploy your app
3. Wait for deployment to complete (~5-10 minutes)
4. Your app will be available at: `https://test-url-xxxx.onrender.com`

## Step 6: Initialize Database Schema

After first deployment, you may need to run migrations:

1. Go to your web service on Render
2. Navigate to **Shell** tab
3. Run your migration command:
   ```bash
   node dist/apps/test-url/main.js # Or your migration script
   ```

## Testing Your Deployment

```bash
# Health check
curl https://your-app.onrender.com/ping

# Create config
curl -X POST https://your-app.onrender.com/test-url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

## Important Notes

### Free Tier Limitations
- Service spins down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds
- 750 hours/month free (enough for 1 service running 24/7)
- 512 MB RAM, 0.1 CPU

### Auto-Deploy
Render automatically deploys when you push to your main branch.

### Logs
View logs in Render Dashboard → Your Service → Logs

### Custom Domain (Optional)
Render free tier supports custom domains:
1. Go to Settings → Custom Domain
2. Add your domain
3. Configure DNS as instructed

## Troubleshooting

### Build Fails
- Check build logs in Render dashboard
- Ensure `pnpm` is being used (Render auto-detects from `pnpm-lock.yaml`)

### Database Connection Issues
- Verify environment variables are correct
- Use Internal Database URL (not External)
- Ensure `DB_SSL=true` for Render PostgreSQL

### App Won't Start
- Check start command is correct
- Verify `PORT` environment variable is set
- Check logs for errors
