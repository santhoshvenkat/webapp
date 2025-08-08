import { GoogleGenAI, Type } from "@google/genai";
import { WeatherData } from '../types';

// Per guidelines, API key must be from process.env.API_KEY
// Assumes this is available in the execution environment.
const API_KEY = process.env.API_KEY;

export const fetchWeather = async (city: string): Promise<WeatherData> => {
  try {
    if (!API_KEY) {
      throw new Error("API_KEY environment variable is not set.");
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const prompt = `Provide the current weather for ${city}.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            temperature: {
              type: Type.NUMBER,
              description: "Temperature in Celsius, rounded to the nearest integer."
            },
            description: {
              type: Type.STRING,
              description: "A short string describing the weather, like 'Clear Sky' or 'Partly Cloudy'."
            },
            icon: {
              type: Type.STRING,
              description: "An icon name from the list: 'Clear', 'Clouds', 'Rain', 'Snow', 'Thunderstorm', 'Drizzle', 'Atmosphere'."
            }
          },
          required: ["temperature", "description", "icon"]
        },
      },
    });

    const data = JSON.parse(response.text);

    if (typeof data.temperature !== 'number' || typeof data.description !== 'string' || typeof data.icon !== 'string') {
      throw new Error('Invalid weather data format from API');
    }

    return data as WeatherData;
  } catch (error) {
    console.error("Error fetching weather:", error);
    if (error instanceof Error && error.message.includes("API key")) {
         throw new Error("The Gemini API key is invalid or missing. Check your environment variables.");
    }
    if (error instanceof Error && error.message.includes("environment variable is not set")) {
        throw error;
    }
    throw new Error("Could not fetch weather data. Service may be unavailable.");
  }
};
