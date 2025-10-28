
import { GoogleGenAI, Type } from "@google/genai";
import { WeatherData, ForecastInput, BikeTrail } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const weatherSchema = {
  type: Type.OBJECT,
  properties: {
    location: {
      type: Type.OBJECT,
      properties: {
        city: { type: Type.STRING },
        country: { type: Type.STRING },
      },
      required: ['city', 'country'],
    },
    dailyForecasts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          date: { type: Type.STRING, description: "Date in YYYY-MM-DD format." },
          bikeAdvisory: { type: Type.STRING, description: "A brief, friendly advisory for cyclists based on the day's weather, e.g., 'Perfect day for a ride!' or 'High winds expected, be cautious.'" },
          hourlyData: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                time: { type: Type.STRING, description: "Time in HH:00 format (24-hour)." },
                windSpeed: { type: Type.NUMBER, description: "Wind speed in miles per hour." },
                windDirection: { type: Type.STRING, description: "Wind direction as a cardinal direction (e.g., N, NE, S, SW)." },
                uvIndex: { type: Type.NUMBER, description: "UV index, integer from 0 to 11+." },
                rainProbability: { type: Type.NUMBER, description: "Probability of rain as a percentage from 0 to 100." },
                temperature: { type: Type.NUMBER, description: "Temperature in Fahrenheit." },
              },
              required: ['time', 'windSpeed', 'windDirection', 'uvIndex', 'rainProbability', 'temperature'],
            },
          },
        },
        required: ['date', 'hourlyData', 'bikeAdvisory'],
      },
    },
  },
  required: ['location', 'dailyForecasts'],
};


export const fetchWeatherForecast = async (input: ForecastInput): Promise<WeatherData> => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;

  let prompt: string;

  const commonPrompt = `
    For each of the next 5 days, provide an hourly forecast for daytime hours only, specifically from 7 AM to 7 PM (19:00).
    The data for each hour should include:
    1. Wind speed in miles per hour.
    2. Wind direction as a cardinal direction (e.g., N, NE, S, SW).
    3. UV index as an integer.
    4. Precipitation probability as a percentage.
    5. Temperature in Fahrenheit.
    Also provide a 'bikeAdvisory' for each day: a brief, friendly summary for cyclists based on the overall conditions (e.g., "Great day for a ride, winds will be low.", "Morning ride is best to avoid afternoon rain.", or "High winds and rain likely, consider indoor training.").
    Return the city and country name for the location.
  `;

  if ('lat' in input && 'lon' in input) {
    prompt = `
      Based on the latitude ${input.lat} and longitude ${input.lon}, provide a 5-day weather forecast suitable for biking, starting from today which is ${formattedDate}.
      ${commonPrompt}
    `;
  } else {
     prompt = `
      Based on the location "${input.location}", provide a 5-day weather forecast suitable for biking, starting from today which is ${formattedDate}.
      ${commonPrompt}
    `;
  }


  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: weatherSchema,
      },
    });

    const text = response.text.trim();
    if (!text) {
      throw new Error("The model returned an empty response. The location may not be valid.");
    }
    const weatherData = JSON.parse(text);
    return weatherData as WeatherData;
  } catch (error) {
    console.error("Error fetching weather data from Gemini API:", error);
    if (error instanceof SyntaxError) {
        throw new Error("Failed to parse weather data. The location might not be recognized.");
    }
    throw new Error("Failed to fetch weather forecast. Please check the location and try again.");
  }
};

export const fetchBikeTrails = async (location: string, userCoords?: { lat: number; lon: number }): Promise<BikeTrail[]> => {
  const prompt = `Find popular bike trails near "${location}". For each trail, provide a name and a brief, one-sentence description highlighting what it's known for (e.g., scenic views, difficulty, family-friendly). Return the result as a valid JSON array of objects, where each object has a "name" and a "description" key.`;

  const config: any = {
    tools: [{ googleMaps: {} }],
  };

  if (userCoords) {
    config.toolConfig = {
      retrievalConfig: {
        latLng: {
          latitude: userCoords.lat,
          longitude: userCoords.lon
        }
      }
    };
  }
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: config,
    });

    const text = response.text.trim();
    if (!text) {
      throw new Error("The model returned an empty response. Could not find trails for this location.");
    }
    
    let trails: BikeTrail[] = [];
    try {
        // Find the JSON part of the response
        const jsonMatch = text.match(/\[.*\]/s);
        if (jsonMatch) {
            trails = JSON.parse(jsonMatch[0]);
        } else {
            throw new Error("No JSON array found in the response.");
        }
    } catch (e) {
        throw new Error("Failed to parse trail data from the model's response.");
    }

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

    if (groundingChunks && trails.length > 0) {
        const mapsData = groundingChunks
            .filter(chunk => chunk.maps && chunk.maps.uri && chunk.maps.title)
            .map(chunk => ({
                uri: chunk.maps.uri,
                title: chunk.maps.title
            }));

        // Attempt to match trails to maps links
        return trails.map(trail => {
            const matchedMap = mapsData.find(map => trail.name.toLowerCase().includes(map.title.toLowerCase()) || map.title.toLowerCase().includes(trail.name.toLowerCase()));
            return {
                ...trail,
                mapsUri: matchedMap?.uri,
            };
        });
    }

    if (trails.length === 0) {
      throw new Error("No bike trails found for the specified location.");
    }

    return trails;

  } catch (error) {
    console.error("Error fetching bike trails from Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(error.message);
    }
    throw new Error("Failed to fetch bike trails. Please check the location and try again.");
  }
};
