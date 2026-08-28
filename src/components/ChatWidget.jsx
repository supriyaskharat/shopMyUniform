// src/components/ChatWidget.jsx
// The floating AI customer support chat widget.
// Shows a chat bubble in the bottom-right corner when the user is logged in.
// Connects to the OpenAI-powered backend AI endpoint.

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, X, Send, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

// The first message shown when the user opens the chat
const INITIAL_MESSAGE = {
  role: 'bot',
  content: "Hi! I'm ShopMyUniform's AI assistant. I can help you find uniforms, check your order status, or answer questions about our policies. How can I help?",
};

function ChatWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Used to auto-scroll to the latest message
  const messagesEndRef = useRef(null);

  // Scroll to bottom whenever a new message is added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Only show the chat widget when the user is logged in
  if (!user) return null;

  // Convert our local message format to OpenAI's chat message format
  const buildHistory = () => {
    return messages
      .filter((m) => m.role !== 'bot' || messages.indexOf(m) !== 0) // Skip the initial greeting
      .map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));
  };

  const sendMessage = async () => {
    const trimmedMessage = inputValue.trim();
    if (!trimmedMessage || isLoading) return;

    // Add user's message to the chat
    const userMessage = { role: 'user', content: trimmedMessage };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Send message + conversation history to the backend AI endpoint
      const res = await api.post('/ai/chat', {
        message: trimmedMessage,
        history: buildHistory(),
      });

      const botMessage = { role: 'bot', content: res.data.data.reply };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('AI chat request failed:', error);
      const errorMessage = {
        role: 'bot',
        content: 'Sorry, something went wrong. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Allow sending message by pressing Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-widget">
      {/* Chat Window — shown when isOpen is true */}
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <span><Bot size={16} /> ShopMyUniform Support</span>
            <button className="chat-header-close" onClick={() => setIsOpen(false)}><X size={16} /></button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.role}`}>
                {msg.role === 'bot' ? (
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>
            ))}

            {/* Show animated typing dots while waiting for AI response */}
            {isLoading && (
              <div className="typing-indicator">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            )}

            {/* Invisible div at the bottom used for auto-scrolling */}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-row">
            <input
              className="chat-input"
              type="text"
              placeholder="Ask about products, orders..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            <button className="chat-send-btn" onClick={sendMessage} disabled={isLoading}>
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Floating bubble button */}
      <button
        className="chat-bubble-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        title="Chat with our AI support"
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}

export default ChatWidget;
