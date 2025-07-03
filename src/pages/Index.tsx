
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VoterForm from '@/components/VoterForm';
import VoterPreview from '@/components/VoterPreview';
import HeaderSettings from '@/components/HeaderSettings';
import EditVoterDialog from '@/components/EditVoterDialog';
import { Voter, AppSettings } from '@/types/voter';
import { generatePDF } from '@/utils/pdfGenerator';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [voters, setVoters] = useState<Voter[]>([]);
  const [activeTab, setActiveTab] = useState('form');
  const [settings, setSettings] = useState<AppSettings>({
    pdfHeader: 'Dharmasagar Cooperative Housing Society Limited, Nizamabad',
    pdfSubHeader: 'For the year 2025', // Or whatever default you want
    pdfPageTitle: 'Voters Register',   // Or whatever default you want
  });
  const [editingVoter, setEditingVoter] = useState<Voter | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleAddVoter = (voter: Voter) => {
    setVoters(prev => [...prev, voter]);
    toast({
      title: "Success!",
      description: "Voter added successfully",
    });
    setActiveTab('preview');
  };

  const handleEditVoter = (voter: Voter) => {
    setEditingVoter(voter);
    setIsEditDialogOpen(true);
  };

  const handleSaveEditedVoter = (updatedVoter: Voter) => {
    setVoters(prev => prev.map(v => v.id === updatedVoter.id ? updatedVoter : v));
    toast({
      title: "Success!",
      description: "Voter details updated successfully",
    });
  };

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    toast({
      title: "Success!",
      description: "Header settings updated successfully",
    });
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
      await generatePDF(
        voters, 
        settings.pdfHeader, 
        settings.pdfPageTitle, 
        settings.pdfSubHeader
      );
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
            Voter List Management System
          </h1>
          <p className="text-xl text-gray-600">
            Voter List PDF Generator
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="settings">
              Settings
            </TabsTrigger>
            <TabsTrigger value="form">
              Voter Details
            </TabsTrigger>
            <TabsTrigger value="preview">
              Preview ({voters.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="animate-fade-in">
            <HeaderSettings 
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
            />
          </TabsContent>

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
              
              <VoterPreview 
                voters={voters} 
                headerText={settings.pdfHeader}
                onEditVoter={handleEditVoter}
              />
            </div>
          </TabsContent>
        </Tabs>

        <EditVoterDialog
          voter={editingVoter}
          open={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setEditingVoter(null);
          }}
          onSave={handleSaveEditedVoter}
        />
      </div>
    </div>
  );
};

export default Index;
