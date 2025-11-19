import { useState, useEffect, useRef } from 'react';
import ProductCard from './ProductCard';

// Quick reply suggestions for common queries
const QUICK_REPLIES = [
  { label: '😴 Help me sleep', value: 'help me sleep better' },
  { label: '🧘 Relaxation', value: 'something for relaxation' },
  { label: '💆 Stress relief', value: 'need stress relief' },
  { label: '🎉 Social/party', value: 'something for socializing' },
  { label: '🎨 Focus & creativity', value: 'help me focus and be creative' },
  { label: '🌸 Show me flower', value: 'show me your best flower' },
  { label: '🚬 Pre-rolls', value: 'what pre-rolls do you have' },
  { label: '🍫 Edibles', value: 'looking for edibles' },
];

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Default config
const defaultConfig = {
  displayName: 'Flight Club',
  greeting: "Welcome to Flight Club! I'm your virtual budtender. 🌿\n\nI can help you find the perfect products based on what you're looking for. Just tell me what you need!\n\n(Psst... we refresh our menu nightly, so some items might fly off the shelves before we update! 🚀)"
};

function ChatPanel({ isOpen = true, onClose, tenantId = 'ch', config = null }) {
  const widgetConfig = config || defaultConfig;
  
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([]);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [expandedMessages, setExpandedMessages] = useState(new Set());
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const latestMessageRef = useRef(null);
  const inputRef = useRef(null);
  const initializedRef = useRef(false);

  const scrollToBottom = () => {
    // Scroll to bottom, but not aggressively (allow user to read)
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  // Initialize with greeting (only once per session, not on every open/close)
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      const combinedGreeting = `${widgetConfig.greeting}\n\nWhat can I help you find today? Feel free to ask me anything about our products! 💬`;
      setMessages([
        {
          type: 'bot',
          text: combinedGreeting
        }
      ]);
    }
  }, [widgetConfig.greeting]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Small delay to ensure panel is visible before focusing
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    // Smart scroll logic
    if (messages.length === 0) return;

    const latestMessage = messages[messages.length - 1];
    const hasRecommendations = latestMessage.recommendations && latestMessage.recommendations.length > 0;

    setTimeout(() => {
      if (hasRecommendations) {
        // If message has recommendations, scroll to the message text (not the bottom)
        // This keeps the bot's message visible while showing the start of product cards
        latestMessageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        // For messages without recommendations, scroll to bottom normally
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }, 100);
  }, [messages.length]);

  const handleQuickReply = (value) => {
    setInputValue(value);
    setShowQuickReplies(false);
    inputRef.current?.focus();
  };

  const handleSuggestedReply = (reply) => {
    // Send the suggested reply as a message immediately
    if (isLoading) return;
    
    const userMessage = reply.trim();

    // Add user message to UI
    setMessages(prev => [...prev, {
      type: 'user',
      text: userMessage
    }]);

    // Add to conversation history
    const newHistory = [...conversationHistory, { role: 'user', content: userMessage }];
    setConversationHistory(newHistory);

    // Get AI response
    setIsLoading(true);

    fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        tenantId,
        message: userMessage,
        conversationHistory: newHistory
      }),
    })
    .then(response => {
      if (!response.ok) throw new Error('Failed to get response');
      return response.json();
    })
    .then(data => {
      setMessages(prev => [...prev, {
        type: 'bot',
        text: data.message,
        recommendations: data.recommendations || [],
        suggestedReplies: data.suggestedReplies || []
      }]);
      setConversationHistory([...newHistory, { role: 'assistant', content: data.message }]);
    })
    .catch(error => {
      console.error('Error getting response:', error);
      setMessages(prev => [...prev, {
        type: 'bot',
        text: "Sorry, I had trouble processing that. Please try again or contact our team for help!"
      }]);
    })
    .finally(() => {
      setIsLoading(false);
    });
  };

  const toggleShowMore = (messageIndex) => {
    setExpandedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageIndex)) {
        newSet.delete(messageIndex);
      } else {
        newSet.add(messageIndex);
      }
      return newSet;
    });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setShowQuickReplies(false);

    // Add user message to UI
    setMessages(prev => [...prev, {
      type: 'user',
      text: userMessage
    }]);

    // Add to conversation history
    const newHistory = [...conversationHistory, { role: 'user', content: userMessage }];
    setConversationHistory(newHistory);

    // Get AI response
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          tenantId,
          message: userMessage,
          conversationHistory: newHistory
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      // Add bot response (keep all recommendations, we'll show 3 initially with "Show More")
      setMessages(prev => [...prev, {
        type: 'bot',
        text: data.message,
        recommendations: data.recommendations || [],
        suggestedReplies: data.suggestedReplies || []
      }]);

      // Update conversation history
      setConversationHistory([...newHistory, { role: 'assistant', content: data.message }]);

    } catch (error) {
      console.error('Error getting response:', error);
      setMessages(prev => [...prev, {
        type: 'bot',
        text: "Sorry, I had trouble processing that. Please try again or contact our team for help!"
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleReset = () => {
    setMessages([
      {
        type: 'bot',
        text: "Let's start fresh! What can I help you find? 🌿"
      }
    ]);
    setConversationHistory([]);
    setShowQuickReplies(true);
    setExpandedMessages(new Set());
  };

  return (
    <div className={`fixed bottom-4 right-4 w-[400px] max-w-[calc(100vw-2rem)] sm:w-[420px] h-[650px] max-h-[calc(100vh-6rem)] bg-white rounded-3xl shadow-2xl flex flex-col z-40 overflow-hidden border border-ch-gold/30 transition-all duration-300 ${isOpen ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 translate-x-full pointer-events-none'}`}>
      {/* Header */}
      <div className="bg-gradient-to-br from-ch-gold via-ch-gold-light to-ch-gold text-ch-black px-5 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <span className="text-xl">🌿</span>
          </div>
          <div>
            <h3 className="font-bold text-base">{widgetConfig.displayName}</h3>
            <p className="text-xs opacity-80">Your Virtual Budtender</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-ch-black hover:bg-white/20 rounded-full p-1.5 transition-all duration-200"
          aria-label="Close chat"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages Area */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50 to-white">
        {messages.map((message, idx) => (
          <div key={idx}>
            <div
              ref={idx === messages.length - 1 ? latestMessageRef : null}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                  message.type === 'user'
                    ? 'bg-gradient-to-br from-ch-gold to-ch-gold-light text-ch-black shadow-sm'
                    : 'bg-white text-gray-800 shadow-sm border border-gray-100'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-line">{message.text}</p>
                
                {/* Product count indicator */}
                {message.recommendations && message.recommendations.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-500 font-medium">
                      {message.recommendations.length > 3 
                        ? `${message.recommendations.length} recommendations below (showing 3) ⬇️`
                        : `${message.recommendations.length} recommendation${message.recommendations.length > 1 ? 's' : ''} below ⬇️`
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Recommendations for this message */}
            {message.recommendations && message.recommendations.length > 0 && (
              <div className="space-y-2 mt-2 ml-2">
                {message.recommendations
                  .slice(0, expandedMessages.has(idx) ? message.recommendations.length : 3)
                  .map((rec, recIdx) => (
                    <ProductCard key={recIdx} recommendation={rec} />
                  ))}
                
                {/* Show More button */}
                {message.recommendations.length > 3 && (
                  <button
                    onClick={() => toggleShowMore(idx)}
                    className="w-full px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-ch-gold/40 text-gray-700 hover:text-ch-black rounded-xl text-xs font-medium transition-all duration-200"
                  >
                    {expandedMessages.has(idx) 
                      ? `Show Less ▲` 
                      : `Show ${message.recommendations.length - 3} More ▼`}
                  </button>
                )}
              </div>
            )}

            {/* Contextual Suggested Replies (only for bot messages) */}
            {message.type === 'bot' && message.suggestedReplies && message.suggestedReplies.length > 0 && !isLoading && (
              <div className="mt-2 ml-2 flex flex-wrap gap-2">
                {message.suggestedReplies.map((reply, replyIdx) => (
                  <button
                    key={replyIdx}
                    onClick={() => handleSuggestedReply(reply)}
                    className="px-3 py-2 bg-gradient-to-r from-ch-gold/10 to-ch-gold-light/10 hover:from-ch-gold/20 hover:to-ch-gold-light/20 text-ch-black border border-ch-gold/30 hover:border-ch-gold rounded-lg text-xs font-medium transition-all duration-200 hover:shadow-sm"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start animate-fadeIn">
            <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-ch-gold rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-ch-gold rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-ch-gold rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      {showQuickReplies && !isLoading && (
        <div className="px-4 pb-2 bg-white">
          <div className="flex flex-wrap gap-1.5">
            {QUICK_REPLIES.map((reply, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickReply(reply.value)}
                className="px-2.5 py-1 bg-gray-100 hover:bg-ch-gold/20 text-gray-700 hover:text-ch-black rounded-full text-xs font-medium transition-all duration-200 border border-gray-200 hover:border-ch-gold/40"
              >
                {reply.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            disabled={isLoading}
            className="text-black flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ch-gold/50 focus:border-ch-gold transition-all disabled:opacity-50"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="px-4 py-2.5 bg-gradient-to-r from-ch-gold to-ch-gold-light hover:from-ch-gold-light hover:to-ch-gold text-ch-black rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        
        {/* Reset button below input */}
        {messages.length > 2 && (
          <button
            onClick={handleReset}
            className="w-full mt-2 px-3 py-1.5 text-xs text-gray-500 hover:text-ch-black hover:bg-gray-100 rounded-lg transition-all duration-200"
          >
            🔄 Start Over
          </button>
        )}
      </div>
    </div>
  );
}

export default ChatPanel;

