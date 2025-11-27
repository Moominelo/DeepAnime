import { GoogleGenAI } from "@google/genai";
import { AnimeRecommendation } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are an expert Anime Recommendation Engine. 
Your goal is to provide reliable, hallucination-free anime recommendations based on the user's request.

RULES:
1. You must output a valid JSON Array.
2. Do NOT output any conversational text, markdown formatting (like \`\`\`json), or explanations outside the JSON array. Start with '[' and end with ']'.
3. Use the 'googleSearch' tool to verify specific details (Year, Studio, Official Title) if you are not 100% sure.
4. If the user asks for "dark", "funny", etc., respect that mood accurately.
5. Provide 3 to 5 recommendations.

JSON STRUCTURE:
[
  {
    "title": "Official English or Main Title",
    "romajiTitle": "Hepburn Romaji Title",
    "year": "YYYY",
    "studio": "Studio Name",
    "genres": ["Genre1", "Genre2"],
    "format": "TV | Movie | OVA",
    "synopsis": "A concise, factual synopsis verified by database data.",
    "reason": "Why this specifically fits the user's request.",
    "imageUrl": "https://cdn.myanimelist.net/images/anime/...", // Use a real URL found via search if possible, or leave empty string if unsure. Do not invent URLs.
    "sourceUrl": "https://myanimelist.net/anime/..." // Link to MAL or AniList page.
  }
]
`;

export const getAnimeRecommendations = async (userPrompt: string): Promise<AnimeRecommendation[]> => {
  try {
    const model = 'gemini-2.5-flash';
    
    const response = await ai.models.generateContent({
      model: model,
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }]
        }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
        // NOTE: responseMimeType: 'application/json' is NOT supported when tools are used.
        // We must parse the text manually.
      }
    });

    const text = response.text;

    if (!text) {
      throw new Error("No response from Gemini.");
    }

    // Manual JSON Extraction
    // The model might say "Here is your JSON: [...]" or wrap it in ```json ... ```
    // We strictly look for the first '[' and the last ']'
    const firstBracket = text.indexOf('[');
    const lastBracket = text.lastIndexOf(']');

    if (firstBracket === -1 || lastBracket === -1) {
      console.error("Raw response:", text);
      throw new Error("Invalid response format: No JSON array found.");
    }

    const jsonString = text.substring(firstBracket, lastBracket + 1);

    try {
      const data: AnimeRecommendation[] = JSON.parse(jsonString);
      return data;
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.error("Extracted String:", jsonString);
      throw new Error("Failed to parse the recommendation data.");
    }

  } catch (error) {
    console.error("Gemini Service Error:", error);
    throw error;
  }
};
