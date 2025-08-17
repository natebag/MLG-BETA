import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Minus, Send } from 'lucide-react';
import { useChat } from '../contexts/ChatContext';
import { useUser } from '../contexts/UserContext';
import { openUserProfile } from './UserProfileModal';

const Chat: React.FC = () => {
  const { user } = useUser();
  const { 
    messages, 
    currentChannel, 
    isOpen, 
    isMinimized,
    sendMessage, 
    setCurrentChannel, 
    toggleChat, 
    toggleMinimize 
  } = useChat();
  
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages[currentChannel]]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !user) return;
    
    await sendMessage(currentChannel, inputMessage);
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleUsernameClick = (userId: string) => {
    if (userId !== user?.id) {
      openUserProfile(userId);
    }
  };

  if (!user) return null;

  if (!isOpen) {
    return (
      <button
        onClick={toggleChat}
        className="fixed bottom-5 right-5 bg-green-600 hover:bg-green-500 text-white p-3 rounded-full shadow-lg transition-all hover:scale-110 z-40"
      >
        <MessageCircle size={24} />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-5 right-5 w-96 bg-gray-800 border-2 border-green-600 rounded-lg shadow-xl z-50 transition-all ${
      isMinimized ? 'h-14' : 'h-96'
    }`}>
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 bg-gradient-to-r from-green-800 to-green-900 rounded-t-lg cursor-pointer"
        onClick={toggleMinimize}
      >
        <div className="flex items-center gap-2">
          <MessageCircle size={20} />
          <span className="font-bold">MLG Chat</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleMinimize();
            }}
            className="text-yellow-400 hover:text-yellow-300 transition-colors"
          >
            <Minus size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleChat();
            }}
            className="text-red-400 hover:text-red-300 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Channel Tabs */}
          <div className="flex bg-gray-700 border-b border-gray-600">
            {['trollbox', 'clan'].map((channel) => (
              <button
                key={channel}
                onClick={() => setCurrentChannel(channel)}
                className={`flex-1 px-3 py-2 text-xs font-medium capitalize transition-colors ${
                  currentChannel === channel
                    ? 'bg-green-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-600'
                }`}
              >
                {channel}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 h-64 bg-gray-900">
            {currentChannel === 'trollbox' && (
              <div className="text-center text-gray-400 text-xs mb-3">
                Welcome to the Trollbox! Be respectful.
              </div>
            )}
            
            {(messages[currentChannel] || []).map((msg, index) => (
              <div key={index} className="mb-2 text-sm">
                <span className="text-green-400 text-xs">
                  {new Date(msg.created_at).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
                <span className="ml-2">
                  {msg.sender_clan_tag && (
                    <span className={`${msg.sender_clan_color || 'text-purple-400'} font-bold mr-1`}>
                      {msg.sender_clan_tag}
                    </span>
                  )}
                  <button
                    onClick={() => handleUsernameClick(msg.sender_id)}
                    className="font-bold text-white hover:text-green-400 hover:underline cursor-pointer"
                  >
                    {msg.sender_gamertag}:
                  </button>
                </span>
                <span className="ml-1 text-gray-100">{msg.message}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex p-3 border-t border-gray-600">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-l-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              maxLength={200}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed px-3 py-2 rounded-r-lg transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Chat;