import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { useClips } from '../contexts/ClipsContext';
import { Trophy, Users, Play, TrendingUp, Crown } from 'lucide-react';

const HomePage: React.FC = () => {
  const { user, gamerscore } = useUser();
  const { clips } = useClips();
  const [showcaseIndex, setShowcaseIndex] = useState(0);

  useEffect(() => {
    if (clips.length > 1) {
      const interval = setInterval(() => {
        setShowcaseIndex(prev => (prev + 1) % clips.length);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [clips.length]);

  const featuredClip = clips[showcaseIndex];

  const convertToEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  const stats = {
    totalClips: clips.length,
    totalUsers: 1, // This would come from a real count
    totalVotes: clips.reduce((sum, clip) => sum + clip.votes, 0),
    totalGamerscore: gamerscore,
  };

  return (
    <div className="p-6 space-y-8">
      {/* Featured Showcase */}
      <div className="bg-gradient-to-br from-green-900 to-green-800 border border-green-600 p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-green-400 flex items-center gap-2">
            <Trophy />
            Featured Showcase
          </h2>
          {clips.length > 1 && (
            <button
              onClick={() => setShowcaseIndex(prev => (prev + 1) % clips.length)}
              className="bg-green-600 hover:bg-green-500 px-3 py-1 rounded text-sm transition-colors"
            >
              🔄 Next
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            {featuredClip ? (
              <iframe
                src={convertToEmbedUrl(featuredClip.url)}
                className="w-full h-full"
                frameBorder="0"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Play size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No clips available yet. Upload the first clip!</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            {featuredClip ? (
              <div>
                <h3 className="text-xl font-bold mb-2">{featuredClip.title}</h3>
                <p className="text-gray-300 mb-2">Game: {featuredClip.game}</p>
                <p className="text-sm text-green-400 mb-2">
                  by {featuredClip.uploader_gamertag}
                </p>
                <div className="flex space-x-4 text-sm">
                  <span className="flex items-center gap-1">
                    👍 {featuredClip.votes}
                  </span>
                  <span className="flex items-center gap-1">
                    ❤️ {featuredClip.likes}
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold mb-2">Welcome to MLG.clan</h3>
                <p className="text-gray-300 mb-2">Connect your wallet and start uploading gaming clips!</p>
              </div>
            )}
            
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="font-bold mb-2 text-green-400 flex items-center gap-2">
                <TrendingUp size={18} />
                Activity Feed
              </h4>
              <div className="space-y-2 text-sm max-h-48 overflow-y-auto">
                {clips.slice(0, 5).map((clip, index) => (
                  <div key={clip.id} className="flex items-center space-x-2">
                    <span className="text-green-400">●</span>
                    <span>{clip.uploader_gamertag} uploaded "{clip.title}"</span>
                    <span className="text-gray-400 text-xs">
                      {new Date(clip.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
                {clips.length === 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-green-400">●</span>
                    <span>Welcome to MLG.clan!</span>
                    <span className="text-gray-400 text-xs">now</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-900 to-green-800 border border-green-600 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-green-400 flex items-center gap-2">
            <Crown />
            Join the Clan
          </h2>
          <p className="text-gray-300 mb-4">Connect your wallet to start uploading clips and voting!</p>
          <div className="bg-green-600 hover:bg-green-500 px-6 py-3 rounded-lg font-semibold text-center cursor-pointer transition-colors">
            Connect Wallet
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-900 to-green-800 border border-green-600 p-6 rounded-lg">
          <h3 className="text-lg font-bold mb-3 text-green-400 flex items-center gap-2">
            <TrendingUp />
            Platform Stats
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Clips:</span>
              <span className="text-green-400">{stats.totalClips}</span>
            </div>
            <div className="flex justify-between">
              <span>Votes:</span>
              <span className="text-green-400">{stats.totalVotes}</span>
            </div>
            <div className="flex justify-between">
              <span>Users:</span>
              <span className="text-green-400">{stats.totalUsers}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Gamerscore:</span>
              <span className="text-yellow-400">{stats.totalGamerscore}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-900 to-green-800 border border-green-600 p-6 rounded-lg">
          <h3 className="text-lg font-bold mb-3 text-green-400 flex items-center gap-2">
            <Users />
            Your Progress
          </h3>
          {user ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Your Clips:</span>
                <span className="text-purple-400">{user.total_clips || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Your Gamerscore:</span>
                <span className="text-yellow-400">{gamerscore}G</span>
              </div>
              <div className="flex justify-between">
                <span>Login Streak:</span>
                <span className="text-red-400">{user.login_streak || 0} days</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Connect wallet to see your progress</p>
          )}
        </div>
      </div>

      {/* Recent Clips */}
      <div className="bg-gradient-to-br from-green-900 to-green-800 border border-green-600 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4 text-green-400 flex items-center gap-2">
          <Play />
          Latest Clips
        </h2>
        {clips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clips.slice(0, 6).map((clip) => (
              <div key={clip.id} className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-bold mb-2 truncate">{clip.title}</h4>
                <p className="text-sm text-gray-400 mb-1">{clip.game}</p>
                <p className="text-xs text-green-400 mb-2">by {clip.uploader_gamertag}</p>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex space-x-3">
                    <span>👍 {clip.votes}</span>
                    <span>❤️ {clip.likes}</span>
                  </div>
                  <a
                    href={clip.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:text-green-300 underline"
                  >
                    Watch
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">No clips uploaded yet. Be the first!</p>
        )}
      </div>
    </div>
  );
};

export default HomePage;