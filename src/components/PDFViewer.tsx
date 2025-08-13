'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FileText, AlertCircle, Loader2, Download, Eye, File, Info, ExternalLink } from 'lucide-react';
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
  const [iframeFailed, setIframeFailed] = useState(false);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const objectRef = useRef<HTMLObjectElement>(null);

  useEffect(() => {
    // If we have a file, create a blob URL
    if (file) {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      setIsLoading(false);
      
      // Cleanup function
      return () => {
        URL.revokeObjectURL(url);
      };
    } else if (src) {
      // If we have a src URL, use it directly
      setPdfUrl(src);
      setIsLoading(false);
    }
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
    setIsLoading(false);
    setIframeFailed(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setIframeFailed(true);
  };

  const handleObjectLoad = () => {
    setIsLoading(false);
    setIframeFailed(false);
  };

  const handleObjectError = () => {
    setIsLoading(false);
    setIframeFailed(true);
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
          The PDF file could not be displayed. This might be due to browser restrictions or file
          format issues.
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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
            <FileText className="h-4 w-4" />
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
              {pdfUrl ? (
                <div className="h-full">
                  {/* Try iframe first */}
                  {!iframeFailed && (
                    <iframe
                      ref={iframeRef}
                      src={pdfUrl}
                      title={title || 'PDF Document'}
                      className="w-full h-full border-0"
                      onLoad={handleIframeLoad}
                      onError={handleIframeError}
                      sandbox="allow-scripts allow-same-origin"
                    />
                  )}
                  
                  {/* Fallback to object tag if iframe fails */}
                  {iframeFailed && (
                    <object
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
                          <div className="flex gap-3 justify-center">
                            <button
                              onClick={handleDownload}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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
                              Open in New Tab
                            </a>
                          </div>
                        </div>
                      </div>
                    </object>
                  )}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Loading PDF...</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
