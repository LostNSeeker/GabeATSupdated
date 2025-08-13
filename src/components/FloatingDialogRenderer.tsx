'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@radix-ui/react-dialog';

interface FloatingDialogRendererProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
}

export const FloatingDialogRenderer: React.FC<FloatingDialogRendererProps> = ({
  trigger,
  content,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/70" onClick={() => setOpen(false)} />
        <div className="relative bg-gray-800 rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto border border-gray-700">
          {content}
        </div>
      </DialogContent>
    </Dialog>
  );
};
