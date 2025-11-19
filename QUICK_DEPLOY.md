# ⚡ Quick Deploy - Get Live in 5 Minutes

Choose your platform and follow the steps below.

## 🚂 Railway (Fastest ⭐)

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Initialize project
railway init

# 4. Set environment variables (one command)
railway variables set \
  OPENAI_API_KEY=your_key \
  FIREBASE_PROJECT_ID=your_project \
  FIREBASE_CLIENT_EMAIL=your_email@project.iam.gserviceaccount.com \
  FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----" \
  NODE_ENV=production

# 5. Deploy!
railway up

# 6. Get your URL
railway domain
```

**✅ Done!** Copy your Railway URL and update frontend:
```env
VITE_API_URL=https://your-app.railway.app
```

---

## 🎨 Render

```bash
# 1. Push to GitHub
git add .
git commit -m "Deploy backend"
git push origin main

# 2. Go to https://render.com
# 3. Click "New +" → "Web Service"
# 4. Connect your GitHub repo
# 5. Render auto-detects render.yaml ✨
# 6. Add environment variables in dashboard:
#    - OPENAI_API_KEY
#    - FIREBASE_PROJECT_ID
#    - FIREBASE_CLIENT_EMAIL
#    - FIREBASE_PRIVATE_KEY
# 7. Click "Create Web Service"
```

**✅ Done!** Copy your Render URL:
```env
VITE_API_URL=https://your-app.onrender.com
```

---

## 💜 Heroku

```bash
# 1. Install Heroku CLI
brew install heroku/brew/heroku

# 2. Login
heroku login

# 3. Create app
heroku create virtual-budtender-api

# 4. Set environment variables
heroku config:set \
  OPENAI_API_KEY=your_key \
  FIREBASE_PROJECT_ID=your_project \
  FIREBASE_CLIENT_EMAIL=your_email \
  FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----" \
  NODE_ENV=production

# 5. Deploy
git push heroku main

# 6. Check it's running
heroku open
```

**✅ Done!** Your URL:
```env
VITE_API_URL=https://virtual-budtender-api.herokuapp.com
```

---

## ✈️ Fly.io

```bash
# 1. Install Fly CLI
brew install flyctl

# 2. Login
fly auth login

# 3. Launch (answer prompts)
fly launch

# 4. Set secrets
fly secrets set \
  OPENAI_API_KEY=your_key \
  FIREBASE_PROJECT_ID=your_project \
  FIREBASE_CLIENT_EMAIL=your_email \
  FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# 5. Deploy
fly deploy
```

**✅ Done!** Your URL:
```env
VITE_API_URL=https://your-app.fly.dev
```

---

## 🧪 Test Your Deployment

After deploying, test it:

```bash
# Health check
curl https://your-backend-url.com/health

# Should return:
# {"status":"ok","timestamp":"2025-11-19T..."}
```

Test in browser:
```
https://your-backend-url.com/health
```

---

## 🎯 Update Frontend

**Local Development** (`test-app/.env`):
```env
VITE_API_URL=https://your-backend-url.com
```

**Your Main App** (`.env`):
```env
VITE_API_URL=https://your-backend-url.com
```

**Test it:**
1. Start your frontend
2. Open widget
3. Send a message
4. Should get AI response with products!

---

## ⚡ One-Line Deploy

For subsequent deploys:

```bash
# Railway
railway up

# Heroku
git push heroku main

# Fly.io
fly deploy
```

---

## 🐛 Troubleshooting

### "Cannot find module" error
```bash
# Make sure package.json is in root
ls package.json

# Check dependencies are installed
npm install
```

### Firebase connection failed
```bash
# Check private key has \n properly escaped
railway variables set FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour\nkey\n-----END PRIVATE KEY-----"
```

### CORS error
Update `backend/server.js`:
```javascript
app.use(cors({
  origin: 'https://your-frontend.com'
}));
```

---

## 📊 View Logs

```bash
# Railway
railway logs

# Heroku
heroku logs --tail

# Fly.io
fly logs

# Render
# View in dashboard
```

---

## 🎉 You're Live!

Your backend is now running 24/7:
- ✅ Automatic restarts on crash
- ✅ HTTPS enabled
- ✅ Scalable
- ✅ Monitored

**Next steps:**
1. Set up uptime monitoring (UptimeRobot)
2. Create staging environment
3. Add rate limiting (see DEPLOYMENT_GUIDE.md)
4. Deploy frontend to Vercel/Netlify

---

**Need help?** See full guide in [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

