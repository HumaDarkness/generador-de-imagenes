import React, { useState, useCallback } from 'react';
import { analyzeImage } from './services/geminiService';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { Loader } from './components/Loader';
import { PromptDisplay } from './components/PromptDisplay';
import { Footer } from './components/Footer';
import { Editor } from './components/Editor';

type Tab = 'analyzer' | 'editor';

const App: React.FC = () => {
  // State for Analyzer
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  // State for active tab
  const [activeTab, setActiveTab] = useState<Tab>('analyzer');

  const handleImageSelect = (file: File) => {
    // Validate file
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

    if (file.size > MAX_SIZE) {
      setError('El archivo es demasiado grande. El máximo es 5MB.');
      setImageFile(null);
      setImagePreviewUrl(null);
      return;
    }
    if (!SUPPORTED_TYPES.includes(file.type)) {
      setError('Formato de archivo no soportado. Usa JPG, PNG o WebP.');
      setImageFile(null);
      setImagePreviewUrl(null);
      return;
    }

    setImageFile(file);
    setGeneratedPrompt('');
    setError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeClick = useCallback(async () => {
    if (!imageFile) {
      setError('Por favor, selecciona una imagen primero.');
      return;
    }

    setIsLoading(true);
    setError('');
    setGeneratedPrompt('');

    try {
      const prompt = await analyzeImage(imageFile);
      setGeneratedPrompt(prompt);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Ocurrió un error desconocido.';
      setError(`Error al analizar la imagen: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [imageFile]);
  
  const getTabClass = (tabName: Tab) => {
    const baseClass = "font-orbitron text-lg py-2 px-6 rounded-t-md transition-all duration-300 focus:outline-none";
    if (activeTab === tabName) {
      return `${baseClass} bg-cyan-500/20 border-b-2 border-cyan-300 text-cyan-300 neon-text`;
    }
    return `${baseClass} text-gray-400 hover:bg-gray-700/50 hover:text-cyan-400`;
  };

  return (
    <div className="min-h-screen text-gray-200 flex flex-col items-center p-4 sm:p-6 md:p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-30 z-0"></div>
      <div className="w-full max-w-6xl z-10">
        <Header />
        
        <nav className="mt-8 flex justify-center border-b border-cyan-900">
            <button onClick={() => setActiveTab('analyzer')} className={getTabClass('analyzer')}>
                Analizador
            </button>
            <button onClick={() => setActiveTab('editor')} className={getTabClass('editor')}>
                Editor
            </button>
        </nav>

        <main className="mt-8">
          {activeTab === 'analyzer' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div className="flex flex-col items-center space-y-6">
                <ImageUploader 
                  onImageSelect={handleImageSelect}
                  imagePreviewUrl={imagePreviewUrl}
                />
                <button
                  onClick={handleAnalyzeClick}
                  disabled={!imageFile || isLoading}
                  className="w-full max-w-xs font-orbitron text-lg bg-cyan-500/20 border-2 neon-border text-cyan-300 font-bold py-3 px-6 rounded-md transition-all duration-300 ease-in-out enabled:hover:bg-cyan-500/40 enabled:btn-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader small={true} />
                      <span className="ml-2">Analizando...</span>
                    </>
                  ) : (
                    'Analizar Imagen'
                  )}
                </button>
              </div>

              <div className="flex flex-col justify-center items-center">
                 <div className="w-full min-h-[30rem] flex flex-col justify-center items-center text-center">
                    {isLoading ? (
                      imagePreviewUrl ? (
                        <div className="w-full h-full relative flex justify-center items-center rounded-lg overflow-hidden border-2 neon-border bg-black/30">
                          <img src={imagePreviewUrl} alt="Analizando" className="max-w-full max-h-full object-contain rounded-md opacity-40" />
                          <div className="absolute top-0 left-0 w-full h-1.5 bg-cyan-300 shadow-[0_0_20px_5px_rgba(0,255,255,0.7)] animate-[scan_3s_ease-in-out_infinite]"></div>
                          <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-4">
                            <p className="font-orbitron text-lg text-cyan-300 neon-text animate-pulse">ANALIZANDO MATRIZ DE PÍXELES...</p>
                            <p className="text-gray-400 text-sm mt-2">Extrayendo vectores de datos semánticos.</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Loader />
                          <p className="mt-4 font-orbitron text-cyan-400 neon-text">Iniciando...</p>
                        </>
                      )
                    ) : error ? (
                      <div className="w-full h-full flex justify-center items-center text-red-400 bg-red-900/50 p-4 rounded-lg border border-red-500">
                        <p>{error}</p>
                      </div>
                    ) : generatedPrompt ? (
                      <PromptDisplay prompt={generatedPrompt} />
                    ) : (
                      <div className="w-full h-full flex flex-col justify-center items-center text-center border-2 border-dashed border-cyan-700/50 rounded-lg p-4">
                          <svg className="w-16 h-16 text-cyan-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          <h3 className="font-orbitron text-xl text-cyan-500/80 mt-4">Salida de Datos</h3>
                          <p className="text-gray-500">El prompt generado por la IA aparecerá aquí.</p>
                      </div>
                    )}
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'editor' && <Editor />}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default App;
