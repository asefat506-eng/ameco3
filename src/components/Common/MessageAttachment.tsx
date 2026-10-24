import React from 'react';
import { AudioLines, FileText, Image as ImageIcon, Video } from 'lucide-react';
import { EvidenceFile } from '../../types';

export const MessageAttachment: React.FC<{ attachment?: EvidenceFile }> = ({ attachment }) => {
  if (!attachment) return null;

  if (attachment.type === 'image') {
    return <img src={attachment.url} alt={attachment.name} className="max-h-48 max-w-full rounded-lg object-contain" />;
  }

  if (attachment.type === 'video') {
    return <video controls src={attachment.url} className="max-h-48 max-w-full rounded-lg" />;
  }

  if (attachment.type === 'audio') {
    return (
      <div className="flex items-center gap-2">
        <AudioLines className="h-4 w-4 shrink-0" />
        <audio controls src={attachment.url} className="h-9 max-w-full" />
      </div>
    );
  }

  const Icon = attachment.type === 'pdf' ? FileText : attachment.type === 'doc' ? FileText : ImageIcon;
  return (
    <a href={attachment.url} download={attachment.name} className="flex items-center gap-2 underline underline-offset-2">
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{attachment.name}</span>
      <span className="text-[10px] opacity-70">{attachment.size}</span>
    </a>
  );
};
