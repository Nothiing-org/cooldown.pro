
import { GoogleGenAI, Type } from "@google/genai";
import { AIThemeSuggestion } from "../types";

// Fixed: Always use direct process.env.API_KEY for initialization without fallbacks
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateThemeFromVibe = async (vibe: string): Promise<AIThemeSuggestion> => {
  // Fixed: Ensure ai.models.generateContent is called with correct parameters and model
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
            enum: ["'Bebas Neue', sans-serif", "'Oswald', sans-serif", "'Montserrat', sans-serif", "'Roboto Mono', monospace"] 
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

  // Fixed: response.text is a property getter, not a function
  const text = response.text;
  return JSON.parse(text || '{}') as AIThemeSuggestion;
};
