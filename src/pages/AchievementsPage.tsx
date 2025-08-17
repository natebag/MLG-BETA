import React from 'react';
import { useUser } from '../contexts/UserContext';
import { Trophy, Star, Target, Users, Crown, Zap } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  points: number;
  unlocked?: boolean;
  unlockedAt?: string;
}

const AchievementsPage: React.FC = () => {
  const { user, gamerscore } = useUser();

  const achievements: Achievement[] = [
    {
      id: 'firstConnect',
      name: 'Welcome!',
      description: 'Connect your wallet',
      icon: <Crown className="w-8 h-8" />,
      points: 10,
      unlocked: !!user,
    },
    {
      id: 'firstUpload',
      name: 'Content Creator',
      description: 'Upload your first clip',
      icon: <Star className="w-8 h-8" />,
      points: 20,
      unlocked: (user?.total_clips || 0) > 0,
    },
    {
      id: 'firstVote',
      name: 'Democracy',
      description: 'Cast your first vote',
      icon: <Target className="w-8 h-8" />,
      points: 10,
    },
    {
      id: 'tenVotes',
      name: 'Active Voter',
      description: 'Cast 10 votes',
      icon: <Zap className="w-8 h-8" />,
      points: 30,
    },
    {
      id: 'fiveUploads',
      name: 'Clip Master',
      description: 'Upload 5 clips',
      icon: <Trophy className="w-8 h-8" />,
      points: 50,
      unlocked: (user?.total_clips || 0) >= 5,
    },
    {
      id: 'hundredVotesReceived',
      name: 'Popular',
      description: 'Receive 100 total votes',
      icon: <Star className="w-8 h-8" />,
      points: 100,
      unlocked: (user?.total_votes || 0) >= 100,
    },
    {
      id: 'firstFriend',
      name: 'Social Butterfly',
      description: 'Add your first friend',
      icon: <Users className="w-8 h-8" />,
      points: 10,
    },
    {
      id: 'tenFriends',
      name: 'Influencer',
      description: 'Have 10 friends',
      icon: <Crown className="w-8 h-8" />,
      points: 50,
    },
    {
      id: 'dailyStreak',
      name: 'Dedicated',
      description: 'Login 7 days in a row',
      icon: <Zap className="w-8 h-8" />,
      points: 70,
      unlocked: (user?.login_streak || 0) >= 7,
    },
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalPoints = achievements.reduce((sum, a) => sum + (a.unlocked ? a.points : 0), 0);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-green-400 mb-6 flex items-center gap-2">
        <Trophy />
        Achievements
      </h1>

      {/* Progress Overview */}
      <div className="mb-6 bg-gradient-to-br from-green-900 to-green-800 border border-green-600 p-6 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold mb-2">Your Progress</h2>
            <p className="text-gray-300">Unlock achievements to earn Gamerscore!</p>
            <div className="mt-3 text-sm text-gray-400">
              <span className="text-green-400 font-bold">{unlockedCount}</span> / {achievements.length} achievements unlocked
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-400 flex items-center gap-2">
              <Trophy />
              {gamerscore}G
            </div>
            <div className="text-sm text-gray-400">Total Gamerscore</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-600 to-green-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
            />
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {Math.round((unlockedCount / achievements.length) * 100)}% Complete
          </div>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((achievement) => {
          const isUnlocked = achievement.unlocked;
          const cardClass = isUnlocked 
            ? 'bg-gradient-to-br from-yellow-600 to-yellow-500 text-black' 
            : 'bg-gray-800 text-gray-400 border border-gray-600';

          return (
            <div
              key={achievement.id}
              className={`${cardClass} p-6 rounded-lg transition-all duration-300 ${
                isUnlocked ? 'hover:scale-105' : 'hover:border-gray-500'
              }`}
            >
              <div className="text-center mb-4">
                <div className={`mb-3 flex justify-center ${isUnlocked ? 'text-black' : 'text-gray-600'}`}>
                  {achievement.icon}
                </div>
                <h3 className={`font-bold text-lg mb-2 ${isUnlocked ? 'text-black' : 'text-gray-400'}`}>
                  {achievement.name}
                </h3>
                <p className={`text-sm mb-3 ${isUnlocked ? 'text-black opacity-80' : 'text-gray-500'}`}>
                  {achievement.description}
                </p>
                <div className={`font-bold ${isUnlocked ? 'text-black' : 'text-gray-400'}`}>
                  +{achievement.points}G
                </div>
              </div>

              {isUnlocked ? (
                <div className="text-center text-xs text-black opacity-75">
                  <div className="bg-black bg-opacity-20 rounded-full px-3 py-1 inline-block">
                    ✓ Unlocked
                  </div>
                </div>
              ) : (
                <div className="text-center text-xs text-gray-600">
                  <div className="border border-gray-600 rounded-full px-3 py-1 inline-block">
                    Not unlocked yet
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!user && (
        <div className="mt-8 text-center py-8">
          <Trophy size={64} className="mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400 text-lg mb-4">Connect your wallet to start earning achievements!</p>
        </div>
      )}
    </div>
  );
};

export default AchievementsPage;