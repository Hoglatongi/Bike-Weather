import { GoogleGenAI, Type } from "@google/genai";
import { WeatherData } from '../types';

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
          hourlyData: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                time: { type: Type.STRING, description: "Time in HH:00 format (24-hour)." },
                windSpeed: { type: Type.NUMBER, description: "Wind speed in miles per hour." },
                uvIndex: { type: Type.NUMBER, description: "UV index, integer from 0 to 11+." },
                rainProbability: { type: Type.NUMBER, description: "Probability of rain as a percentage from 0 to 100." },
                temperature: { type: Type.NUMBER, description: "Temperature in Fahrenheit." },
              },
              required: ['time', 'windSpeed', 'uvIndex', 'rainProbability', 'temperature'],
            },
          },
        },
        required: ['date', 'hourlyData'],
      },
    },
  },
  required: ['location', 'dailyForecasts'],
};


type ForecastInput = { lat: number; lon: number } | { location: string };

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
    2. UV index as an integer.
    3. Precipitation probability as a percentage.
    4. Temperature in Fahrenheit.
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