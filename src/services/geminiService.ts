import { GoogleGenAI, Type } from "@google/genai";
import { WeatherData } from '../types';

export const fetchWeather = async ({ lat, lon }: { lat: number, lon: number }): Promise<WeatherData> => {
  try {
    // Per guidelines, API key must be from process.env.API_KEY.
    // It is made available to the client via Vite's `define` config.
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable is not set. This should be configured in your build environment.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `Provide the current weather and city name for the location at latitude ${lat} and longitude ${lon}.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            cityName: {
              type: Type.STRING,
              description: "The name of the city for the given coordinates, e.g., 'Mountain View, CA'."
            },
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
          required: ["cityName", "temperature", "description", "icon"]
        },
      },
    });

    const data = JSON.parse(response.text);

    if (typeof data.cityName !== 'string' || typeof data.temperature !== 'number' || typeof data.description !== 'string' || typeof data.icon !== 'string') {
      throw new Error('Invalid weather data format from API');
    }

    return data as WeatherData;
  } catch (error) {
    console.error("Error fetching weather:", error);
    if (error instanceof Error && error.message.includes("API key")) {
         throw new Error("The Gemini API key is invalid or missing. Check your environment variables.");
    }
    if (error instanceof Error && error.message.includes("is not set")) {
        throw error;
    }
    throw new Error("Could not fetch weather data. The service may be unavailable or the API key is invalid.");
  }
};