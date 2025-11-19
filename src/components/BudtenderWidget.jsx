import { useState } from 'react';
import ChatPanel from './ChatPanel';

function BudtenderWidget({ 
  tenantId = 'ch', 
  config = null,
  isOpen: externalIsOpen = null,  // Allow external control
  onToggle = null,                // External toggle handler
  showButton = true               // Whether to show the default button
}) {
  // Use internal state if not externally controlled
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  // Determine if we're using external or internal control
  const isControlled = externalIsOpen !== null && onToggle !== null;
  const isOpen = isControlled ? externalIsOpen : internalIsOpen;
  
  const handleToggle = (newState) => {
    if (isControlled) {
      onToggle(newState);
    } else {
      setInternalIsOpen(newState);
    }
  };

  // Default config for Cannabis Healing
  const defaultConfig = {
    displayName: 'Flight Club',
    buttonText: 'Ask the Budtender',
    buttonTextMobile: 'Ask Flight Club',
    greeting: "Welcome to Flight Club! I'm your virtual budtender. 🌿\n\nI can help you find the perfect products based on what you're looking for. Just tell me what you need!\n\n(Psst... we refresh our menu nightly, so some items might fly off the shelves before we update! 🚀)"
  };

  const widgetConfig = config || defaultConfig;

  return (
    <>
      {/* Floating trigger button - hidden when chat is open or showButton is false */}
      {showButton && !isOpen && (
        <button
          onClick={() => handleToggle(true)}
          className="fixed bottom-4 right-4 z-50 bg-gradient-to-br from-ch-gold via-ch-gold-light to-ch-gold hover:shadow-2xl text-ch-black font-bold px-5 py-3 sm:px-6 sm:py-4 rounded-full shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 border border-ch-gold-light/50"
          aria-label="Open virtual budtender"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <span className="text-xl sm:text-2xl">🌿</span>
          </div>
          <span className="hidden sm:inline text-sm">{widgetConfig.buttonText}</span>
          <span className="sm:hidden text-xs font-semibold">{widgetConfig.buttonTextMobile}</span>
        </button>
      )}

      {/* Chat panel - always mounted but hidden when closed to preserve state */}
      <ChatPanel 
        isOpen={isOpen}
        onClose={() => handleToggle(false)} 
        tenantId={tenantId}
        config={widgetConfig}
      />
    </>
  );
}

export default BudtenderWidget;

