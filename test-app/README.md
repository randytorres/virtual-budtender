# Virtual Budtender - Test App

This is a simple test application to verify the virtual-budtender library works correctly when installed as a package.

## How to Use

### 1. Install Dependencies

From the test-app directory:

```bash
cd test-app
npm install
```

This will install the virtual-budtender library from the parent directory using `file:..`

### 2. Start the Backend

In one terminal, from the root directory:

```bash
cd ..
npm run server
```

The backend should start on http://localhost:3001

### 3. Start the Test App

In another terminal, from the test-app directory:

```bash
npm run dev
```

The test app will start on http://localhost:3000

### 4. Test the Integration

- Click any of the colored buttons to open the chat widget
- Verify the widget appears on the right side
- Test that the chat functionality works
- Check that multiple buttons all control the same widget instance

## What This Tests

✅ Package installation from local source
✅ Import statement: `import { BudtenderWidget } from 'virtual-budtender'`
✅ External state control (isOpen/onToggle props)
✅ Hiding default button (showButton=false)
✅ Multiple trigger buttons
✅ Tailwind CSS integration
✅ Widget positioning and styling

## Troubleshooting

**Widget not showing**: Make sure the backend is running on port 3001

**Style issues**: Check that Tailwind is configured correctly in tailwind.config.js

**Import errors**: Run `npm install` again in the test-app directory

## Expected Behavior

- All buttons should open the same chat widget
- Widget should appear as a panel on the right side
- No floating button should be visible (we're using showButton=false)
- Chat should work exactly as it does in the demo app
- State indicator at bottom should show isOpen status

