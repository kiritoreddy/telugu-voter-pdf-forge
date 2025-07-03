
import React from 'react';
import { Voter } from '@/types/voter';
import VoterCard from './VoterCard';

interface VoterPreviewProps {
  voters: Voter[];
  headerText: string;
  onEditVoter: (voter: Voter) => void;
}

const VoterPreview: React.FC<VoterPreviewProps> = ({ voters, headerText, onEditVoter }) => {
  if (voters.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          No voters added yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">
          {headerText}
        </h2>
        <p className="text-lg text-gray-700">Members List</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" id="voter-preview">
        {voters.map((voter, index) => (
          <VoterCard 
            key={voter.id} 
            voter={voter} 
            index={index} 
            onEdit={onEditVoter}
          />
        ))}
      </div>
    </div>
  );
};

export default VoterPreview;
