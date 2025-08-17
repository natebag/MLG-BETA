import React from 'react';
import { Crown, Users, Trophy, Zap } from 'lucide-react';

const ClanPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-green-400 mb-6 flex items-center gap-2">
        <Crown />
        MLG Clan Hub
      </h1>

      <div className="bg-gradient-to-br from-green-900 to-green-800 border border-green-600 p-6 rounded-lg">
        <h2 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
          <Trophy />
          [MLG] Major League Gaming
        </h2>
        
        <div className="grid grid-cols-3 gap-4 text-center mb-6">
          <div>
            <div className="text-2xl font-bold text-green-400">1</div>
            <div className="text-sm text-gray-400">Members</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400">0</div>
            <div className="text-sm text-gray-400">Clips</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">0</div>
            <div className="text-sm text-gray-400">Votes</div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-bold mb-3 text-green-400 flex items-center gap-2">
            <Users />
            Current Members
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="bg-gray-700 p-3 rounded text-center">
              <div className="text-purple-400 font-bold text-sm mb-1">[MLG]</div>
              <div className="font-bold text-sm">Connect wallet to see members</div>
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-yellow-900 border border-yellow-600 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-200 mb-2">
            <Zap />
            <span className="font-bold">Coming Soon: Custom Clans & Treasury</span>
          </div>
          <p className="text-yellow-100 text-sm">
            Create your own clans with Solana treasury integration, officer management, and DAO governance features!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClanPage;