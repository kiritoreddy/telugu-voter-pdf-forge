
import React from 'react';
import { Card } from '@/components/ui/card';
import { Voter } from '@/types/voter';

interface VoterCardProps {
  voter: Voter;
  index: number;
}

const VoterCard: React.FC<VoterCardProps> = ({ voter, index }) => {
  return (
    <Card className="p-0 border-2 border-gray-400 bg-white voter-card">
      <div className="flex h-32">
        {/* Serial Number Column - Left Side */}
        <div className="w-8 border-r-2 border-gray-400 flex items-center justify-center bg-gray-50">
          <span className="font-bold text-sm">{index + 1}</span>
        </div>

        {/* Details Section - Middle */}
        <div className="flex-1 p-2 min-w-0">
          <div className="space-y-0.5 text-xs">
            <div className="grid grid-cols-1 gap-0.5">
              <div className="flex">
                <span className="font-telugu w-16 text-xs font-medium">ప్రవేశ సంఖ్యా:</span>
                <span className="font-telugu text-xs">{voter.entryNumber}</span>
              </div>
              <div className="flex">
                <span className="font-telugu w-16 text-xs font-medium">ప్రవేశ తేది:</span>
                <span className="font-telugu text-xs">{voter.entryDate}</span>
              </div>
              <div className="flex">
                <span className="font-telugu w-16 text-xs font-medium">పేరు:</span>
                <span className="font-telugu text-xs font-semibold">{voter.name}</span>
              </div>
              <div className="flex">
                <span className="font-telugu w-16 text-xs font-medium">తండ్రి/భర్త:</span>
                <span className="font-telugu text-xs">{voter.fatherHusbandName}</span>
              </div>
              <div className="flex">
                <span className="font-telugu w-16 text-xs font-medium">గ్రామం:</span>
                <span className="font-telugu text-xs">{voter.village}</span>
              </div>
              <div className="flex">
                <span className="font-telugu w-16 text-xs font-medium">కులం:</span>
                <span className="font-telugu text-xs">{voter.caste}</span>
              </div>
              <div className="flex">
                <span className="font-telugu w-16 text-xs font-medium">వయస్సు:</span>
                <span className="font-telugu text-xs">{voter.age}</span>
              </div>
              <div className="flex">
                <span className="font-telugu w-16 text-xs font-medium">లింగం:</span>
                <span className="font-telugu text-xs">{voter.gender}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Photo Section - Right Side */}
        <div className="w-20 border-l-2 border-gray-400 p-1">
          {voter.photo ? (
            <img
              src={voter.photo}
              alt={voter.name}
              className="w-full h-full object-cover border border-gray-300"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 border border-gray-300 flex items-center justify-center">
              <span className="text-xs text-gray-500 font-telugu">ఫోటో</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default VoterCard;
