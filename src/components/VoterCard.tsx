
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { Voter } from '@/types/voter';

interface VoterCardProps {
  voter: Voter;
  index: number;
  onEdit: (voter: Voter) => void;
}

const VoterCard: React.FC<VoterCardProps> = ({ voter, index, onEdit }) => {
  return (
    <Card className="p-0 border-2 border-gray-400 bg-white voter-card relative">
      <Button
        onClick={() => onEdit(voter)}
        className="absolute top-2 right-2 z-10 h-8 w-8 p-0"
        variant="outline"
        size="sm"
      >
        <Edit className="h-4 w-4" />
      </Button>
      
      <div className="flex h-40">
        {/* Serial Number Column - 10% width */}
        <div className="w-[10%] border-r-2 border-gray-400 flex items-center justify-center bg-gray-50">
          <span className="font-bold text-lg">{index + 1}</span>
        </div>

        {/* Text Details Section - 65% width */}
        <div className="w-[65%] p-3 min-w-0">
          <div className="space-y-1 text-sm">
            {/* Line 1: Entry No. and Entry Date */}
            <div className="flex justify-between">
              <span><strong>Entry No.:</strong> {voter.entryNumber}</span>
              <span><strong>Entry Date:</strong> {voter.entryDate}</span>
            </div>
            
            {/* Line 2: Name */}
            <div>
              <span><strong>Name:</strong> <span className="font-semibold">{voter.name}</span></span>
            </div>
            
            {/* Line 3: Father/Husband Name */}
            <div>
              <span><strong>Father/Husband Name:</strong> {voter.fatherHusbandName}</span>
            </div>
            
            {/* Line 4: Village */}
            <div>
              <span><strong>Village:</strong> {voter.village}</span>
            </div>
            
            {/* Line 5: Caste and Age */}
            <div className="flex justify-between">
              <span><strong>Caste:</strong> {voter.caste}</span>
              <span><strong>Age:</strong> {voter.age}</span>
            </div>
            
            {/* Line 6: Gender */}
            <div>
              <span><strong>Gender:</strong> {voter.gender}</span>
            </div>
          </div>
        </div>

        {/* Photo Section - 25% width */}
        <div className="w-[25%] border-l-2 border-gray-400 p-2">
          {voter.photo ? (
            <img
              src={voter.photo}
              alt={voter.name}
              className="w-full h-full object-cover border border-gray-300"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 border border-gray-300 flex items-center justify-center">
              <span className="text-xs text-gray-500">Photo</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default VoterCard;
