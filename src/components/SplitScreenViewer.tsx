'use client';

import React from 'react';
import { Panel, PanelGroup } from 'react-resizable-panels';
import { cn } from '@/lib/utils';

interface SplitScreenViewerProps {
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
  leftTitle?: string;
  rightTitle?: string;
  className?: string;
}

export const SplitScreenViewer: React.FC<SplitScreenViewerProps> = ({
  leftContent,
  rightContent,
  leftTitle = 'Left Panel',
  rightTitle = 'Right Panel',
  className,
}) => {
  return (
    <div className={cn('h-screen w-full', className)}>
      <PanelGroup direction="horizontal" className="h-full">
        {/* Left Panel */}
        <Panel defaultSize={50} minSize={25}>
          <div className="h-full flex flex-col bg-gray-800 border-r border-gray-700">
            <div className="px-4 py-3 border-b border-gray-600 bg-gray-700">
              <h3 className="text-sm font-medium text-white">{leftTitle}</h3>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <div className="h-full min-h-[600px]">
                {leftContent}
              </div>
            </div>
          </div>
        </Panel>

        {/* Right Panel */}
        <Panel defaultSize={50} minSize={25}>
          <div className="h-full flex flex-col bg-gray-800">
            <div className="px-4 py-3 border-b border-gray-600 bg-gray-700">
              <h3 className="text-sm font-medium text-white">{rightTitle}</h3>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <div className="h-full min-h-[600px]">
                {rightContent}
              </div>
            </div>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
};
