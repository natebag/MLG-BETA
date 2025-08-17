import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../lib/supabase';
import { mlgTokenService } from '../lib/mlgToken';
import { X, Shield, Coins, Users } from 'lucide-react';
import toast from 'react-hot-toast';

interface CreateClanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClanCreated?: () => void;
}

const CreateClanModal: React.FC<CreateClanModalProps> = ({ isOpen, onClose, onClanCreated }) => {
  const { user } = useUser();
  const { publicKey } = useWallet();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    tag: '',
    description: '',
    color: '#8B5CF6' // Default purple color
  });

  const CLAN_CREATION_COST = 10; // MLG tokens required

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'tag') {
      // Format clan tag with brackets and limit to 5 characters
      let formattedTag = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (formattedTag.length > 5) formattedTag = formattedTag.slice(0, 5);
      setFormData(prev => ({ ...prev, [name]: formattedTag }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, color: e.target.value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Clan name is required');
      return false;
    }
    if (!formData.tag.trim()) {
      toast.error('Clan tag is required');
      return false;
    }
    if (formData.tag.length < 2) {
      toast.error('Clan tag must be at least 2 characters');
      return false;
    }
    if (!formData.description.trim()) {
      toast.error('Clan description is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Check if user has enough tokens
      const hasTokens = await mlgTokenService.hasEnoughTokens(publicKey, CLAN_CREATION_COST);
      if (!hasTokens) {
        toast.error(`Insufficient MLG tokens! You need ${CLAN_CREATION_COST} MLG tokens to create a clan.`);
        setLoading(false);
        return;
      }

      // Check if clan name or tag already exists
      const { data: existingClan } = await supabase
        .from('clans')
        .select('id, name, tag')
        .or(`name.ilike.${formData.name},tag.ilike.[${formData.tag}]`)
        .limit(1);

      if (existingClan && existingClan.length > 0) {
        const existing = existingClan[0];
        if (existing.name.toLowerCase() === formData.name.toLowerCase()) {
          toast.error('A clan with this name already exists');
        } else {
          toast.error(`Clan tag [${formData.tag}] is already taken`);
        }
        setLoading(false);
        return;
      }

      // Burn MLG tokens
      const burnSuccess = await mlgTokenService.burnTokens(
        { publicKey, signTransaction: (tx) => Promise.resolve(tx) } as any,
        CLAN_CREATION_COST
      );

      if (!burnSuccess) {
        setLoading(false);
        return;
      }

      // Create the clan
      const { data: newClan, error: clanError } = await supabase
        .from('clans')
        .insert({
          name: formData.name.trim(),
          tag: `[${formData.tag}]`,
          description: formData.description.trim(),
          color: formData.color,
          owner_id: user.id,
          created_by: user.id,
          member_count: 1,
          is_recruiting: true
        })
        .select()
        .single();

      if (clanError) throw clanError;

      // Add the creator as the first member with owner role
      const { error: memberError } = await supabase
        .from('clan_members')
        .insert({
          clan_id: newClan.id,
          user_id: user.id,
          role: 'owner',
          joined_at: new Date().toISOString()
        });

      if (memberError) throw memberError;

      // Update user's clan_id
      const { error: userError } = await supabase
        .from('users')
        .update({ clan_id: newClan.id })
        .eq('id', user.id);

      if (userError) throw userError;

      toast.success(`Clan "${formData.name}" created successfully!`);
      
      // Reset form
      setFormData({
        name: '',
        tag: '',
        description: '',
        color: '#8B5CF6'
      });
      
      onClose();
      onClanCreated?.();

    } catch (error) {
      console.error('Error creating clan:', error);
      toast.error('Failed to create clan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-600">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-green-400 flex items-center gap-2">
            <Shield size={24} />
            Create Clan
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Cost Information */}
        <div className="bg-gradient-to-r from-purple-900 to-blue-900 border border-purple-600 p-3 rounded-lg mb-6">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Coins className="text-yellow-400" size={16} />
              <span>Creation Cost:</span>
            </div>
            <span className="font-bold">{CLAN_CREATION_COST} MLG Tokens</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Clan Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Clan Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter clan name..."
                maxLength={30}
                className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-600 focus:border-green-400 focus:outline-none"
                required
              />
            </div>

            {/* Clan Tag */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Clan Tag (2-5 characters)
              </label>
              <div className="flex items-center">
                <span className="text-gray-400 mr-1">[</span>
                <input
                  type="text"
                  name="tag"
                  value={formData.tag}
                  onChange={handleInputChange}
                  placeholder="TAG"
                  maxLength={5}
                  className="bg-gray-800 text-white p-3 rounded-lg border border-gray-600 focus:border-green-400 focus:outline-none flex-1"
                  style={{ textTransform: 'uppercase' }}
                  required
                />
                <span className="text-gray-400 ml-1">]</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Preview: <span style={{ color: formData.color }}>[{formData.tag}]</span>
              </p>
            </div>

            {/* Tag Color */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tag Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.color}
                  onChange={handleColorChange}
                  className="w-12 h-10 rounded-lg border border-gray-600 cursor-pointer"
                />
                <span className="text-sm text-gray-400">
                  Choose your clan's tag color
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your clan..."
                rows={3}
                maxLength={200}
                className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-600 focus:border-green-400 focus:outline-none resize-none"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/200 characters
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Users size={16} />
                  Create Clan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClanModal;