# Setup Guide - Virtual Budtender

## Prerequisites

- Node.js 18+ installed
- Firebase account
- OpenAI API key

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Firebase

1. Go to https://console.firebase.google.com
2. Create a new project (or use existing)
3. Create a Cloud Firestore database:
   - Click "Firestore Database" in the left sidebar
   - Click "Create database"
   - Start in **production mode**
   - Choose a location close to you
4. Generate service account credentials:
   - Go to Project Settings (gear icon) → Service Accounts
   - Click "Generate new private key"
   - Save the JSON file securely (don't commit it!)

### 3. Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key (you won't be able to see it again!)

### 4. Create Environment File

Create a `.env` file in the root directory:

```env
# OpenAI API Key
OPENAI_API_KEY=sk-proj-...your_key_here

# Firebase Config (from the service account JSON you downloaded)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# Server Config
PORT=3001
```

**Important Notes:**
- The `FIREBASE_PRIVATE_KEY` must be wrapped in quotes and include the `\n` characters
- Get these values from the JSON file Firebase gave you:
  - `project_id` → `FIREBASE_PROJECT_ID`
  - `client_email` → `FIREBASE_CLIENT_EMAIL`
  - `private_key` → `FIREBASE_PRIVATE_KEY`

### 5. Import Product Catalog

Run the import script with tenant ID and CSV file:

```bash
npm run import-ch 2025-11-18-Inventory.csv
```

Or use the full command:

```bash
npm run import-csv ch 2025-11-18-Inventory.csv
```

The `ch` parameter is the tenant ID for Cannabis Healing. This allows the system to support multiple stores.

You should see output like:

```
📄 Reading CSV from: 2025-11-18-Inventory.csv
🏪 Tenant ID: ch
📊 Found 120 rows in CSV
✅ 87 products to import
⏭️  33 products skipped (out of stock or not available online)
💾 Writing to Firestore...
✅ Import complete!

Breakdown by category:
  flower: 25
  pre-roll: 40
  accessory: 22
```

### 6. Start the Application

You need to run both the backend and frontend:

**Terminal 1 - Backend API:**
```bash
npm run server
```

You should see:
```
🚀 Backend server running on http://localhost:3001
📍 Endpoints:
   GET  /health
   GET  /products
   POST /recommend
```

**Terminal 2 - Frontend (in a new terminal):**
```bash
npm run dev
```

You should see:
```
  VITE v5.2.11  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 7. Test It Out!

1. Open http://localhost:5173 in your browser
2. Click the "Ask the Budtender" button (golden button in bottom right)
3. Answer the questions:
   - What are you looking for? (e.g., "Better Sleep")
   - Experience level? (e.g., "Casual User")
   - Format preference? (e.g., "Pre-Roll")
   - Budget? (e.g., "$25-$50")
4. See personalized recommendations!

## Troubleshooting

### "Error: Could not load the default credentials"

This means Firebase credentials are not set up correctly. Check:
- `.env` file exists in root directory
- `FIREBASE_PRIVATE_KEY` has the `\n` characters and is wrapped in quotes
- All three Firebase variables are set

### "Failed to get recommendations"

Check:
1. Backend is running on port 3001
2. Check backend terminal for error messages
3. Verify OpenAI API key is valid
4. Check that products were imported to Firestore

### "No products found"

This means no products match your filters. Try:
- Choosing "Any Format" or "No Preference" for budget
- Make sure you ran the CSV import script
- Check Firestore console to verify products exist

### CORS errors

If you see CORS errors in the browser console:
- Make sure backend is running
- Check that API_URL in `src/components/ChatPanel.jsx` matches your backend URL

## Updating Inventory

When you get a new CSV export from Dutchie:

```bash
npm run import-ch path/to/new-inventory.csv
```

This will update/add products without deleting old ones. If you want a fresh start, delete all products with `tenantId: "ch"` in Firestore first.

## Multi-Tenant Support

The system is built to support multiple dispensaries. See [MULTI_TENANT.md](./MULTI_TENANT.md) for details.

**Quick example - adding a second store:**

1. Add config to `backend/tenantConfig.js`
2. Import their catalog: `npm run import-csv newstore inventory.csv`
3. Use widget: `<BudtenderWidget tenantId="newstore" />`

That's it!

## Production Deployment

### Backend (Express API)

Deploy to:
- **Railway**: Easy, auto-deploys from GitHub
- **Render**: Free tier available
- **Cloud Run**: Google Cloud, serverless
- **Heroku**: Classic option

Set environment variables in your deployment platform.

### Frontend (Vite/React)

Deploy to:
- **Vercel**: Easiest, auto-deploys from GitHub
- **Netlify**: Also very easy
- **Firebase Hosting**: Since you're using Firebase

Before deploying frontend, update the `API_URL` in `src/components/ChatPanel.jsx` to your production backend URL.

### Embedding on Cannabis Healing Website

Once deployed, add this snippet to any page:

```html
<div id="virtual-budtender-root"></div>
<script type="module" src="https://your-domain.com/widget.js"></script>
```

(You'll need to build a standalone widget bundle - let me know if you need help with this!)

## Next Steps

- Set up automatic daily CSV imports
- Add analytics tracking
- Create admin dashboard for viewing recommendations
- Add more sophisticated product matching
- Build embeddable widget version
- Add A/B testing for different prompts

## Need Help?

Check the main README.md for more information or reach out if you hit any issues!

