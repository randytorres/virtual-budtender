# Virtual Budtender - Library Usage Guide

Install the Virtual Budtender widget into your React application and trigger it from your own buttons!

## Installation

### Install from GitHub

```bash
npm install git+https://github.com/yourusername/virtual-budtender.git
```

Or with yarn:

```bash
yarn add git+https://github.com/yourusername/virtual-budtender.git
```

## Quick Start

### Basic Usage (Self-Contained Widget)

The simplest way to use the widget is to let it manage its own state with the built-in floating button:

```jsx
import { BudtenderWidget } from 'virtual-budtender';

function App() {
  return (
    <div>
      <h1>My Cannabis Store</h1>
      {/* Widget with default floating button */}
      <BudtenderWidget tenantId="ch" />
    </div>
  );
}

export default App;
```

### Advanced Usage (Custom Control)

Control when the widget opens from your own buttons:

```jsx
import { useState } from 'react';
import { BudtenderWidget } from 'virtual-budtender';

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div>
      <h1>My Cannabis Store</h1>
      
      {/* Your custom buttons */}
      <button onClick={() => setIsChatOpen(true)}>
        Need Help? Ask Our Budtender
      </button>
      
      <button onClick={() => setIsChatOpen(true)}>
        Get Product Recommendations
      </button>
      
      {/* Widget without default button, controlled externally */}
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

## Component Props

### BudtenderWidget

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tenantId` | string | `'ch'` | The tenant ID for backend API calls |
| `config` | object | `null` | Custom configuration (see below) |
| `isOpen` | boolean | `null` | External control: whether chat is open |
| `onToggle` | function | `null` | External control: callback when open state changes |
| `showButton` | boolean | `true` | Whether to show the default floating button |

### Configuration Object

Customize the widget's appearance and text:

```jsx
const customConfig = {
  displayName: 'Flight Club',
  buttonText: 'Ask the Budtender',
  buttonTextMobile: 'Ask Flight Club',
  greeting: "Welcome! I'm your virtual budtender. How can I help you today?"
};

<BudtenderWidget config={customConfig} />
```

## Usage Patterns

### Pattern 1: Always Available Widget

Widget is always present on your site with its own floating button:

```jsx
function App() {
  return (
    <div>
      {/* Your app content */}
      <YourMainContent />
      
      {/* Widget always available */}
      <BudtenderWidget tenantId="ch" />
    </div>
  );
}
```

### Pattern 2: Controlled by Multiple Buttons

Multiple buttons on your site can open the same widget:

```jsx
function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div>
      <header>
        <button onClick={() => setIsChatOpen(true)}>
          Chat Now
        </button>
      </header>
      
      <main>
        <p>Looking for something?</p>
        <button onClick={() => setIsChatOpen(true)}>
          Get Recommendations
        </button>
      </main>
      
      <footer>
        <button onClick={() => setIsChatOpen(true)}>
          Need Help?
        </button>
      </footer>
      
      {/* Single widget instance controlled by all buttons */}
      <BudtenderWidget 
        isOpen={isChatOpen}
        onToggle={setIsChatOpen}
        showButton={false}
      />
    </div>
  );
}
```

### Pattern 3: Conditional Widget

Show widget only on certain pages or conditions:

```jsx
function ProductPage() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const isProductPage = true; // Your logic here

  return (
    <div>
      <h1>Product Details</h1>
      
      <button onClick={() => setIsChatOpen(true)}>
        Ask about this product
      </button>
      
      {/* Only render widget on product pages */}
      {isProductPage && (
        <BudtenderWidget 
          isOpen={isChatOpen}
          onToggle={setIsChatOpen}
          showButton={false}
        />
      )}
    </div>
  );
}
```

### Pattern 4: Hybrid Approach

Combine your custom buttons with the default floating button:

```jsx
function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div>
      {/* Header with custom button */}
      <header>
        <button onClick={() => setIsChatOpen(true)}>
          Get Help
        </button>
      </header>
      
      {/* Widget with BOTH custom control AND default button */}
      <BudtenderWidget 
        isOpen={isChatOpen}
        onToggle={setIsChatOpen}
        showButton={true}  // Still shows floating button
      />
    </div>
  );
}
```

## Backend Setup

The widget requires a backend API to function. Make sure your backend is running:

### Environment Variables

Create a `.env` file with:

```env
VITE_API_URL=https://your-backend-url.com
OPENAI_API_KEY=your-openai-key
FIREBASE_PROJECT_ID=your-firebase-project
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
```

### Backend Server

The backend must be running and accessible:

```bash
npm run server
```

Or deploy to your hosting platform (see DEPLOYMENT.md for details).

## Styling

The widget comes with built-in Tailwind CSS styles. Make sure your app has Tailwind CSS configured, or the styles are already bundled with the widget.

### Custom Styling

The widget uses these CSS custom properties that you can override:

- `--ch-gold`: #F7D940
- `--ch-gold-light`: #F7E680
- `--ch-black`: #1a1a1a

Update your `tailwind.config.js` if you want to customize colors:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        'ch-gold': '#F7D940',
        'ch-gold-light': '#F7E680',
        'ch-black': '#1a1a1a',
      }
    }
  }
}
```

## TypeScript Support

TypeScript definitions are included. For full type safety:

```tsx
import { BudtenderWidget } from 'virtual-budtender';
import { useState } from 'react';

function App(): JSX.Element {
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  return (
    <BudtenderWidget 
      tenantId="ch"
      isOpen={isChatOpen}
      onToggle={setIsChatOpen}
      showButton={false}
    />
  );
}
```

## Troubleshooting

### Widget not appearing

1. Check that Tailwind CSS is configured in your project
2. Ensure the backend API URL is correctly set in environment variables
3. Verify the backend server is running and accessible

### Styles not working

1. Make sure Tailwind CSS is installed and configured
2. Check that your `postcss.config.js` includes Tailwind
3. Import the widget styles if using a custom build

### API errors

1. Verify `VITE_API_URL` environment variable is set
2. Check backend server logs for errors
3. Ensure CORS is properly configured on your backend

## Examples

Check out these example implementations:

- **Basic Integration**: See `examples/basic` directory
- **E-commerce Site**: See `examples/ecommerce` directory  
- **Multi-Page App**: See `examples/multi-page` directory

## Support

For issues, questions, or contributions, please visit:
https://github.com/yourusername/virtual-budtender

## License

See LICENSE file for details.

