
import { GoogleGenAI, Type } from "@google/genai";
import { AIThemeSuggestion } from "../types";

export const generateThemeFromVibe = async (vibe: string): Promise<AIThemeSuggestion> => {
  // Use a safer check for process to prevent crashing on Netlify/Browser environments
  let apiKey = '';
  try {
    apiKey = (window as any).process?.env?.API_KEY || (import.meta as any).env?.VITE_API_KEY || '';
    // If the environment variable is injected by the platform directly into process.env
    if (!apiKey && typeof process !== 'undefined') {
      apiKey = process.env.API_KEY || '';
    }
  } catch (e) {
    console.warn("Could not access environment variables via standard methods.");
  }
  
  if (!apiKey) {
    console.error("API_KEY is not defined. Ensure it is set in your Netlify Environment Variables.");
    throw new Error("Missing API Key. Check the browser console for details.");
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
