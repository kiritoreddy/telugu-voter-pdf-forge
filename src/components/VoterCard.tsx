
import React from 'react';
import { Card } from '@/components/ui/card';
import { Voter } from '@/types/voter';

interface VoterCardProps {
  voter: Voter;
  index: number;
}

const VoterCard: React.FC<VoterCardProps> = ({ voter, index }) => {
  const isPhotoLeft = index % 2 === 0;

  return (
    <Card className="p-4 border border-gray-300 bg-white voter-card">
      <div className={`flex gap-4 ${isPhotoLeft ? 'flex-row' : 'flex-row-reverse'}`}>
        {/* Photo Section */}
        <div className="flex-shrink-0">
          {voter.photo ? (
            <img
              src={voter.photo}
              alt={voter.name}
              className="w-20 h-24 object-cover border border-gray-400 rounded-sm"
            />
          ) : (
            <div className="w-20 h-24 bg-gray-200 border border-gray-400 rounded-sm flex items-center justify-center">
              <span className="text-xs text-gray-500 font-telugu">ఫోటో</span>
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="flex-1 min-w-0">
          <div className="space-y-1 text-sm">
            <div className="flex">
              <span className="font-telugu w-16 text-xs">ప్రవేశ సంఖ్యా:</span>
              <span className="font-telugu text-xs">{voter.entryNumber}</span>
            </div>
            <div className="flex">
              <span className="font-telugu w-16 text-xs">ప్రవేశ తేది:</span>
              <span className="font-telugu text-xs">{voter.entryDate}</span>
            </div>
            <div className="flex">
              <span className="font-telugu w-16 text-xs">పేరు:</span>
              <span className="font-telugu text-xs font-medium">{voter.name}</span>
            </div>
            <div className="flex">
              <span className="font-telugu w-16 text-xs">తండ్రి/భర్త:</span>
              <span className="font-telugu text-xs">{voter.fatherHusbandName}</span>
            </div>
            <div className="flex">
              <span className="font-telugu w-16 text-xs">గ్రామం:</span>
              <span className="font-telugu text-xs">{voter.village}</span>
            </div>
            <div className="flex">
              <span className="font-telugu w-16 text-xs">కులం:</span>
              <span className="font-telugu text-xs">{voter.caste}</span>
            </div>
            <div className="flex">
              <span className="font-telugu w-16 text-xs">వయస్సు:</span>
              <span className="font-telugu text-xs">{voter.age}</span>
            </div>
            <div className="flex">
              <span className="font-telugu w-16 text-xs">లింగం:</span>
              <span className="font-telugu text-xs">{voter.gender}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default VoterCard;
