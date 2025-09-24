import React, { useState, useCallback } from 'react';
import { ImageUploader } from './ImageUploader';
import { Loader } from './Loader';
import { editImage } from '../services/geminiService';

export const Editor: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleImageSelect = (file: File) => {
    // Validate file
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

    if (file.size > MAX_SIZE) {
      setError('El archivo es demasiado grande. El máximo es 5MB.');
      return;
    }
    if (!SUPPORTED_TYPES.includes(file.type)) {
      setError('Formato de archivo no soportado. Usa JPG, PNG o WebP.');
      return;
    }


    setImageFile(file);
    setEditedImageUrl(null);
    setError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleEditClick = useCallback(async () => {
    if (!imageFile || !prompt) {
      setError('Por favor, sube una imagen y escribe un prompt.');
      return;
    }

    setIsLoading(true);
    setError('');
    setEditedImageUrl(null);

    try {
      const base64Image = await editImage(imageFile, prompt);
      setEditedImageUrl(`data:image/png;base64,${base64Image}`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Ocurrió un error desconocido.';
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [imageFile, prompt]);

  const handlePasteClick = async () => {
    if (navigator.clipboard?.readText) {
        try {
            const text = await navigator.clipboard.readText();
            setPrompt(text);
        } catch (err) {
            console.error('Error al pegar desde el portapapeles: ', err);
            setError(`Error al pegar desde el portapapeles: \n${err instanceof Error ? err.message : String(err)}`);
        }
    } else {
        setError("El acceso al portapapeles no está disponible o permitido en este navegador.");
    }
  };
  
  const addPoseSuggestion = (newSuggestion: string) => {
    const allSuggestions = [
      'Haz que el sujeto esté sentado/a',
      'Haz que el sujeto cruce los brazos',
      'Haz que el sujeto esté caminando',
      'Haz que el sujeto esté mirando hacia atrás'
    ];

    setPrompt(prevPrompt => {
      let updatedPrompt = prevPrompt.trim();
      let poseFoundAndReplaced = false;

      // Find and replace existing suggestion
      for (const existingSuggestion of allSuggestions) {
        if (updatedPrompt.includes(existingSuggestion)) {
          updatedPrompt = updatedPrompt.replace(existingSuggestion, newSuggestion);
          poseFoundAndReplaced = true;
          break;
        }
      }

      // If no pose was found, append the new one
      if (!poseFoundAndReplaced) {
        updatedPrompt = updatedPrompt ? `${updatedPrompt} ${newSuggestion}` : newSuggestion;
      }

      return updatedPrompt;
    });
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      {/* Left Column: Inputs */}
      <div className="flex flex-col items-center space-y-6">
        <ImageUploader 
          onImageSelect={handleImageSelect}
          imagePreviewUrl={imagePreviewUrl}
        />
        <div className="relative w-full">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe los cambios que quieres hacer... (ej. 'añade un sombrero de vaquero')"
              className="w-full h-28 bg-gray-900/50 border neon-border rounded-lg p-3 pr-24 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
              disabled={isLoading}
            />
            <button
                onClick={handlePasteClick}
                className="absolute top-3 right-3 flex items-center space-x-2 bg-cyan-500/10 hover:bg-cyan-500/30 text-cyan-300 font-semibold py-1.5 px-3 rounded-md transition-all duration-200 border border-cyan-500/30 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
                aria-label="Pegar prompt desde el portapapeles"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2v0" />
                </svg>
                <span>Pegar</span>
            </button>
        </div>

        <div className="w-full">
          <h4 className="font-orbitron text-md text-cyan-400 mb-3 text-center">Sugerencias de Pose</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => addPoseSuggestion('Haz que el sujeto esté sentado/a')}
              disabled={isLoading}
              className="font-orbitron text-sm bg-gray-800/50 border border-cyan-700/50 text-cyan-400 py-2 px-2 rounded-md transition-all duration-200 enabled:hover:bg-cyan-900/50 enabled:hover:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sentado/a
            </button>
            <button
              onClick={() => addPoseSuggestion('Haz que el sujeto cruce los brazos')}
              disabled={isLoading}
              className="font-orbitron text-sm bg-gray-800/50 border border-cyan-700/50 text-cyan-400 py-2 px-2 rounded-md transition-all duration-200 enabled:hover:bg-cyan-900/50 enabled:hover:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Brazos Cruzados
            </button>
            <button
              onClick={() => addPoseSuggestion('Haz que el sujeto esté caminando')}
              disabled={isLoading}
              className="font-orbitron text-sm bg-gray-800/50 border border-cyan-700/50 text-cyan-400 py-2 px-2 rounded-md transition-all duration-200 enabled:hover:bg-cyan-900/50 enabled:hover:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Caminando
            </button>
            <button
              onClick={() => addPoseSuggestion('Haz que el sujeto esté mirando hacia atrás')}
              disabled={isLoading}
              className="font-orbitron text-sm bg-gray-800/50 border border-cyan-700/50 text-cyan-400 py-2 px-2 rounded-md transition-all duration-200 enabled:hover:bg-cyan-900/50 enabled:hover:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Mirando atrás
            </button>
          </div>
        </div>

        <button
          onClick={handleEditClick}
          disabled={!imageFile || !prompt || isLoading}
          className="w-full max-w-xs font-orbitron text-lg bg-cyan-500/20 border-2 neon-border text-cyan-300 font-bold py-3 px-6 rounded-md transition-all duration-300 ease-in-out enabled:hover:bg-cyan-500/40 enabled:btn-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <Loader small={true} />
              <span className="ml-2">Generando...</span>
            </>
          ) : (
            'Generar Edición'
          )}
        </button>
      </div>

      {/* Right Column: Output */}
      <div className="flex flex-col justify-center items-center h-full">
        <div className="w-full min-h-[30rem] flex flex-col justify-center items-center text-center border-2 border-dashed border-cyan-700/50 rounded-lg p-4 relative overflow-hidden">
          {isLoading ? (
            <>
              <Loader />
              <p className="mt-4 font-orbitron text-cyan-400 neon-text animate-pulse">PROCESANDO EDICIÓN...</p>
              <p className="text-gray-400 text-sm mt-1">La IA está reimaginando tu imagen.</p>
            </>
          ) : error ? (
            <div className="text-red-400 bg-red-900/50 p-4 rounded-lg border border-red-500 w-full">
              <p className="font-bold">Error de Edición:</p>
              <p className="mt-2 text-sm break-words">{error}</p>
            </div>
          ) : editedImageUrl ? (
            <div className="w-full h-full flex flex-col items-center justify-center">
                <h3 className="font-orbitron text-xl text-cyan-300 neon-text shrink-0 mb-4">
                    Imagen Editada
                </h3>
                <div className="flex-grow w-full min-h-0 flex items-center justify-center overflow-hidden">
                    <img 
                        src={editedImageUrl} 
                        alt="Imagen editada" 
                        className="max-w-full max-h-full object-contain rounded-md" 
                    />
                </div>
                <a
                  href={editedImageUrl}
                  download="imagen-editada.png"
                  className="mt-4 w-full max-w-xs font-orbitron text-lg bg-cyan-500/20 border-2 neon-border text-cyan-300 font-bold py-3 px-6 rounded-md transition-all duration-300 ease-in-out hover:bg-cyan-500/40 btn-glow flex items-center justify-center shrink-0"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Descargar Imagen</span>
                </a>
            </div>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-cyan-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="font-orbitron text-xl text-cyan-500/80 mt-4">Lienzo Digital</h3>
              <p className="text-gray-500">Tu imagen editada aparecerá aquí.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
