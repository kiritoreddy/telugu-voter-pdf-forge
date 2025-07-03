
import React from 'react';
import { Card } from '@/components/ui/card';
import { Voter } from '@/types/voter';

interface VoterCardProps {
  voter: Voter;
  index: number;
}

const VoterCard: React.FC<VoterCardProps> = ({ voter, index }) => {
  return (
    <Card className="p-3 border-2 border-gray-400 bg-white voter-card">
      <div className="flex gap-3">
        {/* Details Section - Left Side */}
        <div className="flex-1 min-w-0">
          <div className="space-y-1 text-xs">
            <div className="font-bold font-telugu text-sm mb-2">
              {index + 1}. {voter.name}
            </div>
            
            <div className="grid grid-cols-1 gap-1">
              <div className="flex">
                <span className="font-telugu w-20 text-xs">ప్రవేశ సంఖ్యా:</span>
                <span className="font-telugu text-xs">{voter.entryNumber}</span>
              </div>
              <div className="flex">
                <span className="font-telugu w-20 text-xs">ప్రవేశ తేది:</span>
                <span className="font-telugu text-xs">{voter.entryDate}</span>
              </div>
              <div className="flex">
                <span className="font-telugu w-20 text-xs">తండ్రి/భర్త:</span>
                <span className="font-telugu text-xs">{voter.fatherHusbandName}</span>
              </div>
              <div className="flex">
                <span className="font-telugu w-20 text-xs">గ్రామం:</span>
                <span className="font-telugu text-xs">{voter.village}</span>
              </div>
              <div className="flex">
                <span className="font-telugu w-20 text-xs">కులం:</span>
                <span className="font-telugu text-xs">{voter.caste}</span>
              </div>
              <div className="flex">
                <span className="font-telugu w-20 text-xs">వయస్సు:</span>
                <span className="font-telugu text-xs">{voter.age}</span>
              </div>
              <div className="flex">
                <span className="font-telugu w-20 text-xs">లింగం:</span>
                <span className="font-telugu text-xs">{voter.gender}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Photo Section - Right Side */}
        <div className="flex-shrink-0">
          {voter.photo ? (
            <img
              src={voter.photo}
              alt={voter.name}
              className="w-16 h-20 object-cover border-2 border-gray-400"
            />
          ) : (
            <div className="w-16 h-20 bg-gray-100 border-2 border-gray-400 flex items-center justify-center">
              <span className="text-xs text-gray-500 font-telugu">ఫోటో</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default VoterCard;
