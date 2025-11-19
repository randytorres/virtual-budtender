# Quick Start Guide 🚀

Get the Virtual Budtender running in 5 minutes!

## 1. Install Dependencies

```bash
npm install
```

## 2. Set Up Your Environment

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` with:
- Your OpenAI API key (from https://platform.openai.com/api-keys)
- Your Firebase credentials (from Firebase Console → Project Settings → Service Accounts)

## 3. Import Your Products

Import Cannabis Healing's catalog:

```bash
npm run import-ch 2025-11-18-Inventory.csv
```

This adds all products with `tenantId: "ch"` for Cannabis Healing.

## 4. Start the Backend

In Terminal 1:

```bash
npm run server
```

Wait for: `🚀 Backend server running on http://localhost:3001`

## 5. Start the Frontend

In Terminal 2:

```bash
npm run dev
```

Wait for: `➜  Local:   http://localhost:5173/`

## 6. Try It Out!

Open http://localhost:5173 in your browser and click the golden "Ask the Budtender" button!

---

## Troubleshooting

**"Could not load default credentials"**
→ Check your `.env` file has all Firebase variables set correctly

**"Failed to get recommendations"**
→ Make sure the backend is running and OpenAI API key is valid

**"No products found"**
→ Run the CSV import script again

---

For detailed setup instructions, see [SETUP.md](./SETUP.md)

For project overview, see [README.md](./README.md)

For the original product requirements, see [PRD.md](./PRD.md)

