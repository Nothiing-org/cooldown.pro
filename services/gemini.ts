
import { GoogleGenAI, Type } from "@google/genai";
import { AIThemeSuggestion } from "../types";

export const generateThemeFromVibe = async (vibe: string): Promise<AIThemeSuggestion> => {
  // Ensure we safely access the key only when the function is called
  const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : '';
  
  if (!apiKey) {
    console.error("API_KEY is not defined in the environment.");
    throw new Error("Missing API Key configuration.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a visual theme for a countdown video based on this vibe: "${vibe}". Return only JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          accentColor: { type: Type.STRING, description: "Hex color code" },
          font: { 
            type: Type.STRING, 
            enum: [
              "'Plus Jakarta Sans', sans-serif",
              "'Bebas Neue', sans-serif", 
              "'Oswald', sans-serif", 
              "'Montserrat', sans-serif", 
              "'Roboto Mono', monospace"
            ] 
          },
          backgroundStyle: { 
            type: Type.STRING, 
            enum: ["solid", "gradient", "particles"] 
          },
          motivationalText: { type: Type.STRING, description: "A short, 1-2 word caption for the countdown" },
          vibeDescription: { type: Type.STRING, description: "A brief description of why these choices fit the vibe" }
        },
        required: ["accentColor", "font", "backgroundStyle", "motivationalText"]
      }
    }
  });

  const text = response.text;
  return JSON.parse(text || '{}') as AIThemeSuggestion;
};
