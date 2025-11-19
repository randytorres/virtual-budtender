# Installing Virtual Budtender in Your React App

This guide walks you through installing and using the Virtual Budtender widget in your existing React application.

## Prerequisites

- A React application (Create React App, Next.js, Vite, etc.)
- Node.js 16+ and npm/yarn
- Tailwind CSS configured in your project (or install it)
- Backend API running (see Backend Setup below)

## Step-by-Step Installation

### Step 1: Install the Package

Install directly from GitHub:

```bash
npm install git+https://github.com/randytorres/virtual-budtender.git
```

Or with a specific branch/tag:

```bash
npm install git+https://github.com/yourusername/virtual-budtender.git#main
```

### Step 2: Ensure Tailwind CSS is Configured

The widget uses Tailwind CSS for styling. If you don't have it set up:

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Update `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    // Add the widget's components to the content
    "./node_modules/virtual-budtender/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        'ch-gold': '#F7D940',
        'ch-gold-light': '#F7E680',
        'ch-black': '#1a1a1a',
      }
    },
  },
  plugins: [],
}
```

### Step 3: Set Up Environment Variables

Create or update your `.env` file:

```env
VITE_API_URL=http://localhost:3001
# Or your deployed backend URL in production:
# VITE_API_URL=https://your-backend.herokuapp.com
```

### Step 4: Import and Use the Widget

#### Option A: With Your Own Buttons (Recommended)

```jsx
import { useState } from 'react';
import { BudtenderWidget } from 'virtual-budtender';

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Your header */}
      <header className="p-4 bg-gray-800">
        <nav className="flex justify-between items-center">
          <h1 className="text-white text-xl">My Dispensary</h1>
          
          {/* Custom button to open chat */}
          <button 
            onClick={() => setIsChatOpen(true)}
            className="bg-yellow-400 text-black px-4 py-2 rounded font-bold hover:bg-yellow-300"
          >
            🌿 Ask Budtender
          </button>
        </nav>
      </header>

      {/* Your content */}
      <main className="p-8">
        <h2 className="text-2xl mb-4">Product Catalog</h2>
        
        {/* Another button in your content */}
        <button 
          onClick={() => setIsChatOpen(true)}
          className="bg-green-500 text-white px-6 py-3 rounded-lg"
        >
          Get Personalized Recommendations
        </button>
      </main>

      {/* The widget - controlled by your state */}
      <BudtenderWidget 
        tenantId="ch"
        isOpen={isChatOpen}
        onToggle={setIsChatOpen}
        showButton={false}
      />
    </div>
  );
}

export default App;
```

#### Option B: With Default Floating Button

```jsx
import { BudtenderWidget } from 'virtual-budtender';

function App() {
  return (
    <div className="min-h-screen">
      <h1>My Dispensary Website</h1>
      {/* Your content here */}
      
      {/* Widget with built-in floating button */}
      <BudtenderWidget tenantId="ch" />
    </div>
  );
}

export default App;
```

## Backend Setup

The widget requires a backend API to function. You have two options:

### Option 1: Use the Included Backend

From the virtual-budtender directory:

```bash
# Set up backend environment variables
cp .env.example .env
# Edit .env with your API keys

# Install dependencies (if not already done)
npm install

# Start the backend server
npm run server
```

The server will run on `http://localhost:3001` by default.

### Option 2: Deploy Your Own Backend

Deploy the backend to Heroku, Render, Railway, or any Node.js hosting:

```bash
# From the virtual-budtender directory
git push heroku main
# Or follow your hosting provider's instructions
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## Configuration Options

### Basic Props

```jsx
<BudtenderWidget 
  tenantId="ch"              // Tenant ID for multi-tenant setups
  showButton={true}          // Show the default floating button
/>
```

### External Control

```jsx
const [isOpen, setIsOpen] = useState(false);

<BudtenderWidget 
  tenantId="ch"
  isOpen={isOpen}           // Control open state externally
  onToggle={setIsOpen}      // Callback when state changes
  showButton={false}        // Hide default button
/>
```

### Custom Configuration

```jsx
const customConfig = {
  displayName: 'My Dispensary',
  buttonText: 'Ask Our Expert',
  buttonTextMobile: 'Ask',
  greeting: 'Welcome! How can I help you find the perfect product today?'
};

<BudtenderWidget 
  tenantId="ch"
  config={customConfig}
/>
```

## Advanced Usage

### Multiple Trigger Points

Place buttons anywhere in your app that trigger the same widget:

```jsx
function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div>
      <header>
        <button onClick={() => setIsChatOpen(true)}>Help</button>
      </header>
      
      <main>
        <button onClick={() => setIsChatOpen(true)}>Get Recommendations</button>
      </main>
      
      <footer>
        <button onClick={() => setIsChatOpen(true)}>Contact</button>
      </footer>

      {/* Single widget instance */}
      <BudtenderWidget 
        isOpen={isChatOpen}
        onToggle={setIsChatOpen}
        showButton={false}
      />
    </div>
  );
}
```

### Conditional Display

Show the widget only on specific pages:

```jsx
import { useLocation } from 'react-router-dom';

function App() {
  const location = useLocation();
  const showWidget = ['/products', '/shop', '/cart'].includes(location.pathname);

  return (
    <div>
      {/* Your content */}
      
      {showWidget && <BudtenderWidget tenantId="ch" />}
    </div>
  );
}
```

### With React Router

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { BudtenderWidget } from 'virtual-budtender';

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home openChat={() => setIsChatOpen(true)} />} />
        <Route path="/products" element={<Products openChat={() => setIsChatOpen(true)} />} />
      </Routes>
      
      {/* Widget available on all routes */}
      <BudtenderWidget 
        isOpen={isChatOpen}
        onToggle={setIsChatOpen}
      />
    </BrowserRouter>
  );
}
```

## Troubleshooting

### Widget Not Showing

1. **Check Tailwind CSS is configured**: The widget needs Tailwind CSS to render properly
2. **Verify environment variables**: Make sure `VITE_API_URL` is set
3. **Check browser console**: Look for any error messages

### Styles Not Working

1. **Update Tailwind config**: Make sure the widget's files are in the `content` array
2. **Add custom colors**: Include the ch-gold colors in your Tailwind theme
3. **Check PostCSS**: Ensure postcss.config.js includes Tailwind

```js
// postcss.config.js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### API Connection Issues

1. **Backend not running**: Start the backend with `npm run server`
2. **CORS errors**: The backend includes CORS middleware, but check your config
3. **Wrong API URL**: Verify `VITE_API_URL` matches your backend location
4. **Environment variables not loading**: Restart your dev server after changing `.env`

### Build Issues

If you get errors when building for production:

```bash
# Make sure all dependencies are installed
npm install

# Clear cache and rebuild
rm -rf node_modules/.vite
npm run build
```

## Testing

Test the widget locally:

```bash
# Terminal 1 - Start backend
npm run server

# Terminal 2 - Start your React app
npm run dev
```

Visit your app and click the button to open the chat widget.

## Production Deployment

### 1. Deploy Backend

Deploy the backend first (see DEPLOYMENT.md):
- Heroku
- Railway
- Render
- AWS/GCP/Azure

### 2. Update Environment Variables

In your React app's production environment:

```env
VITE_API_URL=https://your-backend-url.herokuapp.com
```

### 3. Build and Deploy React App

```bash
npm run build
# Deploy the build folder to your hosting (Netlify, Vercel, etc.)
```

## Support

For issues or questions:

1. Check [LIBRARY_USAGE.md](./LIBRARY_USAGE.md) for detailed API documentation
2. See [INTEGRATION_EXAMPLE.jsx](./INTEGRATION_EXAMPLE.jsx) for code examples
3. Review [DEPLOYMENT.md](./DEPLOYMENT.md) for backend deployment
4. Open an issue on GitHub

## Next Steps

- Customize the widget config to match your brand
- Set up your product catalog in Firebase
- Configure tenant-specific settings
- Deploy to production

Happy budtending! 🌿

