import React, { useState, useEffect } from 'react';
import { X, Trophy, Users, Play, Heart } from 'lucide-react';
import { supabase, User } from '../lib/supabase';
import { useUser } from '../contexts/UserContext';
import toast from 'react-hot-toast';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, userId }) => {
  const { user: currentUser } = useUser();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [hasSentRequest, setHasSentRequest] = useState(false);
  const [hasReceivedRequest, setHasReceivedRequest] = useState(false);

  useEffect(() => {
    if (isOpen && userId && userId !== currentUser?.id) {
      fetchUserProfile();
      checkFriendStatus();
    }
  }, [isOpen, userId, currentUser]);

  const fetchUserProfile = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfileUser(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const checkFriendStatus = async () => {
    if (!currentUser || !userId) return;

    try {
      // Check if they're friends
      const { data: friendship } = await supabase
        .from('friendships')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('friend_id', userId)
        .single();

      setIsFriend(!!friendship);

      if (!friendship) {
        // Check for pending friend requests
        const { data: sentRequest } = await supabase
          .from('friend_requests')
          .select('*')
          .eq('from_user_id', currentUser.id)
          .eq('to_user_id', userId)
          .eq('status', 'pending')
          .single();

        const { data: receivedRequest } = await supabase
          .from('friend_requests')
          .select('*')
          .eq('from_user_id', userId)
          .eq('to_user_id', currentUser.id)
          .eq('status', 'pending')
          .single();

        setHasSentRequest(!!sentRequest);
        setHasReceivedRequest(!!receivedRequest);
      }
    } catch (error) {
      console.error('Error checking friend status:', error);
    }
  };

  const sendFriendRequest = async () => {
    if (!currentUser || !profileUser) return;

    try {
      const { error } = await supabase
        .from('friend_requests')
        .insert([{
          from_user_id: currentUser.id,
          to_user_id: profileUser.id,
          status: 'pending'
        }]);

      if (error) throw error;

      setHasSentRequest(true);
      toast.success('Friend request sent!');
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('Failed to send friend request');
    }
  };

  const acceptFriendRequest = async () => {
    if (!currentUser || !profileUser) return;

    try {
      // Update request status
      await supabase
        .from('friend_requests')
        .update({ status: 'accepted' })
        .eq('from_user_id', profileUser.id)
        .eq('to_user_id', currentUser.id);

      // Create friendship records (bidirectional)
      await supabase
        .from('friendships')
        .insert([
          { user_id: currentUser.id, friend_id: profileUser.id },
          { user_id: profileUser.id, friend_id: currentUser.id }
        ]);

      setIsFriend(true);
      setHasReceivedRequest(false);
      toast.success('Friend request accepted!');
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast.error('Failed to accept friend request');
    }
  };

  const rejectFriendRequest = async () => {
    if (!currentUser || !profileUser) return;

    try {
      await supabase
        .from('friend_requests')
        .update({ status: 'rejected' })
        .eq('from_user_id', profileUser.id)
        .eq('to_user_id', currentUser.id);

      setHasReceivedRequest(false);
      toast.success('Friend request rejected');
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      toast.error('Failed to reject friend request');
    }
  };

  const getClanInfo = (user: User) => {
    // This would be replaced with actual clan logic
    return {
      tag: '[MLG]',
      color: 'text-purple-400'
    };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-green-400">Player Profile</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto"></div>
              <p className="text-gray-400 mt-4">Loading profile...</p>
            </div>
          ) : profileUser ? (
            <div>
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-green-600 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">
                  🎮
                </div>
                <div className={`${getClanInfo(profileUser).color} text-xl font-bold mb-2`}>
                  {getClanInfo(profileUser).tag}
                </div>
                <h3 className="text-2xl font-bold mb-2">{profileUser.gamertag}</h3>
                <p className="text-gray-300 mb-3">{profileUser.bio || 'No bio set'}</p>
                <div className="text-3xl font-bold text-yellow-400 flex items-center justify-center gap-2">
                  <Trophy />
                  {profileUser.gamerscore || 0}G
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-700 p-4 rounded text-center">
                  <div className="text-2xl font-bold text-purple-400 flex items-center justify-center gap-2">
                    <Play />
                    {profileUser.total_clips || 0}
                  </div>
                  <div className="text-sm text-gray-400">Clips</div>
                </div>
                <div className="bg-gray-700 p-4 rounded text-center">
                  <div className="text-2xl font-bold text-orange-400 flex items-center justify-center gap-2">
                    <Heart />
                    {profileUser.total_votes || 0}
                  </div>
                  <div className="text-sm text-gray-400">Votes Received</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-700 p-3 rounded text-center">
                  <div className="text-lg font-bold text-green-400">
                    {profileUser.login_streak || 0}
                  </div>
                  <div className="text-xs text-gray-400">Day Streak</div>
                </div>
                <div className="bg-gray-700 p-3 rounded text-center">
                  <div className="text-lg font-bold text-blue-400">
                    {new Date(profileUser.created_at).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-400">Joined</div>
                </div>
              </div>

              {currentUser && profileUser.id !== currentUser.id && (
                <div className="text-center">
                  {isFriend ? (
                    <div className="flex items-center justify-center gap-2 text-green-400 font-bold">
                      <Users />
                      <span>Friends</span>
                    </div>
                  ) : hasReceivedRequest ? (
                    <div className="space-y-3">
                      <p className="text-yellow-400">Sent you a friend request</p>
                      <div className="flex gap-3 justify-center">
                        <button 
                          onClick={acceptFriendRequest}
                          className="bg-green-600 hover:bg-green-500 px-6 py-2 rounded-lg font-semibold transition-colors"
                        >
                          Accept
                        </button>
                        <button 
                          onClick={rejectFriendRequest}
                          className="bg-red-600 hover:bg-red-500 px-6 py-2 rounded-lg font-semibold transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ) : hasSentRequest ? (
                    <div className="text-yellow-400">Friend request pending</div>
                  ) : (
                    <button 
                      onClick={sendFriendRequest}
                      className="bg-green-600 hover:bg-green-500 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 mx-auto"
                    >
                      <Users />
                      Send Friend Request
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">User not found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Global modal state
let globalModalState: {
  isOpen: boolean;
  userId?: string;
  setIsOpen: (open: boolean) => void;
  setUserId: (id?: string) => void;
} = {
  isOpen: false,
  setIsOpen: () => {},
  setUserId: () => {}
};

export const openUserProfile = (userId: string) => {
  globalModalState.setUserId(userId);
  globalModalState.setIsOpen(true);
};

const UserProfileModalWrapper: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userId, setUserId] = useState<string>();

  useEffect(() => {
    globalModalState.setIsOpen = setIsOpen;
    globalModalState.setUserId = setUserId;
  }, []);

  return (
    <UserProfileModal 
      isOpen={isOpen} 
      onClose={() => setIsOpen(false)} 
      userId={userId}
    />
  );
};

export default UserProfileModalWrapper;