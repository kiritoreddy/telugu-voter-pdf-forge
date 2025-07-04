import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VoterForm from '@/components/VoterForm';
import VoterPreview from '@/components/VoterPreview';
import HeaderSettings from '@/components/HeaderSettings';
import BulkUpload from '@/components/BulkUpload';
import EditVoterDialog from '@/components/EditVoterDialog';
import { Voter, AppSettings } from '@/types/voter';
import { generatePDF } from '@/utils/pdfGenerator';
import { getStoredSettings, storeSettings } from '@/utils/localStorage';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [voters, setVoters] = useState<Voter[]>([]);
  const [activeTab, setActiveTab] = useState('settings');
  const [settings, setSettings] = useState<AppSettings>(getStoredSettings());
  const [editingVoter, setEditingVoter] = useState<Voter | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const stored = getStoredSettings();
    setSettings(stored);
  }, []);

  const handleAddVoter = (voter: Voter) => {
    setVoters(prev => [...prev, voter]);
    toast({
      title: "Success!",
      description: "Voter added successfully",
    });
    setActiveTab('preview');
  };

  const handleBulkUpload = (newVoters: Voter[]) => {
    setVoters(prev => [...prev, ...newVoters]);
    toast({
      title: "Success!",
      description: `${newVoters.length} voters imported successfully`,
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
    storeSettings(newSettings);
    toast({
      title: "Success!",
      description: "Settings saved successfully",
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
      await generatePDF(voters, settings);
      toast({
        title: "Success!",
        description: `PDF generated successfully (${settings.pdfPaperSize.toUpperCase()} format)`,
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "Error",
        description: "Error generating PDF",
        variant: "destructive",
      });
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to remove all voters? This action cannot be undone.')) {
      setVoters([]);
      toast({
        title: "Cleared",
        description: "All voters have been removed",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Voter List Management System
          </h1>
          <p className="text-xl text-gray-600">
            Complete Voter Registration & PDF Generation Platform
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="settings">
              Settings
            </TabsTrigger>
            <TabsTrigger value="form">
              Add Voter
            </TabsTrigger>
            <TabsTrigger value="bulk">
              Bulk Upload
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

          <TabsContent value="bulk" className="animate-fade-in">
            <BulkUpload onVotersUploaded={handleBulkUpload} />
          </TabsContent>

          <TabsContent value="preview" className="animate-fade-in">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleGeneratePDF}
                  disabled={voters.length === 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Download PDF ({settings.pdfPaperSize.toUpperCase()})
                </Button>
                <Button
                  onClick={handleClearAll}
                  variant="outline"
                  disabled={voters.length === 0}
                >
                  Clear All ({voters.length})
                </Button>
              </div>
              
              <VoterPreview 
                voters={voters} 
                headerText={settings.pdfHeader}
                onEditVoter={handleEditVoter}
                settings={settings}
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