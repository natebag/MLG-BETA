import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../lib/supabase';
import { mlgTokenService } from '../lib/mlgToken';
import { 
  Shield, 
  Users, 
  Settings, 
  Crown, 
  UserPlus, 
  UserMinus, 
  Play, 
  Trophy, 
  Star,
  X,
  Edit
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ClanDashboardProps {
  clanId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface ClanMember {
  id: string;
  user_id: string;
  role: 'owner' | 'officer' | 'member';
  joined_at: string;
  gamertag: string;
  gamerscore: number;
  total_clips: number;
}

interface ClanDetails {
  id: string;
  name: string;
  tag: string;
  description: string;
  color: string;
  owner_id: string;
  member_count: number;
  is_recruiting: boolean;
  created_at: string;
}

const ClanDashboard: React.FC<ClanDashboardProps> = ({ clanId, isOpen, onClose }) => {
  const { user } = useUser();
  const { publicKey } = useWallet();
  const [clan, setClan] = useState<ClanDetails | null>(null);
  const [members, setMembers] = useState<ClanMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'management'>('overview');
  const [isOwner, setIsOwner] = useState(false);
  const [isOfficer, setIsOfficer] = useState(false);

  useEffect(() => {
    if (isOpen && clanId) {
      fetchClanData();
    }
  }, [isOpen, clanId]);

  const fetchClanData = async () => {
    try {
      setLoading(true);

      // Fetch clan details
      const { data: clanData } = await supabase
        .from('clans')
        .select('*')
        .eq('id', clanId)
        .single();

      if (clanData) {
        setClan(clanData);
        setIsOwner(user?.id === clanData.owner_id);
      }

      // Fetch clan members with user details
      const { data: membersData } = await supabase
        .from('clan_members')
        .select(`
          id,
          user_id,
          role,
          joined_at,
          users!clan_members_user_id_fkey(
            gamertag,
            gamerscore,
            total_clips
          )
        `)
        .eq('clan_id', clanId)
        .order('role', { ascending: true });

      if (membersData) {
        const formattedMembers: ClanMember[] = membersData.map(member => ({
          id: member.id,
          user_id: member.user_id,
          role: member.role,
          joined_at: member.joined_at,
          gamertag: (member.users as any)?.gamertag || 'Unknown',
          gamerscore: (member.users as any)?.gamerscore || 0,
          total_clips: (member.users as any)?.total_clips || 0
        }));
        
        setMembers(formattedMembers);
        
        // Check if current user is officer or owner
        const currentUserMember = formattedMembers.find(m => m.user_id === user?.id);
        setIsOfficer(currentUserMember?.role === 'officer' || currentUserMember?.role === 'owner');
      }

    } catch (error) {
      console.error('Error fetching clan data:', error);
      toast.error('Failed to load clan data');
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteMember = async (memberId: string, newRole: 'officer' | 'member') => {
    if (!isOwner) {
      toast.error('Only clan owners can promote/demote members');
      return;
    }

    try {
      const { error } = await supabase
        .from('clan_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;

      toast.success(`Member ${newRole === 'officer' ? 'promoted to officer' : 'demoted to member'}`);
      fetchClanData();
    } catch (error) {
      console.error('Error updating member role:', error);
      toast.error('Failed to update member role');
    }
  };

  const handleKickMember = async (memberId: string, memberName: string) => {
    if (!isOwner && !isOfficer) {
      toast.error('Only officers and owners can kick members');
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to kick ${memberName} from the clan?`);
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('clan_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      // Update clan member count
      if (clan) {
        await supabase
          .from('clans')
          .update({ member_count: clan.member_count - 1 })
          .eq('id', clanId);
      }

      toast.success(`${memberName} has been kicked from the clan`);
      fetchClanData();
    } catch (error) {
      console.error('Error kicking member:', error);
      toast.error('Failed to kick member');
    }
  };

  const handleToggleRecruiting = async () => {
    if (!isOwner) {
      toast.error('Only clan owners can change recruiting status');
      return;
    }

    try {
      const { error } = await supabase
        .from('clans')
        .update({ is_recruiting: !clan?.is_recruiting })
        .eq('id', clanId);

      if (error) throw error;

      toast.success(`Recruiting ${clan?.is_recruiting ? 'disabled' : 'enabled'}`);
      fetchClanData();
    } catch (error) {
      console.error('Error updating recruiting status:', error);
      toast.error('Failed to update recruiting status');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-600">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-600">
          <div className="flex items-center gap-3">
            <Shield size={28} className="text-green-400" />
            <div>
              <h2 className="text-xl font-bold" style={{ color: clan?.color }}>
                {clan?.tag}
              </h2>
              <p className="text-gray-400 text-sm">{clan?.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading clan data...</p>
          </div>
        ) : (
          <>
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-600">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-3 transition-colors ${
                  activeTab === 'overview'
                    ? 'border-b-2 border-green-400 text-green-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`px-6 py-3 transition-colors ${
                  activeTab === 'members'
                    ? 'border-b-2 border-green-400 text-green-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Members ({members.length})
              </button>
              {(isOwner || isOfficer) && (
                <button
                  onClick={() => setActiveTab('management')}
                  className={`px-6 py-3 transition-colors ${
                    activeTab === 'management'
                      ? 'border-b-2 border-green-400 text-green-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Management
                </button>
              )}
            </div>

            {/* Tab Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold mb-2">About</h3>
                    <p className="text-gray-400">{clan?.description}</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-800 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-400">{members.length}</div>
                      <div className="text-sm text-gray-400">Members</div>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-400">
                        {members.reduce((sum, m) => sum + m.total_clips, 0)}
                      </div>
                      <div className="text-sm text-gray-400">Total Clips</div>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-yellow-400">
                        {members.reduce((sum, m) => sum + m.gamerscore, 0)}
                      </div>
                      <div className="text-sm text-gray-400">Total Score</div>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg text-center">
                      <div className={`text-2xl font-bold ${clan?.is_recruiting ? 'text-green-400' : 'text-red-400'}`}>
                        {clan?.is_recruiting ? 'Yes' : 'No'}
                      </div>
                      <div className="text-sm text-gray-400">Recruiting</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold mb-3">Top Members</h3>
                    <div className="space-y-2">
                      {members
                        .sort((a, b) => b.gamerscore - a.gamerscore)
                        .slice(0, 5)
                        .map((member, index) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between bg-gray-800 p-3 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-black font-bold text-sm">
                                {index + 1}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">{member.gamertag}</span>
                                  {member.role === 'owner' && <Crown size={14} className="text-yellow-400" />}
                                  {member.role === 'officer' && <Star size={14} className="text-blue-400" />}
                                </div>
                                <div className="text-sm text-gray-400">
                                  {member.total_clips} clips
                                </div>
                              </div>
                            </div>
                            <div className="text-yellow-400 font-bold">
                              {member.gamerscore}G
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'members' && (
                <div className="space-y-3">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between bg-gray-800 p-4 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{member.gamertag}</span>
                            {member.role === 'owner' && <Crown size={14} className="text-yellow-400" />}
                            {member.role === 'officer' && <Star size={14} className="text-blue-400" />}
                          </div>
                          <div className="text-sm text-gray-400 capitalize">
                            {member.role} • Joined {new Date(member.joined_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-yellow-400 font-bold">{member.gamerscore}G</div>
                          <div className="text-sm text-gray-400">{member.total_clips} clips</div>
                        </div>
                        
                        {isOwner && member.user_id !== user?.id && (
                          <div className="flex gap-2">
                            {member.role === 'member' ? (
                              <button
                                onClick={() => handlePromoteMember(member.id, 'officer')}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm"
                              >
                                Promote
                              </button>
                            ) : member.role === 'officer' ? (
                              <button
                                onClick={() => handlePromoteMember(member.id, 'member')}
                                className="bg-orange-600 hover:bg-orange-500 text-white px-3 py-1 rounded text-sm"
                              >
                                Demote
                              </button>
                            ) : null}
                            
                            <button
                              onClick={() => handleKickMember(member.id, member.gamertag)}
                              className="bg-red-600 hover:bg-red-500 text-white p-1 rounded"
                            >
                              <UserMinus size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'management' && (isOwner || isOfficer) && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold mb-4">Clan Settings</h3>
                    <div className="space-y-4">
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">Recruiting Status</h4>
                            <p className="text-sm text-gray-400">
                              Allow new members to join your clan
                            </p>
                          </div>
                          <button
                            onClick={handleToggleRecruiting}
                            className={`px-4 py-2 rounded transition-colors ${
                              clan?.is_recruiting
                                ? 'bg-green-600 hover:bg-green-500'
                                : 'bg-red-600 hover:bg-red-500'
                            }`}
                          >
                            {clan?.is_recruiting ? 'Enabled' : 'Disabled'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {isOwner && (
                    <div>
                      <h3 className="text-lg font-bold mb-4 text-red-400">Danger Zone</h3>
                      <div className="bg-red-900 border border-red-600 p-4 rounded-lg">
                        <h4 className="font-semibold text-red-200 mb-2">Delete Clan</h4>
                        <p className="text-sm text-red-300 mb-4">
                          This action cannot be undone. All members will be removed.
                        </p>
                        <button className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded">
                          Delete Clan
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ClanDashboard;