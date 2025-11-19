# Deployment Guide

## Overview

The app consists of two parts:
1. **Backend API** (Express + Node.js) - needs to be deployed to a server
2. **Frontend Widget** (React + Vite) - needs to be deployed to a static host

## Backend Deployment Options

### Option 1: Railway (Recommended - Easiest)

1. Push your code to GitHub
2. Go to https://railway.app
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add environment variables in Railway dashboard:
   - `OPENAI_API_KEY`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`
   - `PORT` (Railway sets this automatically)
6. Set root directory to `/` and start command to `npm run server`
7. Railway will give you a URL like: `https://your-app.up.railway.app`

### Option 2: Render.com

1. Push code to GitHub
2. Go to https://render.com
3. New → Web Service → Connect GitHub repo
4. Settings:
   - **Build Command**: `npm install`
   - **Start Command**: `npm run server`
   - **Environment**: Node
5. Add environment variables (same as Railway)
6. Deploy!

### Option 3: Google Cloud Run

1. Install Google Cloud CLI
2. Build container:
   ```bash
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/virtual-budtender
   ```
3. Deploy:
   ```bash
   gcloud run deploy virtual-budtender \
     --image gcr.io/YOUR_PROJECT_ID/virtual-budtender \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```
4. Set environment variables in Cloud Run console

## Frontend Deployment Options

### Option 1: Vercel (Recommended)

1. Push code to GitHub
2. Go to https://vercel.com
3. Import your GitHub repository
4. Vercel auto-detects Vite
5. **Important**: Add environment variable:
   - `VITE_API_URL` = your backend URL (e.g., `https://your-app.up.railway.app`)
6. Update `src/components/ChatPanel.jsx`:
   ```javascript
   const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
   ```
7. Deploy!

### Option 2: Netlify

1. Push code to GitHub
2. Go to https://netlify.com
3. New site from Git → Select repository
4. Build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Add environment variable:
   - `VITE_API_URL` = your backend URL
6. Deploy!

### Option 3: Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy --only hosting
```

## Post-Deployment Checklist

- [ ] Backend is running and `/health` endpoint returns 200
- [ ] Frontend can reach backend (check browser console for CORS errors)
- [ ] Environment variables are set correctly
- [ ] Test the full recommendation flow
- [ ] Set up monitoring/logging (optional but recommended)

## Embedding on Cannabis Healing Website

### Option A: Iframe (Simplest)

Add this to any page:

```html
<iframe 
  src="https://your-frontend-url.vercel.app" 
  style="position: fixed; bottom: 0; right: 0; width: 100vw; height: 100vh; border: none; pointer-events: none; z-index: 9999;"
  id="budtender-iframe"
></iframe>

<script>
  // Allow clicks only on the widget
  const iframe = document.getElementById('budtender-iframe');
  iframe.contentWindow.addEventListener('message', (event) => {
    if (event.data === 'widget-opened') {
      iframe.style.pointerEvents = 'all';
    } else if (event.data === 'widget-closed') {
      iframe.style.pointerEvents = 'none';
    }
  });
</script>
```

### Option B: Direct Embed (Better)

Build a standalone widget bundle and load it:

1. Update `vite.config.js` for library mode:
```javascript
export default defineConfig({
  build: {
    lib: {
      entry: 'src/widget.js',
      name: 'VirtualBudtender',
      fileName: 'widget',
    },
  },
})
```

2. Create `src/widget.js`:
```javascript
import { createRoot } from 'react-dom/client';
import BudtenderWidget from './components/BudtenderWidget';

const container = document.createElement('div');
container.id = 'virtual-budtender-widget';
document.body.appendChild(container);

createRoot(container).render(<BudtenderWidget />);
```

3. Build: `npm run build`

4. Host the built files and add to CH website:
```html
<script type="module" src="https://your-cdn.com/widget.js"></script>
```

## Monitoring & Analytics

### Add Request Logging

In `backend/server.js`, add:

```javascript
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});
```

### Track Recommendations

Add a simple analytics endpoint:

```javascript
app.post('/analytics/recommendation-shown', async (req, res) => {
  const { recommendationId, userId } = req.body;
  // Log to Firestore or analytics service
  await db.collection('analytics').add({
    type: 'recommendation-shown',
    recommendationId,
    userId,
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });
  res.json({ success: true });
});
```

### Set Up Alerts

Use your deployment platform's built-in monitoring:
- **Railway**: Built-in metrics
- **Render**: Monitoring tab
- **Cloud Run**: Cloud Monitoring

Set up alerts for:
- API response time > 2s
- Error rate > 5%
- No requests for > 1 hour (might indicate downtime)

## Updating Inventory

### Manual Updates

SSH into your backend server or use Railway CLI:

```bash
railway run npm run import-csv latest-inventory.csv
```

### Automated Updates (Future)

Create a Cloud Function or cron job:

```javascript
// Cloud Function triggered daily
export const importInventory = functions.pubsub
  .schedule('0 2 * * *') // 2 AM daily
  .onRun(async (context) => {
    // Fetch CSV from Dutchie API
    // Parse and import to Firestore
  });
```

## Security Considerations

- [ ] Keep `.env` file out of git (already in `.gitignore`)
- [ ] Use environment variables for all secrets
- [ ] Enable CORS only for your domains in production
- [ ] Rate limit the `/recommend` endpoint
- [ ] Set up Firebase security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{productId} {
      allow read: if true;  // Public read
      allow write: if false;  // No public writes
    }
  }
}
```

## Cost Estimates

### Backend (Railway/Render Free Tier)
- **Railway**: $5/month (500 hours free)
- **Render**: Free tier available
- **Cloud Run**: Pay per request (~$0.40 per million requests)

### OpenAI API
- **GPT-4**: ~$0.03 per recommendation
- **GPT-3.5-turbo**: ~$0.002 per recommendation (if you switch)
- 1000 recommendations/month = $30 (GPT-4) or $2 (GPT-3.5)

### Firebase
- **Firestore**: Free up to 50k reads/day
- **Hosting**: Free up to 10GB transfer/month

### Total: ~$5-35/month depending on usage

## Performance Optimization

1. **Cache Products in Backend**:
   ```javascript
   let productCache = null;
   let cacheTime = 0;
   const CACHE_TTL = 1000 * 60 * 30; // 30 minutes
   
   async function getProducts() {
     if (productCache && Date.now() - cacheTime < CACHE_TTL) {
       return productCache;
     }
     productCache = await db.collection('products').get();
     cacheTime = Date.now();
     return productCache;
   }
   ```

2. **Add CDN for Frontend** (Vercel/Netlify do this automatically)

3. **Compress API Responses**:
   ```javascript
   import compression from 'compression';
   app.use(compression());
   ```

## Need Help?

If you run into issues during deployment, check:
1. Environment variables are set correctly
2. Backend can reach Firestore
3. Frontend can reach backend (check CORS)
4. All API keys are valid

Good luck! 🚀

