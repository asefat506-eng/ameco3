import React, { useEffect, useRef, useState } from 'react';
import { AudioLines, Mic, Paperclip, Send, Square, X } from 'lucide-react';
import { EvidenceFile } from '../../types';

interface ChatComposerProps {
  onSend: (text: string, attachment?: EvidenceFile) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  sendLabel?: string;
  children?: React.ReactNode;
}

const createAttachmentId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `ATT-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getAttachmentType = (file: File): EvidenceFile['type'] => {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/')) return 'audio';
  if (file.type === 'application/pdf') return 'pdf';
  return 'doc';
};

export const ChatComposer: React.FC<ChatComposerProps> = ({
  onSend,
  placeholder = 'Type a message...',
  disabled = false,
  className = '',
  sendLabel = 'Send',
  children,
}) => {
  const [text, setText] = useState('');
  const [attachment, setAttachment] = useState<EvidenceFile>();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingStreamRef = useRef<MediaStream | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);

  useEffect(() => () => {
    recordingStreamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  const handleFile = (file: File) => {
    if (file.size > 50 * 1024 * 1024) {
      setRecordingError('Files must be 50MB or smaller.');
      return;
    }
    setRecordingError('');
    const reader = new FileReader();
    reader.onload = () => {
      setAttachment({
        id: createAttachmentId(),
        name: file.name,
        type: getAttachmentType(file),
        size: formatFileSize(file.size),
        url: String(reader.result),
      });
    };
    reader.readAsDataURL(file);
  };

  const startRecording = async () => {
    setRecordingError('');
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setRecordingError('Voice recording is not supported in this browser.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recordingChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordingChunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(recordingChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const reader = new FileReader();
        reader.onload = () => {
          setAttachment({
            id: createAttachmentId(),
            name: `voice-message-${new Date().toISOString().replace(/[:.]/g, '-')}.webm`,
            type: 'audio',
            size: formatFileSize(blob.size),
            url: String(reader.result),
          });
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach((track) => track.stop());
        recordingStreamRef.current = null;
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      recordingStreamRef.current = stream;
      setIsRecording(true);
    } catch {
      setRecordingError('Microphone permission was denied or unavailable.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    setIsRecording(false);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const cleanText = text.trim();
    if ((!cleanText && !attachment) || disabled || isRecording) return;
    onSend(cleanText, attachment);
    setText('');
    setAttachment(undefined);
    setRecordingError('');
  };

  return (
    <form onSubmit={submit} className={`space-y-2 ${className}`}>
      {children}
      {attachment && (
        <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs dark:border-blue-900 dark:bg-blue-950/40">
          {attachment.type === 'audio' ? <AudioLines className="h-4 w-4 text-blue-600" /> : <Paperclip className="h-4 w-4 text-blue-600" />}
          <span className="min-w-0 flex-1 truncate">{attachment.name} ({attachment.size})</span>
          <button type="button" onClick={() => setAttachment(undefined)} className="text-slate-500 hover:text-red-600" title="Remove attachment">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {recordingError && <p className="text-[11px] text-red-600 dark:text-red-400">{recordingError}</p>}
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) handleFile(file);
            event.target.value = '';
          }}
        />
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={disabled || isRecording} className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" title="Attach a file">
          <Paperclip className="h-4 w-4" />
        </button>
        <button type="button" onClick={isRecording ? stopRecording : startRecording} disabled={disabled} className={`rounded-xl border p-2.5 disabled:opacity-50 ${isRecording ? 'border-red-500 bg-red-500 text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'}`} title={isRecording ? 'Stop recording' : 'Record a voice message'}>
          {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </button>
        <input type="text" value={text} onChange={(event) => setText(event.target.value)} placeholder={isRecording ? 'Recording voice message...' : placeholder} disabled={disabled || isRecording} className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-[#005BAC] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
        <button type="submit" disabled={disabled || isRecording || (!text.trim() && !attachment)} className="rounded-xl bg-[#005BAC] p-2.5 text-white shadow disabled:opacity-50" title={sendLabel}>
          <Send className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
};
