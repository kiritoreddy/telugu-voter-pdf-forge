
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera } from 'lucide-react';
import { Voter, VoterFormData } from '@/types/voter';

interface EditVoterDialogProps {
  voter: Voter | null;
  open: boolean;
  onClose: () => void;
  onSave: (voter: Voter) => void;
}

const EditVoterDialog: React.FC<EditVoterDialogProps> = ({ voter, open, onClose, onSave }) => {
  const [formData, setFormData] = useState<VoterFormData>({
    entryNumber: voter?.entryNumber || '',
    entryDate: voter?.entryDate || '',
    name: voter?.name || '',
    fatherHusbandName: voter?.fatherHusbandName || '',
    village: voter?.village || '',
    caste: voter?.caste || '',
    age: voter?.age || '',
    gender: voter?.gender || 'Male',
    photo: null,
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(voter?.photo || null);

  React.useEffect(() => {
    if (voter) {
      setFormData({
        entryNumber: voter.entryNumber,
        entryDate: voter.entryDate,
        name: voter.name,
        fatherHusbandName: voter.fatherHusbandName,
        village: voter.village,
        caste: voter.caste,
        age: voter.age,
        gender: voter.gender,
        photo: null,
      });
      setPhotoPreview(voter.photo);
    }
  }, [voter]);

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

  const handleSave = () => {
    if (!voter) return;

    const updatedVoter: Voter = {
      ...voter,
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

    onSave(updatedVoter);
    onClose();
  };

  if (!voter) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Voter Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="entryNumber">Entry Number</Label>
              <Input
                id="entryNumber"
                value={formData.entryNumber}
                onChange={(e) => handleInputChange('entryNumber', e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="entryDate">Entry Date</Label>
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
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="fatherHusbandName">Father/Husband Name</Label>
            <Input
              id="fatherHusbandName"
              value={formData.fatherHusbandName}
              onChange={(e) => handleInputChange('fatherHusbandName', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="village">Village</Label>
              <Input
                id="village"
                value={formData.village}
                onChange={(e) => handleInputChange('village', e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="caste">Caste</Label>
              <Input
                id="caste"
                value={formData.caste}
                onChange={(e) => handleInputChange('caste', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="age">Age</Label>
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
              <Label htmlFor="gender">Gender</Label>
              <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value as 'Male' | 'Female')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="photo">Upload Photo</Label>
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
                    <p className="text-sm text-gray-500">Select Photo</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1">
              Save Changes
            </Button>
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditVoterDialog;
