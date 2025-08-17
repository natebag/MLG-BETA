import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, ChatMessage } from '../lib/supabase';
import { useUser } from './UserContext';

interface ChatContextType {
  messages: Record<string, ChatMessage[]>;
  currentChannel: string;
  isOpen: boolean;
  isMinimized: boolean;
  sendMessage: (channel: string, message: string) => Promise<void>;
  setCurrentChannel: (channel: string) => void;
  toggleChat: () => void;
  toggleMinimize: () => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { user } = useUser();
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [currentChannel, setCurrentChannel] = useState('trollbox');
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMessages('trollbox');
      
      // Subscribe to new messages
      const subscription = supabase
        .channel('chat_messages')
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'chat_messages' },
          (payload) => {
            const newMessage = payload.new as ChatMessage;
            setMessages(prev => ({
              ...prev,
              [newMessage.channel]: [
                ...(prev[newMessage.channel] || []),
                newMessage
              ].slice(-50) // Keep only last 50 messages
            }));
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const fetchMessages = async (channel: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('channel', channel)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;

      setMessages(prev => ({
        ...prev,
        [channel]: data || []
      }));
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (channel: string, message: string) => {
    if (!user || !message.trim()) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert([{
          channel,
          sender_id: user.id,
          sender_gamertag: user.gamertag,
          message: message.trim(),
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (isMinimized) setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleSetCurrentChannel = (channel: string) => {
    setCurrentChannel(channel);
    if (!messages[channel]) {
      fetchMessages(channel);
    }
  };

  return (
    <ChatContext.Provider value={{ 
      messages, 
      currentChannel, 
      isOpen, 
      isMinimized,
      sendMessage, 
      setCurrentChannel: handleSetCurrentChannel, 
      toggleChat,
      toggleMinimize
    }}>
      {children}
    </ChatContext.Provider>
  );
};