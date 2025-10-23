
export interface HourlyData {
  time: string; // "HH:00"
  windSpeed: number; // mph
  uvIndex: number; // 0-11+
  rainProbability: number; // 0-100
}

export interface DailyForecast {
  date: string; // "YYYY-MM-DD"
  hourlyData: HourlyData[];
}

export interface WeatherData {
  location: {
    city: string;
    country: string;
  };
  dailyForecasts: DailyForecast[];
}
