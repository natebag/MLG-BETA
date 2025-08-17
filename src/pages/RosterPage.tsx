import React, { useState, useEffect } from 'react';
import { supabase, User } from '../lib/supabase';
import { openUserProfile } from '../components/UserProfileModal';
import { Users, Search, Trophy, Crown } from 'lucide-react';

const RosterPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('gamerscore', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (userId: string) => {
    openUserProfile(userId);
  };

  const getClanInfo = () => {
    return {
      tag: '[MLG]',
      color: 'text-purple-400'
    };
  };

  const filteredUsers = users.filter(user =>
    user.gamertag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading roster...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-green-400 mb-6 flex items-center gap-2">
        <Users />
        Global Roster
      </h1>

      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search players..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:border-green-400 focus:outline-none w-full"
          />
        </div>
      </div>

      {filteredUsers.length > 0 ? (
        <div className="bg-gradient-to-br from-green-900 to-green-800 border border-green-600 p-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user, index) => {
              const clanInfo = getClanInfo();
              const rankEmoji = index === 0 ? <Crown className="text-yellow-400" size={20} /> : 
                              index === 1 ? '🥈' : 
                              index === 2 ? '🥉' : '🎮';

              return (
                <div
                  key={user.id}
                  onClick={() => handleUserClick(user.id)}
                  className="bg-gray-700 p-4 rounded-lg text-center hover:bg-gray-600 cursor-pointer transition-all duration-300 hover:scale-105"
                >
                  <div className="text-2xl mb-2 flex justify-center">
                    {typeof rankEmoji === 'string' ? rankEmoji : rankEmoji}
                  </div>
                  <div className={`${clanInfo.color} text-sm font-bold mb-1`}>{clanInfo.tag}</div>
                  <h3 className="font-bold mb-2">{user.gamertag}</h3>
                  <div className="text-yellow-400 font-bold mb-1 flex items-center justify-center gap-1">
                    <Trophy size={16} />
                    {user.gamerscore || 0}G
                  </div>
                  <div className="text-xs text-gray-400 space-y-1">
                    <div>Clips: {user.total_clips || 0}</div>
                    <div>Votes: {user.total_votes || 0}</div>
                    <div>Streak: {user.login_streak || 0} days</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <Users size={64} className="mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400 text-lg">
            {searchTerm ? 'No players found matching your search.' : 'No players yet. Connect your wallet to be the first!'}
          </p>
        </div>
      )}
    </div>
  );
};

export default RosterPage;