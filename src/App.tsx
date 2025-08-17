import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import VoteVaultPage from './pages/VoteVaultPage';
import ClanPage from './pages/ClanPage';
import UploadPage from './pages/UploadPage';
import AchievementsPage from './pages/AchievementsPage';
import TournamentsPage from './pages/TournamentsPage';
import { UserProvider } from './contexts/UserContext';
import { ClipsProvider } from './contexts/ClipsContext';
import { ChatProvider } from './contexts/ChatContext';
import Chat from './components/Chat';
import UserProfileModal from './components/UserProfileModal';
import CreateProfileModal from './components/CreateProfileModal';
import ClanMembersModal from './components/ClanMembersModal';
import { supabase } from './lib/supabase';
import { Toaster } from 'react-hot-toast';
import { useUser } from './contexts/UserContext';
import { useWallet } from '@solana/wallet-adapter-react';

// Import Solana wallet CSS
import '@solana/wallet-adapter-react-ui/styles.css';

// Component that needs to be inside UserProvider
const AppContent = () => {
  const { user, loading } = useUser();
  const { connected } = useWallet();
  const [showCreateProfile, setShowCreateProfile] = useState(false);

  useEffect(() => {
    // Show profile creation modal if wallet is connected but no user profile exists
    if (connected && !loading && !user) {
      setShowCreateProfile(true);
    } else {
      setShowCreateProfile(false);
    }
  }, [connected, user, loading]);

  return (
    <div className="bg-gradient-to-br from-gray-900 via-green-900 to-black text-white min-h-screen">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/vote-vault" element={<VoteVaultPage />} />
          <Route path="/clan" element={<ClanPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/tournaments" element={<TournamentsPage />} />
        </Routes>
      </main>
      <Chat />
      <UserProfileModal />
      <ClanMembersModal />
      <CreateProfileModal 
        isOpen={showCreateProfile} 
        onClose={() => setShowCreateProfile(false)} 
      />
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'bg-gray-800 text-white',
          duration: 4000,
        }}
      />
    </div>
  );
};

function App() {
  // Check if Supabase is properly configured
  const isSupabaseConfigured = () => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    return url && key && 
           !url.includes('placeholder') && 
           !key.includes('placeholder') &&
           url.startsWith('https://') &&
           key.length > 20;
  };

  const network = WalletAdapterNetwork.Devnet;
  const endpoint = clusterApiUrl(network);
  
  const wallets = [
    new PhantomWalletAdapter(),
  ];

  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    // Initialize database tables if needed
    // Only initialize database if Supabase is configured
    if (isSupabaseConfigured()) {
      initializeDatabase();
    }
  }, []);

  const initializeDatabase = async () => {
    // Skip database initialization if Supabase is not configured
    if (!isSupabaseConfigured()) {
      console.log('Supabase not configured - using local storage mode');
      return;
    }

    try {
      // Check if tables exist, if not they'll be created by migrations
      const { data, error } = await supabase.from('users').select('count', { count: 'exact' });
      if (error && error.code === '42P01') {
        console.log('Tables will be created by migrations');
      }
    } catch (error) {
      console.error('Database initialization error:', error);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <UserProvider>
              <ClipsProvider>
                <ChatProvider>
                  <Router>
                    <AppContent />
                  </Router>
                </ChatProvider>
              </ClipsProvider>
            </UserProvider>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </div>
  );
}

export default App;