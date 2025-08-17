import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../lib/supabase';
import { Trophy, User, Save, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ProfilePage: React.FC = () => {
  const { connected, publicKey } = useWallet();
  const { user, updateUser } = useUser();
  const [gamertag, setGamertag] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [isGamertagTaken, setIsGamertagTaken] = useState(false);
  const [isCheckingGamertag, setIsCheckingGamertag] = useState(false);

  useEffect(() => {
    if (user) {
      setGamertag(user.gamertag || '');
      setBio(user.bio || '');
    }
  }, [user]);

  useEffect(() => {
    if (gamertag && gamertag.length >= 3 && !user?.gamertag) {
      checkGamertagAvailability(gamertag);
    } else {
      setIsGamertagTaken(false);
    }
  }, [gamertag, user]);

  const checkGamertagAvailability = async (tag: string) => {
    setIsCheckingGamertag(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('gamertag', tag)
        .single();

      setIsGamertagTaken(!!data && !error);
    } catch (error) {
      console.error('Error checking gamertag:', error);
    } finally {
      setIsCheckingGamertag(false);
    }
  };

  const createProfile = async () => {
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet first!');
      return;
    }

    if (!gamertag || gamertag.length < 3) {
      toast.error('Gamertag must be at least 3 characters long');
      return;
    }

    if (isGamertagTaken) {
      toast.error('This gamertag is already taken');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          wallet_address: publicKey.toString(),
          gamertag,
          bio,
          gamerscore: 0,
          total_clips: 0,
          total_votes: 0,
          login_streak: 1,
          last_login: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;

      // The UserContext will automatically fetch the new user
      toast.success('Profile created successfully!');
      window.location.reload(); // Force refresh to update context
    } catch (error) {
      console.error('Error creating profile:', error);
      toast.error('Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await updateUser({ bio });
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <User size={64} className="mx-auto mb-4 text-green-400" />
          <h1 className="text-2xl font-bold mb-4">Connect Your Wallet</h1>
          <p className="text-gray-300 mb-6">Connect your wallet to create your gaming profile</p>
          <WalletMultiButton className="!bg-gradient-to-r !from-green-600 !to-green-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-green-400 mb-6 flex items-center gap-2">
        <User />
        My Profile
      </h1>

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Form */}
          <div className="bg-gradient-to-br from-green-900 to-green-800 border border-green-600 p-6 rounded-lg">
            <h2 className="text-lg font-bold text-green-400 mb-4">Profile Information</h2>
            
            {!user ? (
              // New user setup
              <div className="space-y-4">
                <div className="bg-yellow-900 border border-yellow-600 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-200">
                    <AlertCircle size={16} />
                    <span className="text-sm">Once you set your gamertag, it cannot be changed!</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Choose Your Gamertag</label>
                  <input
                    type="text"
                    value={gamertag}
                    onChange={(e) => setGamertag(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                    className="w-full bg-gray-800 text-white p-3 rounded-lg border border-green-600 focus:border-green-400 focus:outline-none"
                    placeholder="Enter your gamertag"
                    minLength={3}
                    maxLength={16}
                  />
                  {isCheckingGamertag && (
                    <p className="text-yellow-400 text-xs mt-1">Checking availability...</p>
                  )}
                  {isGamertagTaken && (
                    <p className="text-red-400 text-xs mt-1">This gamertag is already taken</p>
                  )}
                  {gamertag && !isGamertagTaken && !isCheckingGamertag && gamertag.length >= 3 && (
                    <p className="text-green-400 text-xs mt-1">Gamertag is available!</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">3-16 characters, letters, numbers, and underscores only</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Bio (Optional)</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-gray-800 text-white p-3 rounded-lg border border-green-600 focus:border-green-400 focus:outline-none h-24"
                    placeholder="Tell us about yourself..."
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-400 mt-1">{bio.length}/200 characters</p>
                </div>

                <button
                  onClick={createProfile}
                  disabled={loading || !gamertag || gamertag.length < 3 || isGamertagTaken || isCheckingGamertag}
                  className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Save />
                      Create Profile (Permanent)
                    </>
                  )}
                </button>
              </div>
            ) : (
              // Existing user - bio update only
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Gamertag (Locked)</label>
                  <div className="bg-gray-700 p-3 rounded-lg border border-gray-600">
                    <div className="font-bold text-lg">{user.gamertag}</div>
                    <div className="text-xs text-gray-400 mt-1">This gamertag is permanently linked to your wallet</div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-gray-800 text-white p-3 rounded-lg border border-green-600 focus:border-green-400 focus:outline-none h-24"
                    placeholder="Tell us about yourself..."
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-400 mt-1">{bio.length}/200 characters</p>
                </div>

                <button
                  onClick={updateProfile}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Save />
                      Update Bio
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Profile Preview */}
          <div className="bg-gradient-to-br from-green-900 to-green-800 border border-green-600 p-6 rounded-lg">
            <h2 className="text-lg font-bold text-green-400 mb-4">Profile Preview</h2>
            
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-green-600 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
                🎮
              </div>
              <div className="text-purple-400 text-lg font-bold mb-1">[MLG]</div>
              <h3 className="font-bold text-xl mb-2">{gamertag || 'Not Set'}</h3>
              <p className="text-gray-300 mb-4">{bio || 'No bio set'}</p>
              <div className="text-2xl font-bold text-yellow-400 flex items-center justify-center gap-2">
                <Trophy />
                {user?.gamerscore || 0}G
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Wallet:</span>
                <span className="text-green-400 text-xs">
                  {publicKey ? `${publicKey.toString().slice(0, 6)}...${publicKey.toString().slice(-4)}` : 'Not connected'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Clips:</span>
                <span className="text-purple-400">{user?.total_clips || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Votes Received:</span>
                <span className="text-orange-400">{user?.total_votes || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Login Streak:</span>
                <span className="text-red-400">{user?.login_streak || 0} days</span>
              </div>
              <div className="flex justify-between">
                <span>Joined:</span>
                <span className="text-gray-400">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Today'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;