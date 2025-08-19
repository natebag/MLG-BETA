import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useUser } from '../contexts/UserContext';
import { openClanMembers } from './ClanMembersModal';
import { Crown, Users, MessageCircle, Trophy, Coins } from 'lucide-react';
import { mlgTokenService } from '../lib/mlgToken';

const Header: React.FC = () => {
  const { pathname } = useLocation();
  const { connected, publicKey } = useWallet();
  const { user, gamerscore } = useUser();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mlgBalance, setMLGBalance] = useState<number>(0);
  const [loadingBalance, setLoadingBalance] = useState(false);

  useEffect(() => {
    const loadMLGBalance = async () => {
      if (connected && publicKey) {
        setLoadingBalance(true);
        try {
          const balance = await mlgTokenService.getFormattedBalance(publicKey);
          setMLGBalance(balance);
        } catch (error) {
          console.error('Error loading MLG balance:', error);
          setMLGBalance(0);
        } finally {
          setLoadingBalance(false);
        }
      } else {
        setMLGBalance(0);
      }
    };

    loadMLGBalance();
    
    // Refresh balance every 30 seconds when connected
    if (connected && publicKey) {
      const interval = setInterval(loadMLGBalance, 30000);
      return () => clearInterval(interval);
    }
  }, [connected, publicKey]);

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/vote-vault', label: 'Vote Vault' },
    { path: '/clan', label: 'Clan' },
    { path: '/tournaments', label: 'Tournaments' },
    { path: '/upload', label: 'Upload' },
    { path: '/achievements', label: 'Achievements' },
    { path: '/profile', label: 'Profile' },
  ];

  const getClanInfo = () => {
    // This would be replaced with actual clan logic
    return {
      tag: '[MLG]',
      color: 'text-purple-400'
    };
  };

  const handleClanTagClick = () => {
    const clanInfo = getClanInfo();
    openClanMembers('Major League Gaming', clanInfo.tag, clanInfo.color);
  };

  return (
    <header className="p-6 border-b border-green-800">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-3xl font-bold text-green-400 hover:text-green-300 transition-colors">
            MLG.clan
          </Link>
          <div className="text-sm text-green-400 flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span>Online: 1</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {connected && user ? (
            <>
              <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 text-black px-3 py-1 rounded-lg font-bold flex items-center gap-1">
                <Trophy size={16} />
                <span>{gamerscore}G</span>
              </div>
              
              <div className="bg-gradient-to-r from-green-600 to-green-500 text-white px-3 py-1 rounded-lg font-bold flex items-center gap-1">
                <Coins size={16} />
                {loadingBalance ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  <span>{mlgBalance.toFixed(2)} MLG</span>
                )}
              </div>
              
              <div className="relative">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="bg-gradient-to-br from-green-800 to-green-900 border border-green-600 px-4 py-2 rounded-lg flex items-center space-x-2 hover:border-green-400 transition-colors"
                >
                  <span className="text-2xl">🎮</span>
                  <div className="text-left">
                    <div className="font-bold text-sm flex items-center">
                      <button
                        onClick={handleClanTagClick}
                        className={`${getClanInfo().color} mr-1 hover:underline cursor-pointer`}
                      >
                        {getClanInfo().tag}
                      </button>
                      <span>{user.gamertag}</span>
                    </div>
                    <div className="text-xs text-gray-300">
                      {user.wallet_address.slice(0, 6)}...{user.wallet_address.slice(-4)}
                    </div>
                  </div>
                  <span className="text-xs">▼</span>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 bg-gray-800 border border-green-600 rounded-lg p-2 min-w-48 z-50">
                    <Link 
                      to="/profile" 
                      className="block px-3 py-2 hover:bg-gray-700 rounded text-sm"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Profile
                    </Link>
                    <Link 
                      to="/achievements" 
                      className="block px-3 py-2 hover:bg-gray-700 rounded text-sm"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Achievements
                    </Link>
                    <hr className="my-2 border-gray-600" />
                    <WalletMultiButton className="!bg-red-600 !hover:bg-red-500 !text-white !w-full !justify-start !px-3 !py-2 !rounded !text-sm !min-h-0 !h-auto" />
                  </div>
                )}
              </div>
            </>
          ) : (
            <WalletMultiButton className="!bg-gradient-to-r !from-green-600 !to-green-500 !text-white !px-6 !py-2 !rounded-lg !font-semibold !hover:shadow-lg !transition-all !min-h-0 !h-auto" />
          )}
        </div>
      </div>
      
      <nav className="flex space-x-6 overflow-x-auto">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`relative py-2 px-1 whitespace-nowrap transition-all duration-300 ${
              pathname === item.path
                ? 'text-white font-bold'
                : 'text-green-400 hover:text-green-300'
            }`}
          >
            {item.label}
            {pathname === item.path && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-400 animate-pulse" />
            )}
          </Link>
        ))}
      </nav>
    </header>
  );
};

export default Header;