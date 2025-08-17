import React from 'react';
import { Trophy, Zap, Crown, Calendar } from 'lucide-react';

const TournamentsPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-green-400 mb-6 flex items-center gap-2">
        <Trophy />
        Tournament Hub
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-900 to-green-800 border border-green-600 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <Crown className="text-yellow-400" />
            <h2 className="text-xl font-bold">Weekly Clip Contest</h2>
          </div>
          <p className="text-gray-300 mb-4">Upload your best clips to compete for the weekly crown!</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Prize Pool:</span>
              <span className="text-yellow-400 font-bold">1000 MLG Tokens</span>
            </div>
            <div className="flex justify-between">
              <span>Entries:</span>
              <span className="text-green-400">0</span>
            </div>
            <div className="flex justify-between">
              <span>Time Left:</span>
              <span className="text-red-400">Coming Soon</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-900 to-green-800 border border-green-600 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="text-purple-400" />
            <h2 className="text-xl font-bold">Clan Wars</h2>
          </div>
          <p className="text-gray-300 mb-4">Compete with your clan for supremacy!</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="text-gray-400">Not Started</span>
            </div>
            <div className="flex justify-between">
              <span>Participating Clans:</span>
              <span className="text-blue-400">0</span>
            </div>
            <div className="flex justify-between">
              <span>Next War:</span>
              <span className="text-red-400">TBA</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tournament Schedule */}
      <div className="bg-gradient-to-br from-green-900 to-green-800 border border-green-600 p-6 rounded-lg mb-6">
        <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
          <Calendar />
          Upcoming Events
        </h3>
        <div className="space-y-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-white">MLG Showcase Tournament</h4>
                <p className="text-gray-400 text-sm">Multi-game tournament featuring the best clips</p>
              </div>
              <div className="text-right">
                <div className="text-yellow-400 font-bold">500 SOL</div>
                <div className="text-xs text-gray-400">Prize Pool</div>
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-300">
              Status: <span className="text-yellow-400">Planning Phase</span>
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-white">Community Vote Event</h4>
                <p className="text-gray-400 text-sm">Vote for the best clips and earn rewards</p>
              </div>
              <div className="text-right">
                <div className="text-green-400 font-bold">Free Entry</div>
                <div className="text-xs text-gray-400">All Welcome</div>
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-300">
              Status: <span className="text-blue-400">Coming Soon</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tournament Features */}
      <div className="bg-gradient-to-br from-purple-900 to-purple-800 border border-purple-600 p-6 rounded-lg">
        <h3 className="text-lg font-bold text-purple-400 mb-4 flex items-center gap-2">
          <Zap />
          Tournament Features (Coming Soon)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>Automated prize distribution via smart contracts</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>Multi-signature tournament management</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>NFT trophies for winners</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>Community-voted tournaments</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>Seasonal leaderboards</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>Sponsor integration system</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentsPage;