# Cannabis Healing Virtual Budtender 🌿

A virtual budtender widget for Cannabis Healing's website that provides personalized product recommendations.

## Features

- **Guided Q&A Flow**: Simple multiple-choice questions about goals, experience, format, and budget
- **Smart Recommendations**: AI-powered product suggestions based on user preferences
- **Real Inventory**: Syncs with Dutchie CSV exports
- **Modern UI**: Clean, branded chat interface with Flight Club aesthetic
- **Embeddable**: Can be installed as a React component in any React application

## Two Ways to Use This

### 🎨 Option 1: Embed in Your React App

Install the Virtual Budtender widget directly into your existing React application:

```bash
npm install git+https://github.com/randytorres/virtual-budtender.git
```

Then use it in your React components:

```jsx
import { BudtenderWidget } from 'virtual-budtender';
import { useState } from 'react';

function YourApp() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div>
      {/* Your custom button */}
      <button onClick={() => setIsChatOpen(true)}>
        Ask Our Budtender
      </button>

      {/* The widget */}
      <BudtenderWidget 
        tenantId="ch"
        isOpen={isChatOpen}
        onToggle={setIsChatOpen}
        showButton={false}
      />
    </div>
  );
}
```

📖 **See [LIBRARY_USAGE.md](./LIBRARY_USAGE.md) and [INTEGRATION_EXAMPLE.jsx](./INTEGRATION_EXAMPLE.jsx) for complete integration guide and examples.**

### 🚀 Option 2: Run as Standalone App

Develop and deploy the widget as a standalone application:

## Quick Start (Standalone)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here

# Firebase Config
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="your_private_key_here"

# Server Config
PORT=3001
```

### 3. Set Up Firebase

1. Create a Firebase project at https://console.firebase.google.com
2. Create a Firestore database
3. Generate a service account key (Project Settings > Service Accounts)
4. Add credentials to `.env`

### 4. Import Product Catalog

Import Cannabis Healing's products:

```bash
npm run import-ch 2025-11-18-Inventory.csv
```

Or use the full command with tenant ID:

```bash
npm run import-csv ch 2025-11-18-Inventory.csv
```

The tenant ID (`ch` = Cannabis Healing) allows the system to support multiple stores in the future.

### 5. Run the App

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Visit `http://localhost:5173` to see the widget!

## Project Structure

```
virtual-budtender/
├── backend/
│   └── server.js           # Express API with /recommend endpoint
├── scripts/
│   └── importCatalog.js    # CSV to Firestore import script
├── src/
│   ├── components/
│   │   ├── BudtenderWidget.jsx    # Main widget component
│   │   ├── ChatPanel.jsx          # Chat interface
│   │   └── ProductCard.jsx        # Product recommendation display
│   ├── App.jsx
│   └── main.jsx
├── index.html
└── package.json
```

## How It Works

1. **User visits website** → sees "Ask the Budtender" floating button
2. **Clicks button** → chat panel opens with guided questions
3. **Answers questions** → goal, experience level, format preference, budget
4. **Backend filters** → products based on stock, category, price, THC level
5. **LLM selects** → 2-4 best matches with personalized explanations
6. **User sees** → recommended products with images, prices, and buy links

## Updating Inventory

When CH exports a new CSV from Dutchie:

```bash
npm run import-ch path/to/new-inventory.csv
```

This will update the Firestore database with current stock levels and products.

## Multi-Tenant Ready

The system is built to support multiple dispensaries (SaaS-ready):

**Add a new store:**

1. Add tenant config to `backend/tenantConfig.js`:
```javascript
newstore: {
  name: 'New Store Name',
  displayName: 'Ask Your Budtender',
  colors: { primary: '#4CAF50', ... },
  // ... other config
}
```

2. Import their catalog:
```bash
npm run import-csv newstore path/to/their-inventory.csv
```

3. Embed widget with their tenant ID:
```javascript
<BudtenderWidget tenantId="newstore" />
```

That's it! No code changes needed.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: Firebase Firestore
- **AI**: OpenAI GPT-4
- **Data**: Dutchie CSV exports

## License

Proprietary - Cannabis Healing

