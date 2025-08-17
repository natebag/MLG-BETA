import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { useClips } from '../contexts/ClipsContext';
import { Upload, Save, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const UploadPage: React.FC = () => {
  const { user } = useUser();
  const { uploadClip } = useClips();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    game: '',
    url: ''
  });

  const games = [
    'Fortnite',
    'VALORANT',
    'Call of Duty',
    'Apex Legends',
    'CS:GO',
    'Overwatch 2',
    'Minecraft',
    'League of Legends',
    'Rocket League',
    'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please connect your wallet and create a profile first!');
      return;
    }

    if (!formData.title.trim() || !formData.game || !formData.url.trim()) {
      toast.error('Please fill in all fields!');
      return;
    }

    setLoading(true);
    
    const success = await uploadClip({
      title: formData.title.trim(),
      game: formData.game,
      url: convertToEmbedUrl(formData.url.trim()),
      uploader_id: user.id,
      uploader_gamertag: user.gamertag,
    });

    if (success) {
      setFormData({ title: '', game: '', url: '' });
      setTimeout(() => navigate('/vote-vault'), 1500);
    }
    
    setLoading(false);
  };

  const convertToEmbedUrl = (url: string) => {
    // Convert YouTube URLs to embed format
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes('twitch.tv/videos/')) {
      const videoId = url.split('videos/')[1]?.split('?')[0];
      return `https://player.twitch.tv/?video=${videoId}&parent=${window.location.hostname}`;
    }
    return url;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!user) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Upload size={64} className="mx-auto mb-4 text-green-400" />
          <h1 className="text-2xl font-bold mb-4">Upload Your Clips</h1>
          <p className="text-gray-300 mb-6">Connect your wallet and create a profile to start uploading!</p>
          <div className="bg-yellow-900 border border-yellow-600 p-3 rounded-lg max-w-md mx-auto">
            <div className="flex items-center gap-2 text-yellow-200">
              <AlertCircle size={16} />
              <span className="text-sm">You need a profile to upload clips</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-green-400 mb-6 flex items-center gap-2">
          <Upload />
          Upload Clip
        </h1>

        <div className="bg-gradient-to-br from-green-900 to-green-800 border border-green-600 p-6 rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Clip Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full bg-gray-800 text-white p-3 rounded-lg border border-green-600 focus:border-green-400 focus:outline-none"
                placeholder="Enter a catchy title for your clip"
                required
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Game</label>
              <select
                name="game"
                value={formData.game}
                onChange={handleInputChange}
                className="w-full bg-gray-800 text-white p-3 rounded-lg border border-green-600 focus:border-green-400 focus:outline-none"
                required
              >
                <option value="">Select a game</option>
                {games.map(game => (
                  <option key={game} value={game}>{game}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Video URL</label>
              <input
                type="url"
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                className="w-full bg-gray-800 text-white p-3 rounded-lg border border-green-600 focus:border-green-400 focus:outline-none"
                placeholder="https://youtube.com/watch?v=... or https://twitch.tv/videos/..."
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                Supported: YouTube, Twitch clips, and direct video links
              </p>
            </div>

            <div className="bg-blue-900 border border-blue-600 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-blue-200 mb-2">
                <AlertCircle size={16} />
                <span className="font-bold text-sm">Upload Guidelines</span>
              </div>
              <ul className="text-blue-100 text-xs space-y-1">
                <li>• Make sure your clip is gaming-related content</li>
                <li>• Keep titles appropriate and descriptive</li>
                <li>• Only upload clips you have rights to share</li>
                <li>• Clips with more votes get featured more prominently</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={loading || !formData.title.trim() || !formData.game || !formData.url.trim()}
              className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Save />
                  Upload Clip
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;