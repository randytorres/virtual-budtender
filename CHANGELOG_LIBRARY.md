# Virtual Budtender - Library Conversion Changelog

## Summary

The Virtual Budtender has been enhanced to function both as a standalone application AND as an installable React component that can be embedded in other React applications.

## What Changed

### 1. New Library Entry Point
- **File**: `src/lib/index.js`
- **Purpose**: Main export point for the library
- **Exports**: BudtenderWidget, ChatPanel, ProductCard components

### 2. Enhanced BudtenderWidget Component
- **File**: `src/components/BudtenderWidget.jsx`
- **New Props**:
  - `isOpen`: External control of open/closed state
  - `onToggle`: Callback function when state changes
  - `showButton`: Whether to display the default floating button
- **Behavior**: Can now be controlled both internally (self-contained) and externally (from parent components)

### 3. Package Configuration
- **File**: `package.json`
- **Changes**:
  - Added `main` and `module` fields for library distribution
  - Added `exports` field for modern module resolution
  - Moved React/ReactDOM to `peerDependencies`
  - Added `build:lib` script for library builds
  - Added `files` field to specify what gets published

### 4. Library Build Configuration
- **File**: `vite.config.lib.js`
- **Purpose**: Separate Vite config for building as a library
- **Output**: ES and UMD module formats with sourcemaps

### 5. Widget-Specific Styles
- **File**: `src/lib/widget.css`
- **Purpose**: Styles for the widget without demo page styles
- **Includes**: Tailwind directives, animations, custom scrollbar

### 6. Documentation
- **LIBRARY_USAGE.md**: Complete API documentation and usage patterns
- **INTEGRATION_EXAMPLE.jsx**: Copy-paste ready examples
- **INSTALL_IN_REACT_APP.md**: Step-by-step installation guide
- **Updated README.md**: Added library usage section

## Usage Modes

### Mode 1: Standalone Application (Original Behavior)
```bash
npm run dev
```
Works exactly as before - demo page with floating button.

### Mode 2: Embedded Library (New Feature)
```bash
# In another React app
npm install git+https://github.com/yourusername/virtual-budtender.git
```

Then import and use:
```jsx
import { BudtenderWidget } from 'virtual-budtender';
<BudtenderWidget tenantId="ch" />
```

## Integration Patterns

### Pattern A: Self-Contained (Backward Compatible)
Widget manages its own state with built-in floating button:
```jsx
<BudtenderWidget tenantId="ch" />
```

### Pattern B: External Control (New)
Parent component controls when widget opens:
```jsx
const [isOpen, setIsOpen] = useState(false);
<button onClick={() => setIsOpen(true)}>Ask Budtender</button>
<BudtenderWidget 
  isOpen={isOpen}
  onToggle={setIsOpen}
  showButton={false}
/>
```

### Pattern C: Hybrid
Combine custom triggers with default button:
```jsx
const [isOpen, setIsOpen] = useState(false);
<button onClick={() => setIsOpen(true)}>Quick Help</button>
<BudtenderWidget 
  isOpen={isOpen}
  onToggle={setIsOpen}
  showButton={true}  // Still shows floating button
/>
```

## Build Commands

### Development (Standalone App)
```bash
npm run dev          # Start demo app
npm run server       # Start backend
```

### Production (Standalone App)
```bash
npm run build        # Build demo app for deployment
```

### Library Build (For Distribution)
```bash
npm run build:lib    # Build as library
```

This generates:
- `dist/virtual-budtender.es.js` - ES module
- `dist/virtual-budtender.umd.js` - UMD module
- `dist/style.css` - Bundled styles
- Source maps for debugging

## Breaking Changes

**None!** All changes are backward compatible:
- Original demo app still works the same
- Default behavior unchanged
- New props are optional

## Migration Guide

### For Existing Standalone Deployments
No changes needed - everything works as before.

### For New Embedded Usage
Follow the installation guide in INSTALL_IN_REACT_APP.md

## File Structure

```
virtual-budtender/
├── src/
│   ├── lib/
│   │   ├── index.js          # NEW: Library entry point
│   │   └── widget.css        # NEW: Widget-specific styles
│   ├── components/
│   │   ├── BudtenderWidget.jsx  # UPDATED: External control support
│   │   ├── ChatPanel.jsx
│   │   └── ProductCard.jsx
│   ├── App.jsx               # Demo app (unchanged)
│   ├── main.jsx              # Demo entry (unchanged)
│   └── index.css             # Demo styles (unchanged)
├── vite.config.js            # Original config for demo app
├── vite.config.lib.js        # NEW: Library build config
├── package.json              # UPDATED: Library metadata
├── LIBRARY_USAGE.md          # NEW: API documentation
├── INTEGRATION_EXAMPLE.jsx   # NEW: Usage examples
├── INSTALL_IN_REACT_APP.md   # NEW: Installation guide
└── README.md                 # UPDATED: Added library section
```

## Testing

### Test Standalone App
```bash
npm run server  # Terminal 1
npm run dev     # Terminal 2
```
Visit http://localhost:5173 - should work as before.

### Test Library Build
```bash
npm run build:lib
ls -la dist/
```
Should see:
- virtual-budtender.es.js
- virtual-budtender.umd.js
- style.css

### Test Integration
Create a new React app and follow INSTALL_IN_REACT_APP.md

## Next Steps

1. **Update GitHub URL**: Replace `yourusername` in docs with actual username
2. **Test in Real Project**: Install in an actual React app
3. **Publish to npm** (optional): For easier installation
4. **Add TypeScript Definitions** (future): For better DX
5. **Create More Examples** (future): Different integration patterns

## Support

- **Documentation**: See LIBRARY_USAGE.md
- **Examples**: See INTEGRATION_EXAMPLE.jsx
- **Installation**: See INSTALL_IN_REACT_APP.md
- **Deployment**: See DEPLOYMENT.md

## Version

Current version: 1.0.0 (with library support)

Date: November 19, 2025

