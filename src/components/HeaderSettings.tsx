import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AppSettings } from '@/types/voter';

interface HeaderSettingsProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
}

// Update your AppSettings type to include subHeader and pageTitle if not present
// interface AppSettings {
//   pdfHeader: string;
//   pdfSubHeader: string;
//   pdfPageTitle: string;
// }

const HeaderSettings: React.FC<HeaderSettingsProps> = ({ settings, onUpdateSettings }) => {
  const [headerText, setHeaderText] = useState(settings.pdfHeader || '');
  const [subHeaderText, setSubHeaderText] = useState(settings.pdfSubHeader || '');
  const [pageTitle, setPageTitle] = useState(settings.pdfPageTitle || '');

  const handleSave = () => {
    onUpdateSettings({
      pdfHeader: headerText,
      pdfSubHeader: subHeaderText,
      pdfPageTitle: pageTitle,
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mb-6">
      <CardHeader>
        <CardTitle className="text-xl font-bold">PDF Header Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="headerText">PDF Header Text</Label>
            <Input
              id="headerText"
              value={headerText}
              onChange={(e) => setHeaderText(e.target.value)}
              placeholder="Enter header text for PDF"
            />
          </div>
          <div>
            <Label htmlFor="subHeaderText">PDF Subheader Text</Label>
            <Input
              id="subHeaderText"
              value={subHeaderText}
              onChange={(e) => setSubHeaderText(e.target.value)}
              placeholder="Enter subheader text for PDF"
            />
          </div>
          <div>
            <Label htmlFor="pageTitle">PDF Page Title</Label>
            <Input
              id="pageTitle"
              value={pageTitle}
              onChange={(e) => setPageTitle(e.target.value)}
              placeholder="Enter page title for PDF"
            />
          </div>
          <Button onClick={handleSave} className="w-full">
            Save Header Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HeaderSettings;
