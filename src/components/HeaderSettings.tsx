
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

const HeaderSettings: React.FC<HeaderSettingsProps> = ({ settings, onUpdateSettings }) => {
  const [headerText, setHeaderText] = useState(settings.pdfHeader);

  const handleSave = () => {
    onUpdateSettings({ pdfHeader: headerText });
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
          <Button onClick={handleSave} className="w-full">
            Save Header Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HeaderSettings;
