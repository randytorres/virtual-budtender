# Test App - Quick Start Guide

A simple test application to verify the virtual-budtender library works before pushing to GitHub.

## 🚀 Quick Start

### Step 1: Install Test App Dependencies

```bash
cd test-app
npm install
```

This installs the virtual-budtender library from the parent directory using `file:..`

### Step 2: Start Backend (Terminal 1)

```bash
cd ..
npm run server
```

Backend runs on http://localhost:3001

### Step 3: Start Test App (Terminal 2)

```bash
cd test-app
npm run dev
```

Test app runs on http://localhost:3000

### Step 4: Test!

Open http://localhost:3000 and click any button. The widget should appear on the right side.

## ✅ What to Test

### Basic Functionality
- [ ] Click any button - widget opens
- [ ] Click X button - widget closes
- [ ] Multiple buttons all control same widget
- [ ] No floating button appears (we're using showButton=false)
- [ ] Widget appears on right side of screen
- [ ] Widget is responsive

### Chat Functionality
- [ ] Initial greeting appears
- [ ] Quick reply buttons work
- [ ] Can type and send messages
- [ ] AI responds with recommendations
- [ ] Product cards display correctly
- [ ] Images load (if available)
- [ ] Can start over conversation

### State Management
- [ ] Status indicator at bottom shows correct state
- [ ] Opening from different buttons maintains conversation
- [ ] Closing and reopening preserves chat history

## 📦 What This Tests

This test app simulates exactly how the library will be used when installed via GitHub:

```jsx
import { BudtenderWidget } from 'virtual-budtender';

// External control pattern
<BudtenderWidget 
  tenantId="ch"
  isOpen={isChatOpen}
  onToggle={setIsChatOpen}
  showButton={false}
/>
```

## 🎨 Test App Features

- **5 Test Buttons**: Header, content area, help, CTA, and footer
- **Visual Feedback**: Status indicator shows isOpen state
- **Beautiful UI**: Shows how widget integrates with modern designs
- **Documentation**: Lists all integration details tested

## 🐛 Troubleshooting

### Widget doesn't appear
- Check backend is running on port 3001
- Look for console errors in browser dev tools

### Styles look broken
- Clear browser cache
- Check that Tailwind is processing correctly

### Import errors
- Delete node_modules and package-lock.json
- Run `npm install` again

### Can't connect to backend
- Verify .env file exists in test-app directory with:
  ```
  VITE_API_URL=http://localhost:3001
  ```

## 📝 Next Steps

Once everything works in the test app:

1. ✅ All tests pass
2. Commit changes to git
3. Push to GitHub
4. Install in your real app using:
   ```bash
   npm install git+https://github.com/randytorres/virtual-budtender.git
   ```

## 🔍 File Structure

```
test-app/
├── src/
│   ├── App.jsx           # Main test app with 5 buttons
│   ├── main.jsx          # Entry point
│   └── index.css         # Tailwind imports
├── index.html
├── package.json          # Uses "virtual-budtender": "file:.."
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 💡 Tips

- The test app uses `file:..` to install from parent directory
- This is exactly how npm would install from GitHub
- Any changes to parent library will require `npm install` again in test-app
- The backend must be running for chat to work

## 🎯 Success Criteria

When all these work, your library is ready:

✅ Package installs without errors
✅ Import statement works
✅ Widget appears when buttons clicked
✅ Chat functionality works
✅ Styles display correctly
✅ Multiple buttons control same instance
✅ No console errors
✅ Backend communication works

---

**Ready to push to GitHub?** All tests passing means your library is production-ready! 🎉

