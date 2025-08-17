import React, { useState, useEffect } from 'react';
import { Crown, Users, Trophy, Plus, Search, Play, Heart, Shield, Star } from 'lucide-react';
import { supabase, User } from '../lib/supabase';
import { useUser } from '../contexts/UserContext';
import { useWallet } from '@solana/wallet-adapter-react';
import { mlgTokenService } from '../lib/mlgToken';
import { openUserProfile } from '../components/UserProfileModal';
import CreateClanModal from '../components/CreateClanModal';
import ClanDashboard from '../components/ClanDashboard';
import toast from 'react-hot-toast';

interface Clan {
  id: string;
  name: string;
  tag: string;
  description: string;
  color: string;
  owner_id: string;
  member_count: number;
  is_recruiting: boolean;
  created_at: string;
  owner_gamertag?: string;
}

const ClanPage: React.FC = () => {
  const { user } = useUser();
  const { publicKey } = useWallet();
  const [clans, setClans] = useState<Clan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [selectedClanId, setSelectedClanId] = useState<string>('');
  const [mlgTokenBalance, setMlgTokenBalance] = useState(0);

  useEffect(() => {
    fetchClans();
    if (publicKey) {
      loadTokenBalance();
    }
  }, [publicKey]);

  const loadTokenBalance = async () => {
    if (!publicKey) return;
    try {
      const balance = await mlgTokenService.getFormattedBalance(publicKey);
      setMlgTokenBalance(balance);
    } catch (error) {
      console.error('Error loading token balance:', error);
    }
  };

  const fetchClans = async () => {
    try {
      setLoading(true);
      
      // Get all clans with owner information
      const { data: clansData } = await supabase
        .from('clans')
        .select(`
          id,
          name,
          tag,
          description,
          color,
          owner_id,
          member_count,
          is_recruiting,
          created_at,
          users!clans_owner_id_fkey(gamertag)
        `)
        .order('member_count', { ascending: false });

      if (clansData) {
        const formattedClans: Clan[] = clansData.map(clan => ({
          ...clan,
          owner_gamertag: (clan.users as any)?.gamertag || 'Unknown'
        }));
        
        // Separate MLG clan and custom clans, then put MLG at top
        const mlgClan = formattedClans.find(clan => clan.name === 'Major League Gaming');
        const customClans = formattedClans.filter(clan => clan.name !== 'Major League Gaming');
        
        // MLG clan always first, then custom clans
        const sortedClans = mlgClan ? [mlgClan, ...customClans] : customClans;
        setClans(sortedClans);
      }
    } catch (error) {
      console.error('Error fetching clans:', error);
      toast.error('Failed to load clans');
    } finally {
      setLoading(false);
    }
  };

  const handleClanOwnerClick = (ownerId: string) => {
    if (ownerId !== user?.id) {
      openUserProfile(ownerId);
    }
  };

  const handleCreateClan = () => {
    if (!user) {
      toast.error('Please connect your wallet to create a clan');
      return;
    }
    setShowCreateModal(true);
  };

  const handleClanCreated = () => {
    fetchClans();
    loadTokenBalance();
  };

  const handleViewClan = (clanId: string) => {
    setSelectedClanId(clanId);
    setShowDashboard(true);
  };


  // Filter clans based on search
  const filteredClans = clans.filter(clan =>
    clan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clan.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clan.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-400 flex items-center gap-2">
          <Shield />
          Clan Directory
        </h1>
        <button
          onClick={handleCreateClan}
          className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          Create Clan (10 MLG)
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search clans by name, tag, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-800 text-white pl-10 pr-4 py-3 rounded-lg border border-gray-600 focus:border-green-400 focus:outline-none"
        />
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading clans...</p>
        </div>
      ) : filteredClans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClans.map((clan) => (
            <div
              key={clan.id}
              onClick={() => handleViewClan(clan.id)}
              className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-600 hover:border-green-400 p-6 rounded-lg transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className="font-bold text-lg"
                  style={{ color: clan.color }}
                >
                  {clan.tag}
                </div>
                {clan.is_recruiting && (
                  <div className="bg-green-600 text-green-100 px-2 py-1 rounded text-xs font-bold">
                    Recruiting
                  </div>
                )}
              </div>
              
              <h3 className="font-bold text-xl mb-2">{clan.name}</h3>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">{clan.description}</p>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-blue-400" />
                  <span className="text-sm">{clan.member_count} member{clan.member_count !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Crown size={14} className="text-yellow-400" />
                  <button
                    onClick={() => handleClanOwnerClick(clan.owner_id)}
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    {clan.owner_gamertag}
                  </button>
                </div>
              </div>
              
              <div className="text-xs text-gray-500">
                Created {new Date(clan.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Shield size={64} className="mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400 text-lg mb-4">
            {searchTerm ? 'No clans found matching your search.' : 'No clans created yet.'}
          </p>
          {!searchTerm && (
            <button
              onClick={handleCreateClan}
              className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2 mx-auto"
            >
              <Plus size={16} />
              Be the first to create a clan!
            </button>
          )}
        </div>
      )}
      
      {user && publicKey && (
        <div className="mt-8 p-4 bg-gradient-to-r from-purple-900 to-blue-900 border border-purple-600 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="text-yellow-400" size={20} />
              <span className="font-bold">Your MLG Token Balance:</span>
            </div>
            <span className="text-lg font-bold text-yellow-400">{mlgTokenBalance.toFixed(2)} MLG</span>
          </div>
          <p className="text-sm text-gray-400 mt-2">
            Create your own clan for 10 MLG tokens and build your gaming community!
          </p>
        </div>
      )}
      
      <CreateClanModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onClanCreated={handleClanCreated}
      />
      
      <ClanDashboard
        clanId={selectedClanId}
        isOpen={showDashboard}
        onClose={() => setShowDashboard(false)}
      />
    </div>
  );
};

export default ClanPage;