import React, { useState } from 'react';
import { X, User, FileText } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

interface CreateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateProfileModal: React.FC<CreateProfileModalProps> = ({ isOpen, onClose }) => {
  const { createProfile, loading } = useUser();
  const [gamertag, setGamertag] = useState('');
  const [bio, setBio] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!gamertag.trim()) {
      return;
    }

    await createProfile(gamertag.trim(), bio.trim());
    
    // Reset form
    setGamertag('');
    setBio('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-green-400">Create Your Profile</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-green-600 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
              🎮
            </div>
            <p className="text-gray-300">
              Welcome to MLG.clan! Create your gaming profile to get started.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <User size={16} className="inline mr-2" />
                Gamertag *
              </label>
              <input
                type="text"
                value={gamertag}
                onChange={(e) => setGamertag(e.target.value)}
                placeholder="Enter your gamertag"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-green-400"
                required
                maxLength={20}
              />
              <p className="text-xs text-gray-400 mt-1">
                Choose a unique gamertag (3-20 characters)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <FileText size={16} className="inline mr-2" />
                Bio (Optional)
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-green-400 resize-none"
                rows={3}
                maxLength={150}
              />
              <p className="text-xs text-gray-400 mt-1">
                {bio.length}/150 characters
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !gamertag.trim()}
                className="flex-1 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                {loading ? 'Creating...' : 'Create Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProfileModal;