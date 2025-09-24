import React, { useState, useCallback } from 'react';
import { analyzeImage, improvePrompt, editImage } from './services/geminiService';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { Loader } from './components/Loader';
import { PromptDisplay } from './components/PromptDisplay';
import { Footer } from './components/Footer';
import { Editor } from './components/Editor';
import { MagicEdits } from './components/MagicEdits';

type Tab = 'analyzer' | 'editor';

const App: React.FC = () => {
  // State for Analyzer
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isImproving, setIsImproving] = useState<boolean>(false);
  
  // State for Magic Edits
  const [isMagicEditing, setIsMagicEditing] = useState<boolean>(false);
  const [activeMagicEdit, setActiveMagicEdit] = useState<string | null>(null);
  const [magicEditedImageUrl, setMagicEditedImageUrl] = useState<string | null>(null);

  // State for active tab
  const [activeTab, setActiveTab] = useState<Tab>('analyzer');

  // FIX: Memoize resetAnalyzerState with useCallback to ensure a stable function reference.
  const resetAnalyzerState = useCallback(() => {
    setGeneratedPrompt('');
    setError('');
    setIsImproving(false);
    setIsMagicEditing(false);
    setActiveMagicEdit(null);
    setMagicEditedImageUrl(null);
  }, []);

  // FIX: Memoize handleImageSelect with useCallback as it depends on resetAnalyzerState.
  const handleImageSelect = useCallback((file: File) => {
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
    resetAnalyzerState();
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, [resetAnalyzerState]);

  // FIX: Add resetAnalyzerState to the dependency array of useCallback.
  const handleAnalyzeClick = useCallback(async () => {
    if (!imageFile) {
      setError('Por favor, selecciona una imagen primero.');
      return;
    }

    setIsLoading(true);
    resetAnalyzerState();

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
  }, [imageFile, resetAnalyzerState]);

  const handleImprovePrompt = useCallback(async () => {
    if (!generatedPrompt) return;

    setIsImproving(true);
    setError('');

    try {
      const improved = await improvePrompt(generatedPrompt);
      setGeneratedPrompt(improved);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Ocurrió un error desconocido.';
      setError(`Error al mejorar el prompt: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsImproving(false);
    }
  }, [generatedPrompt]);

  const handleMagicEdit = useCallback(async (prompt: string, editName: string) => {
    if (!imageFile) {
      setError('Por favor, sube una imagen primero.');
      return;
    }

    setIsMagicEditing(true);
    setActiveMagicEdit(editName);
    setError('');
    setMagicEditedImageUrl(null);

    try {
      const base64Image = await editImage(imageFile, prompt);
      setMagicEditedImageUrl(`data:image/png;base64,${base64Image}`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Ocurrió un error desconocido.';
      setError(`Error al aplicar edición mágica: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsMagicEditing(false);
      setActiveMagicEdit(null);
    }
  }, [imageFile]);
  
  // FIX: Memoize handleClearMagicEdit with useCallback for consistency and performance.
  const handleClearMagicEdit = useCallback(() => {
    setMagicEditedImageUrl(null);
    setError('');
  }, []);
  
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
                  disabled={!imageFile || isLoading || isMagicEditing}
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
                {imagePreviewUrl && (
                  <MagicEdits 
                    onMagicEdit={handleMagicEdit}
                    isEditing={isLoading || isMagicEditing}
                    activeEdit={activeMagicEdit}
                  />
                )}
              </div>

              <div className="flex flex-col justify-center items-center">
                 <div className="w-full min-h-[30rem] flex flex-col justify-center items-center text-center">
                    {isMagicEditing ? (
                        <>
                          <Loader />
                          <p className="mt-4 font-orbitron text-cyan-400 neon-text animate-pulse">APLICANDO MAGIA...</p>
                          <p className="text-gray-400 text-sm mt-1">El modelo 'Banana' está trabajando.</p>
                        </>
                    ) : magicEditedImageUrl ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-black/30 border neon-border rounded-lg p-6 backdrop-blur-sm animate-fade-in">
                            <h3 className="font-orbitron text-xl text-cyan-300 neon-text shrink-0 mb-4">
                                Edición Mágica Aplicada
                            </h3>
                            <div className="flex-grow w-full min-h-0 flex items-center justify-center overflow-hidden">
                                <img 
                                    src={magicEditedImageUrl} 
                                    alt="Imagen editada mágicamente" 
                                    className="max-w-full max-h-full object-contain rounded-md" 
                                />
                            </div>
                            <div className="flex items-center space-x-4 mt-4 shrink-0">
                                <a
                                  href={magicEditedImageUrl}
                                  download="imagen-editada-magica.png"
                                  className="flex items-center space-x-2 bg-cyan-500/10 hover:bg-cyan-500/30 text-cyan-300 font-semibold py-2 px-4 rounded-md transition-all duration-200 border border-cyan-500/30"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                    <span>Descargar</span>
                                </a>
                                <button
                                  onClick={handleClearMagicEdit}
                                  className="flex items-center space-x-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 font-semibold py-2 px-4 rounded-md transition-all duration-200 border border-gray-600/50"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" /></svg>
                                    <span>Volver</span>
                                </button>
                            </div>
                        </div>
                    ) : isLoading ? (
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
                      <PromptDisplay 
                        prompt={generatedPrompt}
                        onImprovePrompt={handleImprovePrompt}
                        isImproving={isImproving}
                      />
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