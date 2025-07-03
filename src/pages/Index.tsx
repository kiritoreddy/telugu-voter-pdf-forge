
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
      title: "Success!",
      description: "Voter added successfully",
    });
    setActiveTab('preview');
  };

  const handleGeneratePDF = async () => {
    if (voters.length === 0) {
      toast({
        title: "Error",
        description: "At least one voter is required to generate PDF",
        variant: "destructive",
      });
      return;
    }

    try {
      await generatePDF(voters);
      toast({
        title: "Success!",
        description: "PDF generated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error generating PDF",
        variant: "destructive",
      });
    }
  };

  const handleClearAll = () => {
    setVoters([]);
    toast({
      title: "Cleared",
      description: "All voters have been removed",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Dharmasagar Cooperative Society
          </h1>
          <p className="text-xl text-gray-600">
            Voter List PDF Generator
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="form">
              Voter Details
            </TabsTrigger>
            <TabsTrigger value="preview">
              Preview ({voters.length})
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
                  className="bg-green-600 hover:bg-green-700"
                >
                  Download PDF
                </Button>
                <Button
                  onClick={handleClearAll}
                  variant="outline"
                  disabled={voters.length === 0}
                >
                  Clear All
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
