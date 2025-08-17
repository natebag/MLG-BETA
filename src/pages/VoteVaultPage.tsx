import React, { useState } from 'react';
import { useClips } from '../contexts/ClipsContext';
import { useUser } from '../contexts/UserContext';
import { openUserProfile } from '../components/UserProfileModal';
import { Search, SortDesc, Play, ThumbsUp, Heart, ExternalLink } from 'lucide-react';

const VoteVaultPage: React.FC = () => {
  const { clips, voteClip, likeClip, loading } = useClips();
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('votes-desc');

  const handleVote = async (clipId: string) => {
    await voteClip(clipId);
  };

  const handleLike = async (clipId: string) => {
    await likeClip(clipId);
  };

  const handleUsernameClick = (userId: string) => {
    if (userId !== user?.id) {
      openUserProfile(userId);
    }
  };

  const getClanInfo = () => {
    return {
      tag: '[MLG]',
      color: 'text-purple-400'
    };
  };

  // Filter and sort clips
  const filteredAndSortedClips = React.useMemo(() => {
    let filtered = clips;

    // Search filter
    if (searchTerm) {
      filtered = clips.filter(clip =>
        clip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clip.game.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clip.uploader_gamertag.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    switch (sortBy) {
      case 'votes-desc':
        filtered.sort((a, b) => b.votes - a.votes);
        break;
      case 'date-desc':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'likes-desc':
        filtered.sort((a, b) => b.likes - a.likes);
        break;
    }

    return filtered;
  }, [clips, searchTerm, sortBy]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading clips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-400 flex items-center gap-2">
          <Play />
          Vote Vault
        </h1>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search clips..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:border-green-400 focus:outline-none"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-green-700 text-white p-2 rounded-lg border border-green-600 focus:outline-none"
          >
            <option value="votes-desc">Most Votes</option>
            <option value="date-desc">Most Recent</option>
            <option value="likes-desc">Most Liked</option>
          </select>
        </div>
      </div>

      {filteredAndSortedClips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedClips.map((clip) => {
            const hasVoted = user && clip.voters.includes(user.id);
            const hasLiked = user && clip.likers.includes(user.id);
            const isOwner = user && clip.uploader_id === user.id;
            const clanInfo = getClanInfo();

            return (
              <div
                key={clip.id}
                className="bg-gradient-to-br from-green-900 to-green-800 border border-green-600 p-4 rounded-lg hover:border-green-400 transition-all duration-300 hover:scale-105"
              >
                <h3 className="font-bold mb-2 text-lg">{clip.title}</h3>
                <p className="text-sm text-gray-400 mb-1">{clip.game}</p>
                <p className="text-xs text-green-400 mb-3">
                  by{' '}
                  <span className={clanInfo.color}>{clanInfo.tag}</span>
                  {' '}
                  <button
                    onClick={() => handleUsernameClick(clip.uploader_id)}
                    className="hover:underline cursor-pointer"
                  >
                    {clip.uploader_gamertag}
                  </button>
                </p>

                <div className="flex justify-between items-center text-sm mb-4">
                  <div className="flex space-x-4">
                    <span className="flex items-center gap-1">
                      <ThumbsUp size={16} />
                      {clip.votes}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart size={16} />
                      {clip.likes}
                    </span>
                  </div>
                  <span className="text-gray-400 text-xs">
                    {new Date(clip.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex gap-2">
                  <a
                    href={clip.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-green-600 hover:bg-green-500 text-center py-2 px-3 rounded text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <ExternalLink size={16} />
                    Watch
                  </a>
                  
                  {user && !isOwner && (
                    <button
                      onClick={() => handleVote(clip.id)}
                      disabled={hasVoted}
                      className={`px-3 py-2 rounded text-sm transition-colors ${
                        hasVoted
                          ? 'bg-gray-600 cursor-not-allowed opacity-50'
                          : 'bg-blue-600 hover:bg-blue-500'
                      }`}
                    >
                      <ThumbsUp size={16} />
                    </button>
                  )}
                  
                  {user && (
                    <button
                      onClick={() => handleLike(clip.id)}
                      className={`px-3 py-2 rounded text-sm transition-colors ${
                        hasLiked
                          ? 'bg-red-700 text-red-200'
                          : 'bg-red-600 hover:bg-red-500'
                      }`}
                    >
                      <Heart size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <Play size={64} className="mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400 text-lg">
            {searchTerm ? 'No clips found matching your search.' : 'No clips uploaded yet. Be the first!'}
          </p>
        </div>
      )}
    </div>
  );
};

export default VoteVaultPage;