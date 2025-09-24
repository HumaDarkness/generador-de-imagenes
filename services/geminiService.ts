
import { GoogleGenAI, Modality } from "@google/genai";

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URI prefix: "data:image/png;base64,"
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

const handleApiError = (error: unknown, context: 'analysis' | 'editing'): Error => {
  console.error(`Gemini API call failed for image ${context}:`, error);
  let friendlyErrorMessage = 'Ocurrió un error desconocido.';

  if (error instanceof Error) {
    // The API often wraps its real error message inside a JSON string in the 'message' property.
    try {
      const parsedError = JSON.parse(error.message);
      if (parsedError.error && parsedError.error.message) {
        const apiError = parsedError.error;
        if (apiError.status === 'RESOURCE_EXHAUSTED' || apiError.code === 429) {
          friendlyErrorMessage = 'Límite de cuota de API excedido. Por favor, revisa tu plan de facturación o inténtalo más tarde.';
        } else {
          // Use the more specific message from the API if available.
          friendlyErrorMessage = apiError.message;
        }
      } else {
         // Not a JSON error message from the API, use the original message.
         friendlyErrorMessage = error.message;
      }
    } catch (e) {
      // If parsing fails, it's just a regular error message.
      friendlyErrorMessage = error.message;
    }
  }

  const prefix = context === 'editing' 
    ? 'No se pudo editar la imagen.' 
    : 'Error al analizar la imagen.';
    
  return new Error(`${prefix} ${friendlyErrorMessage}`);
};

export const analyzeImage = async (imageFile: File): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API key not found. Please set the API_KEY environment variable.");
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const base64ImageData = await fileToBase64(imageFile);

  const imagePart = {
    inlineData: {
      data: base64ImageData,
      mimeType: imageFile.type,
    },
  };

  const textPart = {
    text: "Genera un prompt detallado para un generador de imágenes a partir de lo que ves. Tu respuesta debe estar en español, ser muy descriptiva, capturar la atmósfera, los objetos, los colores y el estilo. Empieza directamente con la descripción; no incluyas ninguna frase introductoria. Importante: si en la imagen aparece una persona, no describas sus rasgos físicos. En su lugar, para referirte a la persona, utiliza únicamente la frase 'la imagen que te acabo de subir'.",
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
    });

    return response.text;
  } catch (error) {
    throw handleApiError(error, 'analysis');
  }
};

export const editImage = async (imageFile: File, prompt: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API key not found. Please set the API_KEY environment variable.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const base64ImageData = await fileToBase64(imageFile);

  const imagePart = {
    inlineData: {
      data: base64ImageData,
      mimeType: imageFile.type,
    },
  };

  const instruction = `Realiza la siguiente edición a la imagen que te he proporcionado. Es muy importante que mantengas el estilo y la composición general de la imagen original, modificando únicamente lo que te pido a continuación. No cambies al sujeto, el fondo o la iluminación a menos que la instrucción sea específicamente sobre eso. La edición es: "${prompt}"`;
  const textPart = { text: instruction };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [imagePart, textPart],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    if (!response.candidates || response.candidates.length === 0) {
      const blockReason = response.promptFeedback?.blockReason;
      if (blockReason) {
        throw new Error(`La solicitud fue bloqueada. Razón: ${blockReason}. Por favor, modifica el prompt.`);
      }
      throw new Error("La IA no generó una respuesta válida. Inténtalo de nuevo.");
    }

    let imageBase64: string | null = null;
    let textResponse: string | null = null;

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        imageBase64 = part.inlineData.data;
      } else if (part.text) {
        textResponse = part.text;
      }
    }

    if (imageBase64 !== null) {
      return imageBase64;
    }

    if (textResponse) {
      throw new Error(`La IA no generó una imagen y en su lugar respondió: "${textResponse}"`);
    }
    
    throw new Error("La IA no generó una imagen. Intenta con un prompt diferente.");

  } catch (error) {
    throw handleApiError(error, 'editing');
  }
};
