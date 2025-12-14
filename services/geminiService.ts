
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { identifyChemical, searchChemicals } from '../data/chemicalDatabase';
import { Chemical } from '../types';

class GeminiService {
  private ai: GoogleGenAI | null = null;
  private modelId: string = 'gemini-2.5-flash';

  constructor() {
    // Initialize lazily to avoid immediate env check failures if not present on load
    if (process.env.API_KEY) {
      this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
  }

  public isConfigured(): boolean {
    return !!this.ai;
  }

  public async analyzeExperiment(prompt: string, imageBase64?: string): Promise<string> {
    if (!navigator.onLine) {
        return "Offline Mode: AI analysis unavailable. Please check safety database manually.";
    }

    if (!this.ai) {
      return "AI Service not configured (Missing API Key).";
    }

    try {
      let contents: any;
      
      if (imageBase64) {
        const cleanBase64 = imageBase64.split(',')[1] || imageBase64;
        contents = {
          parts: [
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: cleanBase64
              }
            },
            {
              text: `You are a Lab Partner AI. Analyze this experiment setup or observation. ${prompt}`
            }
          ]
        };
      } else {
        contents = `You are a Lab Partner AI. Answer this scientific question: ${prompt}`;
      }

      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: this.modelId,
        contents: contents,
        config: {
            systemInstruction: "You are a helpful, safety-conscious laboratory assistant. Prioritize safety warnings first.",
        }
      });

      return response.text || "No response generated.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "I encountered an error analyzing that data. Please check connection and safety parameters.";
    }
  }

  public async identifyChemicalFromImage(imageBase64: string): Promise<Chemical | null> {
      if (!this.ai || !navigator.onLine) return null;

      try {
          const cleanBase64 = imageBase64.split(',')[1] || imageBase64;
          
          const response = await this.ai.models.generateContent({
              model: this.modelId,
              contents: {
                  parts: [
                      { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
                      { text: "Identify the primary chemical or household substance in this image. Return the common name." }
                  ]
              },
              config: {
                  responseMimeType: "application/json",
                  responseSchema: {
                      type: Type.OBJECT,
                      properties: {
                          name: { type: Type.STRING },
                          confidence: { type: Type.NUMBER }
                      }
                  }
              }
          });

          if (response.text) {
              const data = JSON.parse(response.text);
              if (data.name) {
                  // Fuzzy match against our local DB
                  const match = identifyChemical(data.name);
                  if (match) return match;
                  
                  // Fallback search
                  const partial = searchChemicals(data.name);
                  if (partial.length > 0) return partial[0];
              }
          }
          return null;
      } catch (e) {
          console.error("Identify failed", e);
          return null;
      }
  }

  public async balanceEquation(equation: string): Promise<string> {
    if (!navigator.onLine) {
        return "Offline: Cannot balance complex equations.";
    }
    if (!this.ai) return "AI not configured.";

    try {
        const response: GenerateContentResponse = await this.ai.models.generateContent({
            model: this.modelId,
            contents: `Balance this chemical equation: ${equation}. Return ONLY the balanced equation, nothing else.`,
        });
        return response.text || "Could not balance.";
    } catch (e) {
        return "Error balancing equation.";
    }
  }
}

export const geminiService = new GeminiService();
