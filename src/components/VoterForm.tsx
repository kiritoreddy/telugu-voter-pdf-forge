
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera } from 'lucide-react';
import { VoterFormData, Voter } from '@/types/voter';

interface VoterFormProps {
  onAddVoter: (voter: Voter) => void;
}

const VoterForm: React.FC<VoterFormProps> = ({ onAddVoter }) => {
  const [formData, setFormData] = useState<VoterFormData>({
    entryNumber: '',
    entryDate: '',
    name: '',
    fatherHusbandName: '',
    village: '',
    caste: '',
    age: '',
    gender: 'పురుషుడు',
    photo: null,
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handleInputChange = (field: keyof VoterFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, photo: file }));
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newVoter: Voter = {
      id: Date.now().toString(),
      entryNumber: formData.entryNumber,
      entryDate: formData.entryDate,
      name: formData.name,
      fatherHusbandName: formData.fatherHusbandName,
      village: formData.village,
      caste: formData.caste,
      age: formData.age,
      gender: formData.gender,
      photo: photoPreview,
    };

    onAddVoter(newVoter);
    
    // Reset form
    setFormData({
      entryNumber: '',
      entryDate: '',
      name: '',
      fatherHusbandName: '',
      village: '',
      caste: '',
      age: '',
      gender: 'పురుషుడు',
      photo: null,
    });
    setPhotoPreview(null);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center font-telugu">
          ఓటరు వివరాలు దర్జ్ చేయండి
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="entryNumber" className="font-telugu">ప్రవేశ సంఖ్యా</Label>
              <Input
                id="entryNumber"
                value={formData.entryNumber}
                onChange={(e) => handleInputChange('entryNumber', e.target.value)}
                required
                className="font-telugu"
              />
            </div>
            
            <div>
              <Label htmlFor="entryDate" className="font-telugu">ప్రవేశ తేది</Label>
              <Input
                id="entryDate"
                type="date"
                value={formData.entryDate}
                onChange={(e) => handleInputChange('entryDate', e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="name" className="font-telugu">పేరు</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
              className="font-telugu"
              placeholder="పూర్తి పేరు రాయండి"
            />
          </div>

          <div>
            <Label htmlFor="fatherHusbandName" className="font-telugu">తండ్రి/భర్త పేరు</Label>
            <Input
              id="fatherHusbandName"
              value={formData.fatherHusbandName}
              onChange={(e) => handleInputChange('fatherHusbandName', e.target.value)}
              required
              className="font-telugu"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="village" className="font-telugu">గ్రామము</Label>
              <Input
                id="village"
                value={formData.village}
                onChange={(e) => handleInputChange('village', e.target.value)}
                required
                className="font-telugu"
              />
            </div>
            
            <div>
              <Label htmlFor="caste" className="font-telugu">కులము</Label>
              <Input
                id="caste"
                value={formData.caste}
                onChange={(e) => handleInputChange('caste', e.target.value)}
                required
                className="font-telugu"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="age" className="font-telugu">వయస్సు</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                required
                min="18"
                max="120"
              />
            </div>
            
            <div>
              <Label htmlFor="gender" className="font-telugu">లింగం</Label>
              <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value as 'పురుషుడు' | 'స్త్రీ')}>
                <SelectTrigger>
                  <SelectValue className="font-telugu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="పురుషుడు" className="font-telugu">పురుషుడు</SelectItem>
                  <SelectItem value="స్త్రీ" className="font-telugu">స్త్రీ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="photo" className="font-telugu">ఫోటో అప్‌లోడ్ చేయండి</Label>
            <div className="mt-2">
              <input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <label
                htmlFor="photo"
                className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
              >
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="h-full w-auto object-cover rounded"
                  />
                ) : (
                  <div className="text-center">
                    <Camera className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 font-telugu">ఫోటో ఎంచుకోండి</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <Button type="submit" className="w-full font-telugu text-lg">
            ఓటరును జోడించండి
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default VoterForm;
