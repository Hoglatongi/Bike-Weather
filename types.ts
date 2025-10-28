
export interface HourlyData {
  time: string; // "HH:00"
  windSpeed: number; // mph
  windDirection: string; // N, NE, S, SW etc.
  uvIndex: number; // 0-11+
  rainProbability: number; // 0-100
  temperature: number; // °F
}

export interface DailyForecast {
  date: string; // "YYYY-MM-DD"
  hourlyData: HourlyData[];
  bikeAdvisory: string;
}

export interface WeatherData {
  location: {
    city: string;
    country: string;
  };
  dailyForecasts: DailyForecast[];
}

export type ForecastInput = { lat: number; lon: number } | { location: string };

export interface BikeTrail {
  name: string;
  description: string;
  mapsUri?: string;
}
