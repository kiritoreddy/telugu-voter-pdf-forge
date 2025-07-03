
import React from 'react';
import { Voter } from '@/types/voter';
import VoterCard from './VoterCard';

interface VoterPreviewProps {
  voters: Voter[];
}

const VoterPreview: React.FC<VoterPreviewProps> = ({ voters }) => {
  if (voters.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 font-telugu text-lg">
          ఇంకా ఓటర్లు జోడించబడలేదు
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold font-telugu mb-2">
          ధర్మసాగర్ కో-ఆపరేటివ్ హౌసింగ్ సొసైటీ లిమిటెడ్, నిజామాబాద్
        </h2>
        <p className="text-lg font-telugu text-gray-700">సభ్యుల జాబితా</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" id="voter-preview">
        {voters.map((voter, index) => (
          <VoterCard key={voter.id} voter={voter} index={index} />
        ))}
      </div>
    </div>
  );
};

export default VoterPreview;
