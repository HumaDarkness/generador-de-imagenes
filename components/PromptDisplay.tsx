import React, { useState } from 'react';

interface PromptDisplayProps {
  prompt: string;
}

const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);
  
const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

export const PromptDisplay: React.FC<PromptDisplayProps> = ({ prompt }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyClick = () => {
    navigator.clipboard.writeText(prompt).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    }).catch(err => {
      console.error('Error al copiar el texto: ', err);
    });
  };

  return (
    <div className="w-full h-80 bg-black/30 border neon-border rounded-lg p-6 backdrop-blur-sm animate-fade-in flex flex-col">
      <div className="flex justify-between items-center mb-4 shrink-0">
        <h2 className="font-orbitron text-xl text-cyan-300 neon-text">
          Prompt Generado
        </h2>
        <button
          onClick={handleCopyClick}
          className="flex items-center space-x-2 bg-cyan-500/10 hover:bg-cyan-500/30 text-cyan-300 font-semibold py-1 px-3 rounded-md transition-all duration-200 border border-cyan-500/30 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
          disabled={isCopied}
        >
          {isCopied ? (
            <>
              <CheckIcon className="w-4 h-4" />
              <span>¡Copiado!</span>
            </>
          ) : (
            <>
              <CopyIcon className="w-4 h-4" />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>
      <div className="overflow-y-auto pr-2">
        <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">
          {prompt}
        </p>
      </div>
    </div>
  );
};