'use client';

import React, { useState, useCallback } from 'react';
import { FileUploadZone } from '@/components/FileUploadZone';
import { PDFViewer } from '@/components/PDFViewer';
import { VideoPlayer } from '@/components/VideoPlayer';
import { SplitScreenViewer } from '@/components/SplitScreenViewer';
import FormattedCV from '@/components/FormattedCV';
import InternalCVEditor from '@/components/InternalCVEditor';
import { Button } from '@/components/ui/button';
import { FileText, Edit3, ArrowLeft, Split, Eye } from 'lucide-react';
import { AnonymousCandidate, ProcessedCVData } from '@/lib/types';

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string>('');
  const [showSplitView, setShowSplitView] = useState(false);
  const [processedCV, setProcessedCV] = useState<ProcessedCVData | null>(null);
  const [anonymousCandidate, setAnonymousCandidate] = useState<AnonymousCandidate | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showInternalEditor, setShowInternalEditor] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);

  const handleFileUpload = useCallback((file: File) => {
    console.log('File uploaded:', file.name, file.type, file.size);
    setUploadedFile(file);
    const url = URL.createObjectURL(file);
    console.log('Created file URL:', url);
    setFileUrl(url);
    setShowSplitView(false);
    setProcessedCV(null);
    setAnonymousCandidate(null);
    setProcessingError(null);
  }, []);

  const handleCVProcessed = useCallback((data: ProcessedCVData) => {
    setProcessedCV(data);
    if (data.extractedData) {
      // Create anonymous candidate from extracted data
      const anonymous: AnonymousCandidate = {
        id: 'temp-' + Date.now(),
        title: data.extractedData.title,
        summary: data.extractedData.summary,
        sectionOrder: data.extractedData.sectionOrder,
        skills: data.extractedData.skills,
        education: data.extractedData.education,
        experience: data.extractedData.experience,
        culturalFitRating: data.extractedData.culturalFitRating,
        linkedinQuestions: data.extractedData.linkedinQuestions
      };
      setAnonymousCandidate(anonymous);
    }
    setIsProcessing(false);
    setProcessingError(null);
  }, []);

  const handleProcessingStart = useCallback(() => {
    setIsProcessing(true);
    setProcessingError(null);
  }, []);

  const handleProcessingEnd = useCallback(() => {
    setIsProcessing(false);
  }, []);

  const handleSaveInternalCV = useCallback((updatedCandidate: AnonymousCandidate) => {
    setAnonymousCandidate(updatedCandidate);
    setShowInternalEditor(false);
  }, []);

  const handleDeleteInternalCV = useCallback(() => {
    setAnonymousCandidate(null);
    setShowInternalEditor(false);
  }, []);

  const createAnonymousCandidate = useCallback(() => {
    if (!uploadedFile) return null;
    
    return {
      id: 'temp-' + Date.now(),
      name: 'Anonymous Candidate',
      email: 'anonymous@example.com',
      phone: '***-***-****',
      location: 'Location Hidden',
      summary: 'Professional summary with personal information removed.',
      experience: [
        {
          title: 'Software Engineer',
          company: 'Tech Company',
          duration: '2020 - Present',
          description: 'Developed and maintained web applications using modern technologies.'
        }
      ],
      education: [
        {
          degree: 'Bachelor of Science in Computer Science',
          institution: 'University Name',
          year: '2020'
        }
      ],
      skills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
      certifications: [],
      languages: ['English'],
      linkedinQuestions: []
    };
  }, [uploadedFile]);

  const getFileType = (file: File): string => {
    return file.type;
  };

  const renderFileViewer = () => {
    if (!uploadedFile) return null;

    const fileType = getFileType(uploadedFile);
    console.log('Rendering file viewer for type:', fileType, 'file:', uploadedFile.name);

    if (fileType === 'application/pdf') {
      console.log('Rendering PDFViewer component');
      return <PDFViewer file={uploadedFile} title={uploadedFile.name} />;
    } else if (fileType.startsWith('video/')) {
      console.log('Rendering VideoPlayer component');
      return <VideoPlayer src={fileUrl} title={uploadedFile.name} />;
    } else {
      console.log('Rendering unsupported file type viewer');
      return (
        <div className="h-full flex items-center justify-center bg-gray-800 rounded-lg">
          <div className="text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300">Unsupported file type: {fileType}</p>
          </div>
        </div>
      );
    }
  };

  const handleProcessCV = async () => {
    if (!uploadedFile) return;

    handleProcessingStart();

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);

      const response = await fetch('/api/upload-cv', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        handleCVProcessed(data.data);
      } else {
        throw new Error(data.error || 'Failed to process CV');
      }
    } catch (error) {
      console.error('Error processing CV:', error);
      setProcessingError(error instanceof Error ? error.message : 'Failed to process CV');
    } finally {
      handleProcessingEnd();
    }
  };

  if (!uploadedFile) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
        
          <div className="bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-700">
            <FileUploadZone
              title="Upload PDF, Video, or CV"
              description="Drag and drop your files here or click to browse"
              acceptedTypes=".pdf,.mp4,.mov,.avi,.doc,.docx,.txt"
              onUpload={handleFileUpload}
              maxSize={100}
            />
            
        
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setUploadedFile(null);
                setFileUrl('');
                setShowSplitView(false);
                setProcessedCV(null);
                setAnonymousCandidate(null);
                setProcessingError(null);
                if (fileUrl) {
                  URL.revokeObjectURL(fileUrl);
                }
              }}
              className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Upload
            </button>
            <h2 className="text-xl font-semibold text-white">
              {uploadedFile.name}
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            {!showSplitView && (
              <Button
                onClick={() => setShowSplitView(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Split className="h-4 w-4" />
                Split View
              </Button>
            )}
            
            {showSplitView && (
              <Button
                onClick={() => setShowSplitView(false)}
                className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700"
              >
                <Eye className="h-4 w-4" />
                Single View
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="h-[calc(100vh-80px)]">
        {showSplitView ? (
          <SplitScreenViewer
            leftContent={renderFileViewer()}
            rightContent={
              anonymousCandidate ? (
                <div className="h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Formatted CV</h3>
                    <Button
                      onClick={() => setShowInternalEditor(true)}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                    >
                      <Edit3 className="h-4 w-4" />
                      Edit CV
                    </Button>
                  </div>
                  <div className="h-full overflow-auto">
                    <FormattedCV candidate={anonymousCandidate} />
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-800 rounded-lg">
                  <div className="text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-300 mb-4">
                      Process the CV to see the formatted version here
                    </p>
                    <Button
                      onClick={handleProcessCV}
                      disabled={isProcessing}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isProcessing ? 'Processing...' : 'Process CV'}
                    </Button>
                  </div>
                </div>
              )
            }
            leftTitle="Original File"
            rightTitle="Formatted CV"
          />
        ) : (
          <div className="h-full p-6">
            <div className="max-w-6xl mx-auto">
              {/* File Viewer */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">File Preview</h3>
                  <div className="flex items-center gap-3">
                    {!processedCV && (
                      <Button
                        onClick={handleProcessCV}
                        disabled={isProcessing}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isProcessing ? 'Processing...' : 'Process CV'}
                      </Button>
                    )}
                    {anonymousCandidate && (
                      <Button
                        onClick={() => setShowInternalEditor(true)}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                      >
                        <Edit3 className="h-4 w-4" />
                        Edit CV
                      </Button>
                    )}
                  </div>
                </div>
                
                {processingError && (
                  <div className="mb-4 p-4 bg-red-900/50 border border-red-700 rounded-lg">
                    <p className="text-red-300">Error: {processingError}</p>
                  </div>
                )}
                
                <div className="h-[600px] bg-gray-800 rounded-lg overflow-hidden">
                  {renderFileViewer()}
                </div>
              </div>

              {/* Processed CV Display */}
              {anonymousCandidate && (
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Formatted CV</h3>
                    <Button
                      onClick={() => setShowInternalEditor(true)}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                    >
                      <Edit3 className="h-4 w-4" />
                      Edit CV
                    </Button>
                  </div>
                  <div className="max-h-[600px] overflow-auto">
                    <FormattedCV candidate={anonymousCandidate} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Internal CV Editor Modal */}
      {showInternalEditor && anonymousCandidate && (
        <InternalCVEditor
          candidate={anonymousCandidate}
          onCandidateChange={setAnonymousCandidate}
          onSave={() => setShowInternalEditor(false)}
          onDelete={handleDeleteInternalCV}
          onClose={() => setShowInternalEditor(false)}
        />
      )}
    </div>
  );
}
