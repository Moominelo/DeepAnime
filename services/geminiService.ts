
import { GoogleGenAI } from "@google/genai";
import { AnimeRecommendation, SearchMode } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are an expert Anime Recommendation Engine called "DeepAnime". 
Your goal is to provide reliable, hallucination-free anime recommendations based on the user's request.

RULES:
1. You must output a valid JSON Array.
2. Do NOT output any conversational text, markdown formatting (like \`\`\`json), or explanations outside the JSON array. Start with '[' and end with ']'.
3. Use the 'googleSearch' tool to verify the titles and release years.
4. **IMAGES**: Leave the "imageUrl" and "score" fields as empty strings ("") or null. We will fetch these from the official API in a post-processing step. Your job is to get the TITLE exactly right so the API can find it.
5. Provide 3 to 5 recommendations.

JSON STRUCTURE:
[
  {
    "title": "Official Main Title (Romaji or English)",
    "romajiTitle": "Hepburn Romaji Title",
    "year": "YYYY",
    "studio": "Studio Name",
    "genres": ["Genre1", "Genre2"],
    "format": "TV | Movie | OVA",
    "synopsis": "A concise, factual synopsis verified by database data.",
    "reason": "Why this specifically fits the user's request.",
    "imageUrl": "", 
    "sourceUrl": "", 
    "score": "" 
  }
]
`;

/**
 * Fetches official metadata (Image, Score, URL) from Jikan API (MyAnimeList)
 * to ensure 100% pertinent images and valid links.
 */
const fetchMetadataFromJikan = async (title: string, year: string): Promise<Partial<AnimeRecommendation>> => {
  try {
    // Search Jikan for the anime
    const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(title)}&limit=1`);
    const data = await response.json();

    if (data.data && data.data.length > 0) {
      const anime = data.data[0];
      return {
        imageUrl: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || "",
        sourceUrl: anime.url,
        score: anime.score ? `${anime.score}/10` : "N/A",
        // We can optionally correct the title or year here if we wanted to be super strict
      };
    }
    return {};
  } catch (error) {
    console.warn(`Jikan API failed for ${title}:`, error);
    return {};
  }
};

/**
 * Delays execution for a specified number of milliseconds.
 * Used to prevent rate limiting when calling Jikan API.
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getAnimeRecommendations = async (userPrompt: string, mode: SearchMode = 'strict'): Promise<AnimeRecommendation[]> => {
  try {
    const model = 'gemini-2.5-flash';
    
    // Adjust temperature based on creativity mode
    const temperature = mode === 'creative' ? 0.85 : 0.1;

    let modifiedPrompt = userPrompt;
    if (mode === 'creative') {
      modifiedPrompt += "\n\n(MODE: CREATIVE. Focus on hidden gems, underrated titles, or unique artistic choices matching the vibe. Avoid the top 10 most popular anime unless they fit perfectly.)";
    } else {
      modifiedPrompt += "\n\n(MODE: STRICT. Stick to highly rated, widely recognized, and factually accurate matches.)";
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: [
        {
          role: 'user',
          parts: [{ text: modifiedPrompt }]
        }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
        temperature: temperature, 
      }
    });

    const text = response.text;

    if (!text) {
      throw new Error("No response from Gemini.");
    }

    // Manual JSON Extraction
    const firstBracket = text.indexOf('[');
    const lastBracket = text.lastIndexOf(']');

    if (firstBracket === -1 || lastBracket === -1) {
      console.error("Raw response:", text);
      throw new Error("Invalid response format: No JSON array found.");
    }

    const jsonString = text.substring(firstBracket, lastBracket + 1);
    let recommendations: AnimeRecommendation[];

    try {
      recommendations = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      throw new Error("Failed to parse the recommendation data.");
    }

    // ENRICHMENT STEP: Fetch real images and scores from Jikan API
    // We process them sequentially or with small delays to be nice to the API rate limits
    const enrichedRecommendations = await Promise.all(
      recommendations.map(async (rec, index) => {
        // Add a small staggered delay to avoid hitting Jikan rate limits instantly
        await delay(index * 250); 
        
        const metadata = await fetchMetadataFromJikan(rec.title, rec.year);
        
        return {
          ...rec,
          imageUrl: metadata.imageUrl || rec.imageUrl || "", // Prioritize Jikan, fall back to AI (which is empty), then empty string
          score: metadata.score || rec.score || "N/A",
          sourceUrl: metadata.sourceUrl || `https://myanimelist.net/anime.php?q=${encodeURIComponent(rec.title)}`
        };
      })
    );

    return enrichedRecommendations;

  } catch (error) {
    console.error("Gemini Service Error:", error);
    throw error;
  }
};
