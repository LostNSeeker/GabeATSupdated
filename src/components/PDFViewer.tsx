'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FileText, AlertCircle, Loader2, Download, Eye, File, Info, ExternalLink, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PDFViewerProps {
  src?: string;
  title?: string;
  className?: string;
  file?: File;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ src, title, className, file }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [showFileInfo, setShowFileInfo] = useState(false);
  const [currentViewMethod, setCurrentViewMethod] = useState<'iframe' | 'object' | 'embed' | 'error'>('iframe');
  const [retryCount, setRetryCount] = useState(0);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const objectRef = useRef<HTMLObjectElement>(null);
  const embedRef = useRef<HTMLEmbedElement>(null);

  const validatePDFFile = async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Check for PDF header: %PDF-
        const isPDF = uint8Array.length >= 4 && 
                     uint8Array[0] === 0x25 && // %
                     uint8Array[1] === 0x50 && // P
                     uint8Array[2] === 0x44 && // D
                     uint8Array[3] === 0x46;   // F
        
        console.log('PDF validation result:', isPDF);
        resolve(isPDF);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  useEffect(() => {
    let url: string | null = null;
    
    console.log('PDFViewer useEffect triggered:', { file, src });
    
    const initializeViewer = async () => {
      // If we have a file, create a blob URL
      if (file) {
        console.log('Creating blob URL for file:', file.name, file.type, file.size);
        
        // Validate PDF file
        const isValidPDF = await validatePDFFile(file);
        if (!isValidPDF) {
          console.error('File is not a valid PDF');
          setHasError(true);
          return;
        }
        
        url = URL.createObjectURL(file);
        console.log('Created blob URL:', url);
        setPdfUrl(url);
        setIsLoading(false);
        setHasError(false);
        setCurrentViewMethod('iframe');
        setRetryCount(0);
      } else if (src) {
        console.log('Using provided src URL:', src);
        setPdfUrl(src);
        setIsLoading(false);
        setHasError(false);
        setCurrentViewMethod('iframe');
        setRetryCount(0);
      } else {
        console.log('No file or src provided');
        setHasError(true);
      }
    };
    
    initializeViewer();
    
    // Cleanup function
    return () => {
      if (url) {
        console.log('Cleaning up blob URL:', url);
        URL.revokeObjectURL(url);
      }
    };
  }, [file, src]);

  const handleDownload = () => {
    if (file) {
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (src) {
      const a = document.createElement('a');
      a.href = src;
      a.download = title || 'document.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleIframeLoad = () => {
    console.log('Iframe loaded successfully');
    setIsLoading(false);
    setHasError(false);
  };

  const handleIframeError = () => {
    console.log('Iframe failed, trying object tag');
    setCurrentViewMethod('object');
  };

  const handleObjectLoad = () => {
    console.log('Object tag loaded successfully');
    setIsLoading(false);
    setHasError(false);
  };

  const handleObjectError = () => {
    console.log('Object tag failed, trying embed tag');
    setCurrentViewMethod('embed');
  };

  const handleEmbedError = () => {
    console.log('Embed tag failed, showing error state');
    setIsLoading(false);
    setHasError(true);
    setCurrentViewMethod('error');
  };

  const retryViewer = () => {
    console.log('Retrying PDF viewer');
    setRetryCount(prev => prev + 1);
    setHasError(false);
    setCurrentViewMethod('iframe');
    setIsLoading(true);
  };

  const renderPDFViewer = () => {
    if (!pdfUrl) {
      return (
        <div className="h-full flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Loading PDF...</p>
          </div>
        </div>
      );
    }

    switch (currentViewMethod) {
      case 'iframe':
        return (
          <iframe
            key={`iframe-${retryCount}`}
            ref={iframeRef}
            src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
            title={title || 'PDF Document'}
            className="w-full h-full border-0"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
            style={{ minHeight: '600px' }}
          />
        );
      
      case 'object':
        return (
          <object
            key={`object-${retryCount}`}
            ref={objectRef}
            data={pdfUrl}
            type="application/pdf"
            className="w-full h-full"
            onLoad={handleObjectLoad}
            onError={handleObjectError}
          >
            <div className="h-full flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">PDF cannot be displayed in this browser.</p>
              </div>
            </div>
          </object>
        );
      
      case 'embed':
        return (
          <embed
            key={`embed-${retryCount}`}
            ref={embedRef}
            src={pdfUrl}
            type="application/pdf"
            className="w-full h-full"
            onError={handleEmbedError}
          />
        );
      
      default:
        return null;
    }
  };

  if (hasError) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center h-full p-8 text-center',
          'bg-gray-700/50 border-2 border-dashed border-gray-600 rounded-lg',
          className,
        )}
      >
        <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Unable to load PDF</h3>
        <p className="text-sm text-gray-400 mb-4">
          {file && file.type !== 'application/pdf' 
            ? 'The uploaded file does not appear to be a valid PDF file. Please ensure you are uploading a PDF document.'
            : 'The PDF file could not be displayed. This might be due to browser restrictions, file corruption, or format issues.'
          }
        </p>
        <div className="flex gap-3 flex-wrap justify-center">
          <button
            onClick={retryViewer}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </button>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Open in new tab
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative h-full w-full', className)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800/80 backdrop-blur-sm z-10">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
            <p className="text-sm text-gray-300">Loading PDF...</p>
          </div>
        </div>
      )}

      <div className="h-full flex flex-col">
        {/* PDF Header */}
        <div className="flex items-center justify-between p-4 bg-gray-700 border-b border-gray-600">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {title || 'PDF Document'}
              </h3>
              {file && (
                <p className="text-sm text-gray-300">
                  {formatFileSize(file.size)} • {file.type}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFileInfo(false)}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  !showFileInfo
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                PDF View
              </button>
              <button
                onClick={() => setShowFileInfo(true)}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  showFileInfo
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                <Info className="h-4 w-4" />
                File Info
              </button>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowDebugInfo(!showDebugInfo)}
                className="inline-flex items-center gap-2 px-3 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors text-sm"
              >
                <Info className="h-4 w-4" />
                Debug
              </button>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
              >
                <ExternalLink className="h-4 w-4" />
                Open
              </a>
            </div>
          </div>
        </div>

        {/* PDF Content */}
        <div className="flex-1 bg-gray-800 p-4 overflow-auto">
          {showDebugInfo && (
            <div className="mb-4 p-4 bg-yellow-900/50 border border-yellow-700 rounded-lg">
              <h4 className="text-sm font-medium text-yellow-300 mb-2">Debug Information:</h4>
              <div className="text-xs text-yellow-200 space-y-1">
                <p><strong>File:</strong> {file?.name || 'No file'}</p>
                <p><strong>Type:</strong> {file?.type || 'No type'}</p>
                <p><strong>Size:</strong> {file ? formatFileSize(file.size) : 'No size'}</p>
                <p><strong>PDF URL:</strong> {pdfUrl || 'No URL'}</p>
                <p><strong>Current Method:</strong> {currentViewMethod}</p>
                <p><strong>Retry Count:</strong> {retryCount}</p>
                <p><strong>Has Error:</strong> {hasError ? 'Yes' : 'No'}</p>
                <p><strong>Is Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
                <button
                  onClick={() => {
                    console.log('PDF Debug Info:', {
                      file: file?.name,
                      type: file?.type,
                      size: file?.size,
                      pdfUrl,
                      currentViewMethod,
                      retryCount,
                      hasError,
                      isLoading
                    });
                  }}
                  className="mt-2 px-2 py-1 bg-yellow-700 text-yellow-100 rounded text-xs hover:bg-yellow-600"
                >
                  Log to Console
                </button>
              </div>
            </div>
          )}
          
          {showFileInfo ? (
            // File info mode
            <div className="h-full bg-gray-700 rounded-lg p-8 flex flex-col items-center justify-center text-center">
              <div className="mb-6">
                <div className="p-4 bg-blue-600 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <File className="h-10 w-10 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-2">
                  PDF Document Ready
                </h4>
                <p className="text-gray-300 mb-6">
                  Your PDF file has been uploaded successfully and is ready for processing.
                </p>
              </div>

              {file && (
                <div className="bg-gray-600 rounded-lg p-4 w-full max-w-md mb-6">
                  <h5 className="text-sm font-medium text-gray-200 mb-3">File Information</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Name:</span>
                      <span className="text-white font-medium">{file.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Size:</span>
                      <span className="text-white font-medium">{formatFileSize(file.size)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Type:</span>
                      <span className="text-white font-medium">{file.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Last Modified:</span>
                      <span className="text-white font-medium">
                        {new Date(file.lastModified).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={() => setShowFileInfo(false)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  View PDF
                </button>
                <p className="text-sm text-gray-400">
                   Use the "Process CV" button to extract and format the content
                </p>
              </div>
            </div>
          ) : (
            // PDF viewer mode (default)
            <div className="h-full bg-white rounded-lg shadow-lg overflow-hidden">
              {renderPDFViewer()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
