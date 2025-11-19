import { useState } from 'react';
import { BudtenderWidget } from 'virtual-budtender';

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Cannabis Healing</h1>
            <button
              onClick={() => setIsChatOpen(true)}
              className="bg-ch-gold hover:bg-ch-gold-light text-ch-black font-bold px-6 py-2 rounded-full transition-all duration-200"
            >
              🌿 Ask Budtender
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-6">
            Library Test App
          </h2>
          <p className="text-2xl text-ch-gold mb-4">
            Testing Virtual Budtender Integration
          </p>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            This is a test app to verify the virtual-budtender library works correctly when installed.
            Click any button to open the chat widget!
          </p>
        </div>

        {/* Test Buttons Grid */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {/* Button 1 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-3">Header Button</h3>
            <p className="text-gray-300 mb-4 text-sm">
              Tests the button in the header navigation
            </p>
            <button
              onClick={() => setIsChatOpen(true)}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Open from Here
            </button>
          </div>

          {/* Button 2 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-3">Content Button</h3>
            <p className="text-gray-300 mb-4 text-sm">
              Tests button in main content area
            </p>
            <button
              onClick={() => setIsChatOpen(true)}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Get Recommendations
            </button>
          </div>

          {/* Button 3 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-3">Help Button</h3>
            <p className="text-gray-300 mb-4 text-sm">
              Tests help/support button pattern
            </p>
            <button
              onClick={() => setIsChatOpen(true)}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Need Help?
            </button>
          </div>

          {/* Button 4 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-3">CTA Button</h3>
            <p className="text-gray-300 mb-4 text-sm">
              Tests call-to-action button
            </p>
            <button
              onClick={() => setIsChatOpen(true)}
              className="w-full bg-gradient-to-r from-ch-gold to-yellow-500 hover:from-yellow-500 hover:to-ch-gold text-ch-black font-semibold px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Find My Product
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <h3 className="text-2xl font-bold text-white mb-4">Integration Details</h3>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start">
              <span className="text-ch-gold font-bold mr-3">✓</span>
              <span>Widget imported from 'virtual-budtender' package</span>
            </li>
            <li className="flex items-start">
              <span className="text-ch-gold font-bold mr-3">✓</span>
              <span>Multiple buttons control single widget instance</span>
            </li>
            <li className="flex items-start">
              <span className="text-ch-gold font-bold mr-3">✓</span>
              <span>Default floating button hidden (showButton=false)</span>
            </li>
            <li className="flex items-start">
              <span className="text-ch-gold font-bold mr-3">✓</span>
              <span>Widget panel appears on right side</span>
            </li>
            <li className="flex items-start">
              <span className="text-ch-gold font-bold mr-3">✓</span>
              <span>State managed by parent component</span>
            </li>
          </ul>

          <div className="mt-6 p-4 bg-black/30 rounded-lg">
            <p className="text-sm text-gray-400 mb-2">Widget Status:</p>
            <p className="text-ch-gold font-mono">
              isOpen: {isChatOpen ? 'true' : 'false'}
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black/30 backdrop-blur-sm border-t border-white/10 mt-16">
        <div className="container mx-auto px-6 py-8 text-center">
          <p className="text-gray-400 mb-2">Virtual Budtender Library Test App</p>
          <button
            onClick={() => setIsChatOpen(true)}
            className="text-ch-gold hover:text-ch-gold-light font-semibold"
          >
            One more button in the footer →
          </button>
        </div>
      </footer>

      {/* The Virtual Budtender Widget - Controlled by all buttons above */}
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

