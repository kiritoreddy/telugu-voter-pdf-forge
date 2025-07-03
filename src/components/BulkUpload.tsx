import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Download, Upload, FileSpreadsheet, Archive, AlertCircle, CheckCircle } from 'lucide-react';
import { Voter, ParsedVoter, BulkUploadError } from '@/types/voter';
import {
  downloadTemplate,
  parseExcelFile,
  parsePhotosZip,
  validateVoters,
  generateErrorReport,
  mergePhotosWithVoters,
  convertToVoters
} from '@/utils/bulkUpload';
import { toast } from '@/hooks/use-toast';

interface BulkUploadProps {
  onVotersUploaded: (voters: Voter[]) => void;
}

const BulkUpload: React.FC<BulkUploadProps> = ({ onVotersUploaded }) => {
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [photosFile, setPhotosFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<BulkUploadError[]>([]);
  const [parsedVoters, setParsedVoters] = useState<ParsedVoter[]>([]);
  const [currentStep, setCurrentStep] = useState<string>('');

  const handleDownloadTemplate = () => {
    try {
      downloadTemplate();
      toast({
        title: "Success!",
        description: "Template downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download template",
        variant: "destructive",
      });
    }
  };

  const handleExcelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
      ];
      
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid File",
          description: "Please select a valid Excel (.xlsx) or CSV file",
          variant: "destructive",
        });
        return;
      }

      // Check if file is empty
      if (file.size === 0) {
        toast({
          title: "Empty File",
          description: "The selected file is empty. Please choose a file with data.",
          variant: "destructive",
        });
        // Clear the input
        e.target.value = '';
        return;
      }

      setExcelFile(file);
      setErrors([]);
      setParsedVoters([]);
    }
  };

  const handlePhotosFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type === 'application/zip' && !file.name.endsWith('.zip')) {
        toast({
          title: "Invalid File",
          description: "Please select a valid ZIP file",
          variant: "destructive",
        });
        return;
      }

      // Check if file is empty
      if (file.size === 0) {
        toast({
          title: "Empty File",
          description: "The selected ZIP file is empty. Please choose a file with photos.",
          variant: "destructive",
        });
        // Clear the input
        e.target.value = '';
        return;
      }

      setPhotosFile(file);
    }
  };

  const handleProcess = async () => {
    if (!excelFile) {
      toast({
        title: "Missing File",
        description: "Please select an Excel file to process",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setErrors([]);
    setParsedVoters([]);

    try {
      // Step 1: Parse Excel file
      setCurrentStep('Parsing Excel file...');
      const voters = await parseExcelFile(excelFile, (progress) => {
        setProgress(progress * 0.4); // 40% for Excel parsing
      });

      // Step 2: Parse photos if provided
      let photoMap = new Map<string, string>();
      if (photosFile) {
        setCurrentStep('Processing photos...');
        photoMap = await parsePhotosZip(photosFile, (progress) => {
          setProgress(40 + (progress * 0.3)); // 30% for photo processing
        });
      }

      // Step 3: Merge photos with voters
      setCurrentStep('Merging data...');
      const votersWithPhotos = mergePhotosWithVoters(voters, photoMap);
      setProgress(75);

      // Step 4: Validate data
      setCurrentStep('Validating data...');
      const validationErrors = validateVoters(votersWithPhotos);
      setErrors(validationErrors);
      setParsedVoters(votersWithPhotos);
      setProgress(90);

      // Step 5: Complete
      setCurrentStep('Processing complete!');
      setProgress(100);

      if (validationErrors.length === 0) {
        toast({
          title: "Success!",
          description: `Successfully processed ${voters.length} voters`,
        });
      } else {
        toast({
          title: "Validation Errors",
          description: `Found ${validationErrors.length} errors. Please review and fix them.`,
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('Bulk upload error:', error);
      toast({
        title: "Processing Error",
        description: error instanceof Error ? error.message : "Failed to process files",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setCurrentStep('');
    }
  };

  const handleImportVoters = () => {
    if (errors.length > 0) {
      toast({
        title: "Cannot Import",
        description: "Please fix all validation errors before importing",
        variant: "destructive",
      });
      return;
    }

    const validVoters = parsedVoters.filter(voter => voter.errors.length === 0);
    const voters = convertToVoters(validVoters);
    
    onVotersUploaded(voters);
    
    // Reset form
    setExcelFile(null);
    setPhotosFile(null);
    setParsedVoters([]);
    setErrors([]);
    setProgress(0);
    
    toast({
      title: "Success!",
      description: `Imported ${voters.length} voters successfully`,
    });
  };

  const handleDownloadErrorReport = () => {
    try {
      generateErrorReport(errors);
      toast({
        title: "Success!",
        description: "Error report downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate error report",
        variant: "destructive",
      });
    }
  };

  const validVotersCount = parsedVoters.filter(voter => voter.errors.length === 0).length;
  const invalidVotersCount = parsedVoters.length - validVotersCount;

  return (
    <div className="space-y-6">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bulk Upload Voters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Template Download */}
            <div className="space-y-2">
              <Label>Step 1: Download Template</Label>
              <Button 
                onClick={handleDownloadTemplate}
                variant="outline"
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Excel Template
              </Button>
            </div>

            {/* File Upload */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="excelFile">Step 2: Upload Excel File *</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="excelFile"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleExcelFileChange}
                    disabled={isProcessing}
                  />
                  <FileSpreadsheet className="h-5 w-5 text-gray-400" />
                </div>
                {excelFile && (
                  <p className="text-sm text-green-600">
                    Selected: {excelFile.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="photosFile">Step 3: Upload Photos ZIP (Optional)</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="photosFile"
                    type="file"
                    accept=".zip"
                    onChange={handlePhotosFileChange}
                    disabled={isProcessing}
                  />
                  <Archive className="h-5 w-5 text-gray-400" />
                </div>
                {photosFile && (
                  <p className="text-sm text-green-600">
                    Selected: {photosFile.name}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Photos should be named with entry numbers (e.g., 001.jpg, 002.png)
                </p>
              </div>
            </div>

            {/* Process Button */}
            <div className="space-y-2">
              <Label>Step 4: Process Files</Label>
              <Button 
                onClick={handleProcess}
                disabled={!excelFile || isProcessing}
                className="w-full"
              >
                {isProcessing ? 'Processing...' : 'Process Files'}
              </Button>
            </div>

            {/* Progress */}
            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{currentStep}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            {/* Results */}
            {parsedVoters.length > 0 && (
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Valid: {validVotersCount}
                  </Badge>
                  {invalidVotersCount > 0 && (
                    <Badge variant="destructive">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Errors: {invalidVotersCount}
                    </Badge>
                  )}
                </div>

                {errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Found {errors.length} validation errors. 
                      <Button 
                        variant="link" 
                        className="p-0 h-auto ml-2"
                        onClick={handleDownloadErrorReport}
                      >
                        Download error report
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2">
                  <Button 
                    onClick={handleImportVoters}
                    disabled={errors.length > 0 || validVotersCount === 0}
                    className="flex-1"
                  >
                    Import {validVotersCount} Valid Voters
                  </Button>
                  
                  {errors.length > 0 && (
                    <Button 
                      onClick={handleDownloadErrorReport}
                      variant="outline"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Error Report
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-lg">Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <strong>Excel File Format:</strong>
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                <li>Use the downloaded template for correct column order</li>
                <li>Entry Date format: DD-MM-YYYY (e.g., 01-01-2025)</li>
                <li>Gender: Must be "Male" or "Female"</li>
                <li>Age: Number between 18 and 120</li>
                <li>All fields are required</li>
              </ul>
            </div>
            
            <div>
              <strong>Photos ZIP File:</strong>
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                <li>Name photos with entry numbers (e.g., 001.jpg, 002.png)</li>
                <li>Supported formats: JPG, JPEG, PNG, GIF, BMP</li>
                <li>Photos will be automatically matched to voters</li>
              </ul>
            </div>
            
            <div>
              <strong>Performance:</strong>
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                <li>Can handle up to 10,000 voters efficiently</li>
                <li>Processing is done in chunks to prevent browser freezing</li>
                <li>Progress is shown during processing</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkUpload;