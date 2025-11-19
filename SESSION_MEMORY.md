# Session Memory Feature

The Virtual Budtender now includes **session-based memory** that persists conversations when the widget is closed and reopened, without storing data across page refreshes.

## How It Works

### ✅ Conversation Persists When:
- User closes the chat panel (clicks X button)
- User reopens the chat panel
- User switches between pages in a single-page app (SPA)
- User minimizes and maximizes the widget multiple times

### 🔄 Conversation Resets When:
- Page is refreshed (F5 or browser refresh)
- User navigates away and comes back (full page load)
- Browser is closed and reopened
- Session ends

## Technical Implementation

The chat panel is now **always mounted** but hidden with CSS when closed:

```jsx
// Before (state was lost on close):
{isOpen && <ChatPanel />}

// After (state persists):
<ChatPanel isOpen={isOpen} />
```

The panel uses CSS transitions to hide/show:
- `opacity-0 translate-x-full` when closed
- `opacity-100 translate-x-0` when open
- `pointer-events-none` when closed (prevents interaction)

## User Experience

### Scenario 1: Basic Usage
1. User opens widget, asks "What do you have for sleep?"
2. Bot responds with product recommendations
3. User closes widget to browse products
4. User reopens widget - **conversation is still there!**
5. User continues: "Show me more indica strains"

### Scenario 2: Multiple Sessions
1. User has conversation about sleep products
2. User refreshes the page
3. Widget shows fresh greeting - **conversation reset**
4. User starts new conversation

### Scenario 3: SPA Navigation
1. User on products page, opens chat
2. Asks about specific product
3. Navigates to cart page (SPA, no refresh)
4. Reopens chat - **conversation preserved**

## Benefits

### For Users
- ✅ Don't need to repeat questions
- ✅ Can reference earlier conversation
- ✅ Natural conversation flow
- ✅ Less frustration

### For Store Owners
- ✅ Better user experience
- ✅ Higher engagement
- ✅ More conversions
- ✅ Fewer repeated questions

### For Developers
- ✅ No database needed
- ✅ No localStorage clutter
- ✅ Privacy-friendly (nothing stored)
- ✅ Simple implementation

## Testing

### Test Session Persistence
1. Open widget and send a message
2. Close widget (click X)
3. Reopen widget
4. ✅ Previous message should still be visible

### Test Session Reset
1. Open widget and send a message
2. Refresh the page (F5)
3. Reopen widget
4. ✅ Should show fresh greeting, no previous messages

### Test Multiple Opens/Closes
1. Open widget, send message 1
2. Close widget
3. Open widget, send message 2
4. Close widget
5. Open widget
6. ✅ Should see both messages 1 and 2

## Implementation Details

### State Management
All conversation state lives in `ChatPanel` component:
- `messages` - Chat message history
- `conversationHistory` - API conversation context
- `inputValue` - Current input text
- `isLoading` - Loading state
- `expandedMessages` - Which product lists are expanded

### Lifecycle
1. **Component Mount** (page load)
   - Initialize with greeting message
   - Set `initializedRef.current = true`

2. **Panel Close** (user clicks X)
   - Panel slides out with animation
   - Component stays mounted (state preserved)
   - `isOpen={false}` but component exists

3. **Panel Open** (user clicks button)
   - Panel slides in with animation
   - Component is already mounted (state intact)
   - Automatically focuses input field

4. **Component Unmount** (page refresh/navigation)
   - All state is cleared
   - Next mount shows fresh greeting

## Customization

### Disable Session Memory
If you want the old behavior (reset on every close), modify BudtenderWidget:

```jsx
// Conditional rendering (resets on close)
{isOpen && <ChatPanel onClose={onClose} />}
```

### Persist Across Page Loads
To save conversations across page refreshes, you could add localStorage:

```jsx
// In ChatPanel, save to localStorage
useEffect(() => {
  localStorage.setItem('chatMessages', JSON.stringify(messages));
}, [messages]);

// Load from localStorage on init
useEffect(() => {
  const saved = localStorage.getItem('chatMessages');
  if (saved) setMessages(JSON.parse(saved));
}, []);
```

*Note: Not implemented by default for privacy reasons*

## Browser Support

Works in all modern browsers:
- Chrome/Edge (Chromium)
- Firefox
- Safari
- Mobile browsers

Uses standard CSS transitions, no special APIs needed.

## Performance

### Memory Usage
- Minimal - just keeping one component mounted
- State is simple arrays and objects
- No memory leaks (proper cleanup on unmount)

### Render Performance
- CSS transitions are GPU-accelerated
- No unnecessary re-renders
- Smooth 300ms animations

## Privacy

### What's Stored
- **In Memory Only**: Messages and conversation history
- **Location**: React component state
- **Duration**: Current session only

### What's NOT Stored
- ❌ No localStorage
- ❌ No sessionStorage
- ❌ No cookies
- ❌ No server-side storage
- ❌ No analytics tracking

## FAQ

**Q: Will conversations persist across tabs?**
A: No, each tab has its own session memory.

**Q: What happens on mobile when switching apps?**
A: Depends on OS. Usually persists if app stays in memory, resets if killed.

**Q: Can I clear the conversation manually?**
A: Yes, use the "Start Over" button in the chat panel.

**Q: Does this increase bundle size?**
A: No, it's just a different rendering pattern, no additional code.

**Q: Is this GDPR compliant?**
A: Yes, nothing is stored beyond the session, no personal data persistence.

## Migration

If you're upgrading from a previous version, no changes needed! The feature works automatically with both controlled and uncontrolled widget modes.

```jsx
// Works with external control
<BudtenderWidget isOpen={isOpen} onToggle={setIsOpen} />

// Works with internal control
<BudtenderWidget showButton={true} />
```

## Version

Session memory feature added in v1.0.1

---

**Summary**: Conversations now persist when closing and reopening the widget within the same session, making for a much better user experience! 🎉

