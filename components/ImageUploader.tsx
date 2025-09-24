
import React, { useRef } from 'react';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  imagePreviewUrl: string | null;
}

const UploadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-cyan-500 group-hover:text-cyan-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
);


export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, imagePreviewUrl }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div 
      className="w-full h-80 border-2 border-dashed border-cyan-700/50 rounded-lg p-4 flex flex-col justify-center items-center text-center cursor-pointer group hover:border-cyan-500/80 hover:bg-cyan-900/10 transition-all duration-300"
      onClick={handleClick}
    >
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
      {imagePreviewUrl ? (
        <img src={imagePreviewUrl} alt="Vista previa" className="max-w-full max-h-full object-contain rounded-md" />
      ) : (
        <div className="space-y-4">
            <UploadIcon />
          <p className="font-semibold text-cyan-400 group-hover:text-cyan-200">
            Haz clic para cargar una imagen
          </p>
          <p className="text-xs text-gray-400">o arrástrala aquí</p>
        </div>
      )}
    </div>
  );
};
