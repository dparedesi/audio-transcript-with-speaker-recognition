
import React, { useState, useRef, useCallback } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  disabled: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, disabled }) => {
  const [fileName, setFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File | undefined | null) => {
    if (file && (file.type === 'audio/mp4' || file.name.endsWith('.m4a'))) {
      setFileName(file.name);
      onFileSelect(file);
    } else {
      setFileName('');
      onFileSelect(null);
      if (file) {
        alert('Invalid file type. Please upload an .m4a file.');
      }
    }
  }, [onFileSelect]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    processFile(event.target.files?.[0]);
  };

  const handleClick = () => {
    if (!disabled) {
        fileInputRef.current?.click();
    }
  };
  
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const baseClasses = "w-full px-4 py-6 text-center text-slate-300 border-2 border-dashed rounded-lg transition-colors duration-300";
  const stateClasses = disabled 
    ? "bg-slate-800 border-slate-700 cursor-not-allowed"
    : isDragging 
    ? "bg-indigo-900/50 border-indigo-500"
    : "bg-slate-700/50 border-slate-600 hover:bg-slate-700 cursor-pointer";

  return (
    <div 
        className={`${baseClasses} ${stateClasses}`}
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="File upload area"
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".m4a,audio/mp4"
        className="hidden"
        disabled={disabled}
      />
      <div className="flex flex-col items-center justify-center pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 mb-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="font-semibold text-slate-300">
              {isDragging 
                ? 'Drop your file here' 
                : fileName 
                ? 'File selected' 
                : 'Drag & drop or click to upload an .m4a file'}
          </p>
          {fileName && !isDragging && <p className="text-sm text-slate-400 mt-1">{fileName}</p>}
      </div>
    </div>
  );
};

export default FileUpload;
