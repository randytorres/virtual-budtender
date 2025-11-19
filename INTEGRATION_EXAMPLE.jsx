// ============================================
// INTEGRATION EXAMPLE - Copy this to your React app
// ============================================

import { useState } from 'react';
import { BudtenderWidget } from 'virtual-budtender';

// Example 1: Basic - Widget manages itself with floating button
export function Example1_Basic() {
  return (
    <div>
      <h1>My Cannabis Store</h1>
      <p>The widget will appear as a floating button in the bottom right</p>
      
      <BudtenderWidget tenantId="ch" />
    </div>
  );
}

// Example 2: Custom Buttons - Control widget from your own buttons
export function Example2_CustomButtons() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div>
      <header className="p-4 bg-gray-800 text-white">
        <nav className="flex justify-between items-center">
          <h1>My Store</h1>
          <button 
            onClick={() => setIsChatOpen(true)}
            className="bg-yellow-400 text-black px-4 py-2 rounded"
          >
            Ask Budtender
          </button>
        </nav>
      </header>

      <main className="p-8">
        <h2>Product Catalog</h2>
        
        {/* Multiple buttons can open the same widget */}
        <button 
          onClick={() => setIsChatOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
        >
          Get Recommendations
        </button>
        
        <button 
          onClick={() => setIsChatOpen(true)}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Need Help?
        </button>
      </main>

      {/* Widget controlled externally, no default button */}
      <BudtenderWidget 
        tenantId="ch"
        isOpen={isChatOpen}
        onToggle={setIsChatOpen}
        showButton={false}
      />
    </div>
  );
}

// Example 3: Custom Configuration
export function Example3_CustomConfig() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const customConfig = {
    displayName: 'My Dispensary',
    buttonText: 'Chat with Expert',
    buttonTextMobile: 'Chat',
    greeting: "Hi there! I'm here to help you find the perfect cannabis products. What are you looking for today?"
  };

  return (
    <div>
      <h1>Welcome to My Dispensary</h1>
      
      <button onClick={() => setIsChatOpen(true)}>
        Talk to an Expert
      </button>

      <BudtenderWidget 
        tenantId="ch"
        config={customConfig}
        isOpen={isChatOpen}
        onToggle={setIsChatOpen}
        showButton={false}
      />
    </div>
  );
}

// Example 4: Conditional Widget (show only on certain pages)
export function Example4_ConditionalWidget() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const currentPage = 'products'; // Your routing logic
  const showWidget = ['products', 'product-detail', 'cart'].includes(currentPage);

  return (
    <div>
      <h1>Product Page</h1>
      
      {showWidget && (
        <>
          <button onClick={() => setIsChatOpen(true)}>
            Ask about this product
          </button>

          <BudtenderWidget 
            isOpen={isChatOpen}
            onToggle={setIsChatOpen}
            showButton={false}
          />
        </>
      )}
    </div>
  );
}

// Example 5: Hybrid (custom buttons + floating button)
export function Example5_Hybrid() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div>
      <header>
        {/* Your custom button in header */}
        <button onClick={() => setIsChatOpen(true)}>
          Quick Help
        </button>
      </header>

      {/* Widget also shows its default floating button */}
      <BudtenderWidget 
        isOpen={isChatOpen}
        onToggle={setIsChatOpen}
        showButton={true}
      />
    </div>
  );
}

// ============================================
// SETUP INSTRUCTIONS
// ============================================

/*

1. Install the package:
   npm install git+https://github.com/yourusername/virtual-budtender.git

2. Make sure your project has Tailwind CSS configured
   
3. Set up environment variables (.env):
   VITE_API_URL=http://localhost:3001  # or your deployed backend URL

4. Import and use in your React component:
   import { BudtenderWidget } from 'virtual-budtender';

5. Start your backend server:
   npm run server

6. Use any of the examples above!

*/

