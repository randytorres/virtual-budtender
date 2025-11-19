# Virtual Budtender - Quick Reference

## Installation

```bash
npm install git+https://github.com/yourusername/virtual-budtender.git
```

## Simplest Usage

```jsx
import { BudtenderWidget } from 'virtual-budtender';

function App() {
  return (
    <div>
      <h1>My Store</h1>
      <BudtenderWidget tenantId="ch" />
    </div>
  );
}
```

## With Custom Button

```jsx
import { useState } from 'react';
import { BudtenderWidget } from 'virtual-budtender';

function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>
        Ask Budtender
      </button>
      
      <BudtenderWidget 
        isOpen={isOpen}
        onToggle={setIsOpen}
        showButton={false}
      />
    </div>
  );
}
```

## Props Quick Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tenantId` | string | `'ch'` | Tenant identifier |
| `config` | object | `null` | Custom text/branding |
| `isOpen` | boolean | `null` | Control open state |
| `onToggle` | function | `null` | State change callback |
| `showButton` | boolean | `true` | Show floating button |

## Environment Setup

Create `.env`:

```env
VITE_API_URL=http://localhost:3001
```

## Backend Start

```bash
npm run server
```

## Build Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start demo app |
| `npm run build` | Build demo app |
| `npm run build:lib` | Build as library |
| `npm run server` | Start backend |

## Common Patterns

### Pattern 1: Self-Contained
Let widget manage itself:
```jsx
<BudtenderWidget />
```

### Pattern 2: Multiple Buttons
Many buttons, one widget:
```jsx
const [open, setOpen] = useState(false);

<button onClick={() => setOpen(true)}>Help</button>
<button onClick={() => setOpen(true)}>Recommend</button>
<BudtenderWidget isOpen={open} onToggle={setOpen} showButton={false} />
```

### Pattern 3: Conditional
Show on specific pages:
```jsx
{showOnThisPage && <BudtenderWidget />}
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Widget not showing | Check Tailwind CSS is configured |
| Styles broken | Add widget to Tailwind content array |
| API errors | Verify VITE_API_URL and backend is running |
| Build errors | Clear node_modules/.vite cache |

## Resources

- 📖 Full Docs: [LIBRARY_USAGE.md](./LIBRARY_USAGE.md)
- 💻 Examples: [INTEGRATION_EXAMPLE.jsx](./INTEGRATION_EXAMPLE.jsx)
- 🚀 Install Guide: [INSTALL_IN_REACT_APP.md](./INSTALL_IN_REACT_APP.md)
- 📝 Changes: [CHANGELOG_LIBRARY.md](./CHANGELOG_LIBRARY.md)

