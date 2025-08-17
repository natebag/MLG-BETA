import React, { useState, useEffect } from 'react';
import { Crown, Users, Trophy, Zap, Search, Play, Heart } from 'lucide-react';
import { supabase, User } from '../lib/supabase';
import { useUser } from '../contexts/UserContext';
import { openUserProfile } from '../components/UserProfileModal';
import toast from 'react-hot-toast';

const ClanPage: React.FC = () => {
  const { user } = useUser();
  const [mlgMembers, setMlgMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [clanStats, setClanStats] = useState({
    totalMembers: 0,
    totalClips: 0,
    totalVotes: 0
  });

  useEffect(() => {
    fetchMlgClan();
  }, []);

  const fetchMlgClan = async () => {
    try {
      setLoading(true);
      
      // Get MLG clan and member IDs
      const { data: mlgClan } = await supabase
        .from('clans')
        .select('members')
        .eq('name', 'Major League Gaming')
        .single();

      if (mlgClan && mlgClan.members?.length > 0) {
        // Get all member details
        const { data: members } = await supabase
          .from('users')
          .select('*')
          .in('id', mlgClan.members)
          .order('gamerscore', { ascending: false });

        if (members) {
          setMlgMembers(members);
          
          // Calculate clan stats
          const totalClips = members.reduce((sum, member) => sum + (member.total_clips || 0), 0);
          const totalVotes = members.reduce((sum, member) => sum + (member.total_votes || 0), 0);
          
          setClanStats({
            totalMembers: members.length,
            totalClips,
            totalVotes
          });
        }
      } else {
        // If no MLG clan exists, show all users as default MLG members
        const { data: allUsers } = await supabase
          .from('users')
          .select('*')
          .order('gamerscore', { ascending: false });

        if (allUsers) {
          setMlgMembers(allUsers);
          const totalClips = allUsers.reduce((sum, member) => sum + (member.total_clips || 0), 0);
          const totalVotes = allUsers.reduce((sum, member) => sum + (member.total_votes || 0), 0);
          
          setClanStats({
            totalMembers: allUsers.length,
            totalClips,
            totalVotes
          });
        }
      }
    } catch (error) {
      console.error('Error fetching MLG clan:', error);
      toast.error('Failed to load clan data');
    } finally {
      setLoading(false);
    }
  };

  const handleMemberClick = (memberId: string) => {
    if (memberId !== user?.id) {
      openUserProfile(memberId);
    }
  };

  // Filter members based on search
  const filteredMembers = mlgMembers.filter(member =>
    member.gamertag.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.bio && member.bio.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-green-400 mb-6 flex items-center gap-2">
        <Crown />
        MLG Clan Hub
      </h1>

      <div className="bg-gradient-to-br from-green-900 to-green-800 border border-green-600 p-6 rounded-lg">
        <h2 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
          <Trophy />
          [MLG] Major League Gaming
        </h2>
        
        <div className="grid grid-cols-3 gap-4 text-center mb-6">
          <div>
            <div className="text-2xl font-bold text-green-400">{clanStats.totalMembers}</div>
            <div className="text-sm text-gray-400">Members</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400">{clanStats.totalClips}</div>
            <div className="text-sm text-gray-400">Clips</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">{clanStats.totalVotes}</div>
            <div className="text-sm text-gray-400">Total Votes</div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-green-400 flex items-center gap-2">
              <Users />
              MLG Roster ({filteredMembers.length})
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search players..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:border-green-400 focus:outline-none"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading clan members...</p>
            </div>
          ) : filteredMembers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  onClick={() => handleMemberClick(member.id)}
                  className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-purple-400 font-bold text-xs">[MLG]</div>
                    <div className="text-yellow-400 font-bold text-sm flex items-center gap-1">
                      <Trophy size={14} />
                      {member.gamerscore || 0}G
                    </div>
                  </div>
                  <div className="font-bold text-sm mb-1">{member.gamertag}</div>
                  <div className="text-xs text-gray-400 mb-2 truncate">
                    {member.bio || 'No bio set'}
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Play size={12} />
                      {member.total_clips || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart size={12} />
                      {member.total_votes || 0}
                    </span>
                    <span>🔥 {member.login_streak || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              {searchTerm ? 'No players found matching your search.' : 'No clan members yet.'}
            </div>
          )}
        </div>

        <div className="mt-8 p-4 bg-yellow-900 border border-yellow-600 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-200 mb-2">
            <Zap />
            <span className="font-bold">Coming Soon: Custom Clans & Treasury</span>
          </div>
          <p className="text-yellow-100 text-sm">
            Create your own clans with Solana treasury integration, officer management, and DAO governance features!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClanPage;