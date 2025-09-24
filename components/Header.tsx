
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="text-center py-4 border-b-2 neon-border rounded-lg bg-black/20 backdrop-blur-sm">
      <h1 className="font-orbitron text-3xl sm:text-4xl md:text-5xl font-bold text-cyan-300 neon-text">
        Analizador de Imágenes IA
      </h1>
      <p className="mt-2 text-gray-300 text-sm sm:text-base">
        Transcodificando Píxeles a Palabras
      </p>
    </header>
  );
};
