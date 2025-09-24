import React from 'react';
import { Loader } from './Loader';
import { editImage } from '../services/geminiService';

interface MagicEditsProps {
  onMagicEdit: (prompt: string, editName: string, imageFile: File) => Promise<void>;
  isEditing: boolean;
  activeEdit: string | null;
  imageFile: File | null;
}

interface MagicPrompt {
  name: string;
  prompt: string;
}

const magicPrompts: MagicPrompt[] = [
  {
    name: 'Cinemático',
    prompt: 'Convierte la imagen a un estilo cinematográfico, con colores dramáticos y una iluminación de película. Mejora los contrastes y añade un ligero grano de película.'
  },
  {
    name: 'Acuarela',
    prompt: 'Transforma la imagen en una pintura de acuarela, con bordes suaves, colores translúcidos y textura de papel.'
  },
  {
    name: 'Neón',
    prompt: 'Añade toques de luz de neón a los bordes de los objetos principales en la imagen. Usa colores vibrantes como cian, magenta y verde eléctrico.'
  },
  {
    name: 'Ensueño',
    prompt: 'Aplica un filtro de ensueño a la imagen, con un enfoque suave (soft focus), un brillo etéreo y colores pastel desaturados.'
  },
];

export const MagicEdits: React.FC<MagicEditsProps> = ({ 
  onMagicEdit, 
  isEditing, 
  activeEdit, 
  imageFile 
}) => {
  
  const handleMagicEdit = async (prompt: string, editName: string) => {
    if (!imageFile) {
      alert('Por favor, carga una imagen primero');
      return;
    }

    try {
      await onMagicEdit(prompt, editName, imageFile);
    } catch (error) {
      console.error('Error en edición mágica:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  return (
    <div className="w-full bg-gray-900/30 border border-cyan-700/30 rounded-lg p-4 animate-fade-in">
      <h3 className="font-orbitron text-lg text-cyan-400 mb-4 text-center">
        Ediciones Mágicas (con Gemini 2.5 Flash)
      </h3>
      
      {!imageFile && (
        <div className="text-center text-gray-400 text-sm mb-4">
          Carga una imagen para usar las ediciones mágicas
        </div>
      )}
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {magicPrompts.map(({ name, prompt }) => (
          <button
            key={name}
            onClick={() => handleMagicEdit(prompt, name)}
            disabled={isEditing || !imageFile}
            className="font-orbitron text-sm bg-gray-800/50 border border-cyan-700/50 text-cyan-400 py-2 px-2 rounded-md transition-all duration-200 enabled:hover:bg-cyan-900/50 enabled:hover:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center h-12"
          >
            {isEditing && activeEdit === name ? (
              <div className="flex items-center">
                <Loader small={true} />
              </div>
            ) : (
              name
            )}
          </button>
        ))}
      </div>
      
      <div className="text-xs text-gray-500 mt-3 text-center">
        Las ediciones mágicas usan Gemini 2.5 Flash Image Preview para procesar y transformar tus imágenes
      </div>
    </div>
  );
};

// Exportar también los tipos e interfaces
export type { MagicEditsProps, MagicPrompt };
