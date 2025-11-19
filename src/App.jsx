import BudtenderWidget from './components/BudtenderWidget'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-ch-black to-gray-900 flex items-center justify-center p-4">
      {/* Demo page content */}
      <div className="text-center max-w-4xl">
        <h1 className="text-5xl font-bold text-white mb-4">
          Cannabis Healing
        </h1>
        <p className="text-2xl text-ch-gold mb-8">
          Flight Club Virtual Budtender
        </p>
        <p className="text-lg text-gray-300 mb-12">
          Click the "Ask the Budtender" button in the bottom right to get personalized product recommendations!
        </p>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-left">
          <h2 className="text-2xl font-semibold text-ch-gold mb-4">How it works:</h2>
          <ol className="space-y-3 text-gray-200">
            <li className="flex items-start">
              <span className="text-ch-gold font-bold mr-3">1.</span>
              <span>Click the golden button to start a conversation</span>
            </li>
            <li className="flex items-start">
              <span className="text-ch-gold font-bold mr-3">2.</span>
              <span>Answer a few quick questions about what you're looking for</span>
            </li>
            <li className="flex items-start">
              <span className="text-ch-gold font-bold mr-3">3.</span>
              <span>Get 2-4 personalized product recommendations from our current inventory</span>
            </li>
            <li className="flex items-start">
              <span className="text-ch-gold font-bold mr-3">4.</span>
              <span>Browse products with images, prices, and THC levels</span>
            </li>
          </ol>
        </div>

        <div className="mt-8 text-sm text-gray-400">
          <p>This widget can be embedded on any website</p>
          <p className="mt-2">Powered by AI • Real-time inventory from Dutchie</p>
        </div>
      </div>

      {/* The Virtual Budtender Widget */}
      <BudtenderWidget />
    </div>
  )
}

export default App

