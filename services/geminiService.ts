import { GoogleGenAI, Type } from "@google/genai";

let ai: GoogleGenAI | null = null;

const getAiClient = () => {
  if (!ai) {
    // Initialize lazily to avoid top-level side effects or crashes
    // Note: API Key is expected to be in process.env.API_KEY
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};

export const solveMathWithGemini = async (prompt: string): Promise<{ answer: string; explanation: string }> => {
  try {
    const client = getAiClient();
    const response = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: `Jsi chytrý matematický asistent pro českou kalkulačku.
        Tvým úkolem je vyřešit matematický problém zadaný uživatelem.
        
        Pravidla:
        1. Vrať odpověď ve formátu JSON.
        2. "answer" by mělo být pouze číslo nebo krátký výsledek (např. "42" nebo "x = 5").
        3. "explanation" by mělo být stručné vysvětlení v češtině (maximálně 1-2 věty). Pokud je výpočet triviální, vysvětlení může být prázdné.
        4. Pokud zadání není matematický problém, slušně odmítni v "explanation" a "answer" nech prázdné.
        `,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            answer: { type: Type.STRING },
            explanation: { type: Type.STRING },
          },
          required: ["answer", "explanation"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from AI");
    }

    return JSON.parse(text);

  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      answer: "Chyba",
      explanation: "Nepodařilo se spojit s AI asistentem (zkontrolujte konzoli).",
    };
  }
};