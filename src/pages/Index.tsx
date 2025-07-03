
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VoterForm from '@/components/VoterForm';
import VoterPreview from '@/components/VoterPreview';
import { Voter } from '@/types/voter';
import { generatePDF } from '@/utils/pdfGenerator';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [voters, setVoters] = useState<Voter[]>([]);
  const [activeTab, setActiveTab] = useState('form');

  const handleAddVoter = (voter: Voter) => {
    setVoters(prev => [...prev, voter]);
    toast({
      title: "విజయవంతం!",
      description: "ఓటరు విజయవంతంగా జోడించబడ్డారు",
    });
    setActiveTab('preview');
  };

  const handleGeneratePDF = async () => {
    if (voters.length === 0) {
      toast({
        title: "దోషం",
        description: "PDF రూపొందించడానికి కనీసం ఒక ఓటరు అవసరం",
        variant: "destructive",
      });
      return;
    }

    try {
      await generatePDF(voters);
      toast({
        title: "విజయవంతం!",
        description: "PDF విజయవంతంగా రూపొందించబడింది",
      });
    } catch (error) {
      toast({
        title: "దోషం",
        description: "PDF రూపొందించడంలో దోషం",
        variant: "destructive",
      });
    }
  };

  const handleClearAll = () => {
    setVoters([]);
    toast({
      title: "క్లియర్ చేయబడింది",
      description: "అన్ని ఓటర్లు తొలగించబడ్డారు",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold font-telugu text-gray-800 mb-2">
            ధర్మసాగర్ కోఆపరేటివ్ సొసైటీ
          </h1>
          <p className="text-xl font-telugu text-gray-600">
            ఓటర్ల జాబితా PDF జనరేటర్
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="form" className="font-telugu">
              ఓటరు వివరాలు
            </TabsTrigger>
            <TabsTrigger value="preview" className="font-telugu">
              ప్రివ్యూ ({voters.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="form" className="animate-fade-in">
            <VoterForm onAddVoter={handleAddVoter} />
          </TabsContent>

          <TabsContent value="preview" className="animate-fade-in">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleGeneratePDF}
                  disabled={voters.length === 0}
                  className="font-telugu bg-green-600 hover:bg-green-700"
                >
                  PDF డౌన్‌లోడ్ చేయండి
                </Button>
                <Button
                  onClick={handleClearAll}
                  variant="outline"
                  disabled={voters.length === 0}
                  className="font-telugu"
                >
                  అన్నింటిని క్లియర్ చేయండి
                </Button>
              </div>
              
              <VoterPreview voters={voters} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
