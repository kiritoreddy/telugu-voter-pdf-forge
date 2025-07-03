/* ------------------------------------------------------------------
   VoterForm.tsx  –  Single-voter entry component
   ------------------------------------------------------------------ */
   import React, { useState } from 'react';
   import {
     Card,
     CardContent,
     CardHeader,
     CardTitle,
   } from '@/components/ui/card';
   import { Button } from '@/components/ui/button';
   import { Input } from '@/components/ui/input';
   import { Label } from '@/components/ui/label';
   import {
     Select,
     SelectContent,
     SelectItem,
     SelectTrigger,
     SelectValue,
   } from '@/components/ui/select';
   import { Camera } from 'lucide-react';
   import { VoterFormData, Voter } from '@/types/voter';
   
   /* ---------------------------------------------------------------
      Helper – convert ISO (YYYY-MM-DD) → DD-MM-YYYY for storage
      --------------------------------------------------------------- */
   const toDDMMYYYY = (iso: string): string => {
     if (!iso) return '';
     const [y, m, d] = iso.split('-');
     return `${d}-${m}-${y}`; // DD-MM-YYYY
   };
   
   /* ===============================================================
      Component
      =============================================================== */
   interface VoterFormProps {
     onAddVoter: (voter: Voter) => void;
   }
   
   const VoterForm: React.FC<VoterFormProps> = ({ onAddVoter }) => {
     const [formData, setFormData] = useState<VoterFormData>({
       entryNumber: '',
       entryDate:   '',
       name:        '',
       fatherHusbandName: '',
       village:     '',
       caste:       '',
       age:         '',
       gender:      'Male',
       photo:       null,
     });
   
     const [photoPreview, setPhotoPreview] = useState<string | null>(null);
   
     /* ------------ handlers -------------------------------------- */
     const handleInputChange = (field: keyof VoterFormData, value: string) =>
       setFormData((prev) => ({ ...prev, [field]: value }));
   
     const handlePhotoChange = (
       e: React.ChangeEvent<HTMLInputElement>
     ) => {
       const file = e.target.files?.[0];
       if (!file) return;
   
       setFormData((prev) => ({ ...prev, photo: file }));
   
       const reader = new FileReader();
       reader.onload = (ev) =>
         setPhotoPreview(ev.target?.result as string);
       reader.readAsDataURL(file);
     };
   
     const handleSubmit = (e: React.FormEvent) => {
       e.preventDefault();
   
       const newVoter: Voter = {
         id: Date.now().toString(),
         entryNumber:       formData.entryNumber,
         entryDate:         toDDMMYYYY(formData.entryDate), // ← reformatted!
         name:              formData.name,
         fatherHusbandName: formData.fatherHusbandName,
         village:           formData.village,
         caste:             formData.caste,
         age:               formData.age,
         gender:            formData.gender,
         photo:             photoPreview,
       };
   
       onAddVoter(newVoter);
   
       /* reset form */
       setFormData({
         entryNumber: '',
         entryDate:   '',
         name:        '',
         fatherHusbandName: '',
         village:     '',
         caste:       '',
         age:         '',
         gender:      'Male',
         photo:       null,
       });
       setPhotoPreview(null);
     };
   
     /* =============================================================
        RENDER
        ============================================================= */
     return (
       <Card className="w-full max-w-2xl mx-auto">
         <CardHeader>
           <CardTitle className="text-2xl font-bold text-center">
             Enter Voter Details
           </CardTitle>
         </CardHeader>
   
         <CardContent>
           <form onSubmit={handleSubmit} className="space-y-4">
             {/* ---- entry number / date ---- */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <Label htmlFor="entryNumber">Entry Number</Label>
                 <Input
                   id="entryNumber"
                   value={formData.entryNumber}
                   onChange={(e) =>
                     handleInputChange('entryNumber', e.target.value)
                   }
                   required
                 />
               </div>
   
               <div>
                 <Label htmlFor="entryDate">Entry Date</Label>
                 <Input
                   id="entryDate"
                   type="date"
                   value={formData.entryDate}
                   onChange={(e) =>
                     handleInputChange('entryDate', e.target.value)
                   }
                   required
                 />
               </div>
             </div>
   
             {/* ---- name ---- */}
             <div>
               <Label htmlFor="name">Name</Label>
               <Input
                 id="name"
                 value={formData.name}
                 onChange={(e) =>
                   handleInputChange('name', e.target.value)
                 }
                 placeholder="Enter full name"
                 required
               />
             </div>
   
             {/* ---- father / husband ---- */}
             <div>
               <Label htmlFor="fatherHusbandName">
                 Father / Husband Name
               </Label>
               <Input
                 id="fatherHusbandName"
                 value={formData.fatherHusbandName}
                 onChange={(e) =>
                   handleInputChange(
                     'fatherHusbandName',
                     e.target.value
                   )
                 }
                 required
               />
             </div>
   
             {/* ---- village + caste ---- */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <Label htmlFor="village">Village</Label>
                 <Input
                   id="village"
                   value={formData.village}
                   onChange={(e) =>
                     handleInputChange('village', e.target.value)
                   }
                   required
                 />
               </div>
   
               <div>
                 <Label htmlFor="caste">Caste</Label>
                 <Input
                   id="caste"
                   value={formData.caste}
                   onChange={(e) =>
                     handleInputChange('caste', e.target.value)
                   }
                   required
                 />
               </div>
             </div>
   
             {/* ---- age + gender ---- */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <Label htmlFor="age">Age</Label>
                 <Input
                   id="age"
                   type="number"
                   value={formData.age}
                   onChange={(e) =>
                     handleInputChange('age', e.target.value)
                   }
                   min="18"
                   max="120"
                   required
                 />
               </div>
   
               <div>
                 <Label htmlFor="gender">Gender</Label>
                 <Select
                   value={formData.gender}
                   onValueChange={(val) =>
                     handleInputChange('gender', val as 'Male' | 'Female')
                   }
                 >
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
   
             {/* ---- photo ---- */}
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
   
             {/* ---- submit ---- */}
             <Button type="submit" className="w-full text-lg">
               Add Voter
             </Button>
           </form>
         </CardContent>
       </Card>
     );
   };
   
   export default VoterForm;
   