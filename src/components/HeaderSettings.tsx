import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AppSettings } from '@/types/voter';

interface HeaderSettingsProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
}

const HeaderSettings: React.FC<HeaderSettingsProps> = ({ settings, onUpdateSettings }) => {
  const [formData, setFormData] = useState<AppSettings>(settings);

  const handleInputChange = (field: keyof AppSettings, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFooterChange = (side: 'footerLeft' | 'footerRight', value: string) => {
    const lines = value.split('\n').slice(0, 4);
    while (lines.length < 4) {
      lines.push('');
    }
    setFormData(prev => ({ ...prev, [side]: lines as [string, string, string, string] }));
  };

  const handleSave = () => {
    onUpdateSettings(formData);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-bold">PDF Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Paper Size and Script */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="paperSize">Paper Size</Label>
              <Select 
                value={formData.pdfPaperSize} 
                onValueChange={(value) => handleInputChange('pdfPaperSize', value as 'a4' | 'legal')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a4">A4 (210 × 297 mm)</SelectItem>
                  <SelectItem value="legal">Legal (216 × 356 mm)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="script">Text Script</Label>
              <Select 
                value={formData.script} 
                onValueChange={(value) => handleInputChange('script', value as 'latin' | 'telugu')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latin">Latin (English)</SelectItem>
                  <SelectItem value="telugu">Telugu (తెలుగు)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="startSerial">Start Serial Number</Label>
              <Input
                id="startSerial"
                type="number"
                min="1"
                value={formData.startSerial}
                onChange={(e) => handleInputChange('startSerial', parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          {/* Header Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Header Settings</h3>
            
            <div>
              <Label htmlFor="headerText">PDF Header Text</Label>
              <Input
                id="headerText"
                value={formData.pdfHeader}
                onChange={(e) => handleInputChange('pdfHeader', e.target.value)}
                placeholder="Enter header text for PDF"
                className={formData.script === 'telugu' ? 'font-telugu' : 'font-inter'}
              />
            </div>
            
            <div>
              <Label htmlFor="pageTitle">PDF Page Title</Label>
              <Input
                id="pageTitle"
                value={formData.pdfPageTitle}
                onChange={(e) => handleInputChange('pdfPageTitle', e.target.value)}
                placeholder="Enter page title for PDF"
                className={formData.script === 'telugu' ? 'font-telugu' : 'font-inter'}
              />
            </div>
            
            <div>
              <Label htmlFor="subHeaderText">PDF Subheader Text</Label>
              <Input
                id="subHeaderText"
                value={formData.pdfSubHeader}
                onChange={(e) => handleInputChange('pdfSubHeader', e.target.value)}
                placeholder="Enter subheader text for PDF"
                className={formData.script === 'telugu' ? 'font-telugu' : 'font-inter'}
              />
            </div>
          </div>

          {/* Footer Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Footer Settings</h3>
            <p className="text-sm text-gray-600">Enter up to 4 lines for each footer section. Each line should be on a separate line.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="footerLeft">Left Footer (4 lines max)</Label>
                <Textarea
                  id="footerLeft"
                  rows={4}
                  value={formData.footerLeft.join('\n')}
                  onChange={(e) => handleFooterChange('footerLeft', e.target.value)}
                  placeholder="Line 1&#10;Line 2&#10;Line 3&#10;Line 4"
                  className={formData.script === 'telugu' ? 'font-telugu' : 'font-inter'}
                />
              </div>
              
              <div>
                <Label htmlFor="footerRight">Right Footer (4 lines max)</Label>
                <Textarea
                  id="footerRight"
                  rows={4}
                  value={formData.footerRight.join('\n')}
                  onChange={(e) => handleFooterChange('footerRight', e.target.value)}
                  placeholder="Line 1&#10;Line 2&#10;Line 3&#10;Line 4"
                  className={formData.script === 'telugu' ? 'font-telugu' : 'font-inter'}
                />
              </div>
            </div>
          </div>

          <Button onClick={handleSave} className="w-full">
            Save Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HeaderSettings;