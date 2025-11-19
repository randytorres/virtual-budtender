# Backend Deployment Guide - Fast, Safe & Secure

Deploy your Virtual Budtender backend to production in under 10 minutes.

## 🚀 Recommended Options (Easiest to Hardest)

1. **Railway** - Fastest, most developer-friendly (5 min)
2. **Render** - Great free tier, auto-deploy (7 min)
3. **Heroku** - Classic, reliable, well-documented (10 min)
4. **Fly.io** - Modern, edge computing (10 min)

All options include:
- ✅ HTTPS by default
- ✅ Auto-restarts on crash
- ✅ Environment variables
- ✅ Log viewing
- ✅ Easy scaling

---

## Option 1: Railway (Recommended ⭐)

**Why:** Fastest deployment, great DX, generous free tier

### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
railway login
```

### Step 2: Create Railway Project

```bash
cd /Users/randytorres/Projects/virtual-budtender
railway init
```

### Step 3: Add Environment Variables

```bash
railway variables set OPENAI_API_KEY=your_key_here
railway variables set FIREBASE_PROJECT_ID=your_project_id
railway variables set FIREBASE_CLIENT_EMAIL=your_email@project.iam.gserviceaccount.com
railway variables set FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
railway variables set PORT=3001
railway variables set NODE_ENV=production
```

### Step 4: Create `railway.json`

Create this file in your project root:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node backend/server.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Step 5: Deploy

```bash
railway up
```

### Step 6: Get Your URL

```bash
railway domain
# Copy the URL, e.g., https://your-app.railway.app
```

**Done!** Update your frontend `.env`:
```env
VITE_API_URL=https://your-app.railway.app
```

### Railway Web Dashboard

1. Go to https://railway.app
2. View logs, metrics, and environment variables
3. Enable auto-deploy from GitHub (optional)

---

## Option 2: Render

**Why:** Generous free tier, auto-deploy from GitHub

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Create render.yaml

Create this file in your project root:

```yaml
services:
  - type: web
    name: virtual-budtender-api
    env: node
    buildCommand: npm install
    startCommand: node backend/server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3001
      - key: OPENAI_API_KEY
        sync: false
      - key: FIREBASE_PROJECT_ID
        sync: false
      - key: FIREBASE_CLIENT_EMAIL
        sync: false
      - key: FIREBASE_PRIVATE_KEY
        sync: false
    healthCheckPath: /health
```

### Step 3: Deploy on Render

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repo
4. Render auto-detects settings from `render.yaml`
5. Add environment variables in dashboard
6. Click "Create Web Service"

### Step 4: Get Your URL

Copy the URL from Render dashboard:
```
https://virtual-budtender-api.onrender.com
```

**Note:** Free tier may sleep after inactivity (30 sec cold start)

---

## Option 3: Heroku

**Why:** Classic, reliable, extensive documentation

### Step 1: Install Heroku CLI

```bash
brew install heroku/brew/heroku
heroku login
```

### Step 2: Create Heroku App

```bash
cd /Users/randytorres/Projects/virtual-budtender
heroku create virtual-budtender-api
```

### Step 3: Create Procfile

Create `Procfile` in project root:

```
web: node backend/server.js
```

### Step 4: Set Environment Variables

```bash
heroku config:set OPENAI_API_KEY=your_key
heroku config:set FIREBASE_PROJECT_ID=your_project
heroku config:set FIREBASE_CLIENT_EMAIL=your_email
heroku config:set FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
heroku config:set NODE_ENV=production
```

### Step 5: Deploy

```bash
git push heroku main
```

### Step 6: Check Status

```bash
heroku open
heroku logs --tail
```

**Your URL:** `https://virtual-budtender-api.herokuapp.com`

---

## Option 4: Fly.io

**Why:** Modern platform, edge computing, fast globally

### Step 1: Install Fly CLI

```bash
brew install flyctl
fly auth login
```

### Step 2: Launch App

```bash
cd /Users/randytorres/Projects/virtual-budtender
fly launch
```

Answer prompts:
- App name: `virtual-budtender-api`
- Region: Choose closest to your users
- Database: No
- Deploy now: No (we need to set env vars first)

### Step 3: Configure fly.toml

Edit the generated `fly.toml`:

```toml
app = "virtual-budtender-api"
primary_region = "lax"

[build]
  [build.args]
    NODE_VERSION = "20"

[env]
  PORT = "8080"
  NODE_ENV = "production"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0

[[http_service.checks]]
  grace_period = "10s"
  interval = "30s"
  method = "GET"
  timeout = "5s"
  path = "/health"
```

### Step 4: Set Secrets

```bash
fly secrets set OPENAI_API_KEY=your_key
fly secrets set FIREBASE_PROJECT_ID=your_project
fly secrets set FIREBASE_CLIENT_EMAIL=your_email
fly secrets set FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

### Step 5: Deploy

```bash
fly deploy
```

**Your URL:** `https://virtual-budtender-api.fly.dev`

---

## 🔒 Security Checklist

Before deploying to production:

### Environment Variables
- [ ] Never commit `.env` file
- [ ] Use platform secret management
- [ ] Rotate API keys regularly
- [ ] Use different keys for staging/prod

### CORS Configuration
Update `backend/server.js` for production:

```javascript
// Development
app.use(cors());

// Production
app.use(cors({
  origin: [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
    'http://localhost:3000' // For local testing
  ],
  credentials: true
}));
```

### Rate Limiting
Add rate limiting to prevent abuse:

```bash
npm install express-rate-limit
```

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
  message: 'Too many requests, please try again later'
});

app.use('/chat', limiter);
```

### Error Handling
Ensure sensitive data isn't leaked in errors:

```javascript
// Production error handler
if (process.env.NODE_ENV === 'production') {
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong' });
  });
}
```

---

## 📊 Monitoring Setup

### Health Checks
Your backend already has `/health` endpoint. Set up monitoring:

**UptimeRobot** (Free)
1. Go to https://uptimerobot.com
2. Add monitor → HTTP(s)
3. URL: `https://your-api.com/health`
4. Check every 5 minutes
5. Get alerts via email/SMS

**Better Stack** (Free tier)
1. Go to https://betterstack.com
2. Create uptime monitor
3. Add your health endpoint
4. Set up status page

### Log Management

**Railway/Render:**
- Built-in log viewer in dashboard
- Can export to external services

**Heroku:**
```bash
heroku logs --tail
heroku logs --source app --dyno web
```

**Fly.io:**
```bash
fly logs
```

---

## 🌍 Environment Setup

### Staging Environment

Create separate staging deployment:

```bash
# Railway
railway environment create staging
railway environment staging
railway up

# Heroku
heroku create virtual-budtender-staging
git push heroku staging:main

# Render
# Create separate service in dashboard
# Connect to staging branch
```

### Environment Variables by Environment

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| `NODE_ENV` | development | staging | production |
| `OPENAI_API_KEY` | Test key | Test key | Production key |
| `PORT` | 3001 | 3001 | 3001 |
| `FIREBASE_PROJECT_ID` | dev-project | staging-project | prod-project |

---

## 🚀 Quick Deploy Script

Create `scripts/deploy.sh`:

```bash
#!/bin/bash

# Quick deployment script
echo "🚀 Deploying Virtual Budtender Backend..."

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
  echo "❌ You have uncommitted changes. Commit or stash them first."
  exit 1
fi

# Run tests (if you have any)
echo "🧪 Running tests..."
npm test || exit 1

# Deploy based on platform
if command -v railway &> /dev/null; then
  echo "📦 Deploying to Railway..."
  railway up
elif command -v heroku &> /dev/null; then
  echo "📦 Deploying to Heroku..."
  git push heroku main
elif command -v flyctl &> /dev/null; then
  echo "📦 Deploying to Fly.io..."
  fly deploy
else
  echo "❌ No deployment platform found. Install Railway, Heroku, or Fly CLI."
  exit 1
fi

echo "✅ Deployment complete!"
echo "🔗 Don't forget to update VITE_API_URL in your frontend!"
```

Make it executable:
```bash
chmod +x scripts/deploy.sh
```

Use it:
```bash
./scripts/deploy.sh
```

---

## 📱 Update Frontend

After deploying backend, update your frontend `.env`:

```env
# Development
VITE_API_URL=http://localhost:3001

# Production
VITE_API_URL=https://your-backend.railway.app
```

Deploy frontend to:
- **Vercel** (recommended for React)
- **Netlify** (great for static sites)
- **Cloudflare Pages** (fast, free CDN)

---

## 🐛 Troubleshooting

### App Crashes on Startup

Check logs:
```bash
railway logs  # Railway
heroku logs --tail  # Heroku
fly logs  # Fly.io
```

Common issues:
- Missing environment variables
- Firebase private key formatting (must have `\n`)
- Port configuration (use `PORT` from env)

### CORS Errors

Update CORS in `backend/server.js`:
```javascript
app.use(cors({
  origin: 'https://your-frontend.com'
}));
```

### Firebase Connection Failed

Check:
- FIREBASE_PROJECT_ID matches your project
- FIREBASE_CLIENT_EMAIL is service account email
- FIREBASE_PRIVATE_KEY has `\n` properly escaped

### OpenAI API Errors

Verify:
- API key is valid
- Billing is enabled on OpenAI account
- Rate limits not exceeded

---

## 💰 Cost Comparison

| Platform | Free Tier | Paid Start | Best For |
|----------|-----------|------------|----------|
| **Railway** | $5 credit/month | $5/month | Development, small apps |
| **Render** | 750 hrs/month | $7/month | Side projects |
| **Heroku** | Limited | $7/month | Production apps |
| **Fly.io** | 3 VMs free | $1.94/month | Global apps |

**Recommendation:** Start with Railway (easiest) or Render (free tier).

---

## ✅ Post-Deployment Checklist

- [ ] Backend is deployed and accessible
- [ ] Health endpoint returns 200 OK
- [ ] All environment variables set
- [ ] CORS configured for your frontend
- [ ] Frontend updated with new API URL
- [ ] Test a full conversation flow
- [ ] Set up uptime monitoring
- [ ] Document your deployment
- [ ] Create staging environment
- [ ] Set up automatic backups (Firebase)

---

## 🎯 Next Steps

1. **Deploy backend** (choose Railway for fastest)
2. **Update frontend** with new API URL
3. **Test thoroughly** in production
4. **Set up monitoring** (UptimeRobot)
5. **Create staging environment** for testing
6. **Document** your production URLs

---

**Ready to deploy? Start with Railway - you can be live in 5 minutes! 🚀**

```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

