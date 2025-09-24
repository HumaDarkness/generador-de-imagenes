import React, { useState } from 'react';

interface PromptDisplayProps {
  prompt: string;
  onImprovePrompt: () => void;
  isImproving: boolean;
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

export const PromptDisplay: React.FC<PromptDisplayProps> = ({ prompt, onImprovePrompt, isImproving }) => {
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
        <div className="flex items-center space-x-2">
            <button
              onClick={onImprovePrompt}
              className="flex items-center space-x-2 bg-cyan-500/10 hover:bg-cyan-500/30 text-cyan-300 font-semibold py-1 px-3 rounded-md transition-all duration-200 border border-cyan-500/30 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={isImproving || isCopied}
              aria-label="Mejorar prompt con IA"
            >
                {isImproving ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-cyan-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Mejorando...</span>
                    </>
                ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                           <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <span>Mejorar</span>
                    </>
                )}
            </button>
            <button
              onClick={handleCopyClick}
              className="flex items-center space-x-2 bg-cyan-500/10 hover:bg-cyan-500/30 text-cyan-300 font-semibold py-1 px-3 rounded-md transition-all duration-200 border border-cyan-500/30 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={isCopied || isImproving}
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
      </div>
      <div className="overflow-y-auto pr-2">
        <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">
          {prompt}
        </p>
      </div>
    </div>
  );
};