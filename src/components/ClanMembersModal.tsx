import React, { useState, useEffect } from 'react';
import { X, Search, Trophy, Play, Heart, Users } from 'lucide-react';
import { supabase, User } from '../lib/supabase';
import { useUser } from '../contexts/UserContext';
import { openUserProfile } from './UserProfileModal';
import toast from 'react-hot-toast';

interface ClanMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  clanName: string;
  clanTag: string;
  clanColor: string;
}

const ClanMembersModal: React.FC<ClanMembersModalProps> = ({ 
  isOpen, 
  onClose, 
  clanName, 
  clanTag, 
  clanColor 
}) => {
  const { user } = useUser();
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchClanMembers();
    }
  }, [isOpen, clanName]);

  const fetchClanMembers = async () => {
    try {
      setLoading(true);
      
      // Get clan and member IDs
      const { data: clan } = await supabase
        .from('clans')
        .select('members')
        .eq('name', clanName)
        .single();

      if (clan && clan.members?.length > 0) {
        // Get all member details
        const { data: memberDetails } = await supabase
          .from('users')
          .select('*')
          .in('id', clan.members)
          .order('gamerscore', { ascending: false });

        if (memberDetails) {
          setMembers(memberDetails);
        }
      } else {
        // If no clan members, show all users for MLG
        if (clanName === 'Major League Gaming') {
          const { data: allUsers } = await supabase
            .from('users')
            .select('*')
            .order('gamerscore', { ascending: false });

          if (allUsers) {
            setMembers(allUsers);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching clan members:', error);
      toast.error('Failed to load clan members');
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
  const filteredMembers = members.filter(member =>
    member.gamertag.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.bio && member.bio.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-green-400 flex items-center gap-2">
                <Users />
                <span className={clanColor}>{clanTag}</span> {clanName}
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                {filteredMembers.length} members
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search clan members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-700 text-white pl-10 pr-4 py-3 rounded-lg border border-gray-600 focus:border-green-400 focus:outline-none"
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
                    <div className={`${clanColor} font-bold text-xs`}>{clanTag}</div>
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
              {searchTerm ? 'No members found matching your search.' : 'No clan members yet.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Global modal state for clan members
let globalClanModalState: {
  isOpen: boolean;
  clanName: string;
  clanTag: string;
  clanColor: string;
  setIsOpen: (open: boolean) => void;
  setClanData: (name: string, tag: string, color: string) => void;
} = {
  isOpen: false,
  clanName: '',
  clanTag: '',
  clanColor: '',
  setIsOpen: () => {},
  setClanData: () => {}
};

export const openClanMembers = (clanName: string, clanTag: string, clanColor: string) => {
  globalClanModalState.setClanData(clanName, clanTag, clanColor);
  globalClanModalState.setIsOpen(true);
};

const ClanMembersModalWrapper: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [clanName, setClanName] = useState('');
  const [clanTag, setClanTag] = useState('');
  const [clanColor, setClanColor] = useState('');

  useEffect(() => {
    globalClanModalState.setIsOpen = setIsOpen;
    globalClanModalState.setClanData = (name: string, tag: string, color: string) => {
      setClanName(name);
      setClanTag(tag);
      setClanColor(color);
    };
  }, []);

  return (
    <ClanMembersModal 
      isOpen={isOpen} 
      onClose={() => setIsOpen(false)} 
      clanName={clanName}
      clanTag={clanTag}
      clanColor={clanColor}
    />
  );
};

export default ClanMembersModalWrapper;