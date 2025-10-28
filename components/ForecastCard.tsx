import React, { useState } from 'react';
import { DailyForecast, HourlyData } from '../types';
import WeatherChart from './WeatherChart';
import { WindIcon, SunIcon, RainIcon, RainDropIcon, TemperatureIcon, BikeIcon, WindArrowIcon } from './icons';

interface ForecastCardProps {
  day: DailyForecast;
  tempUnit: 'F' | 'C';
}

const windDirectionToRotation: { [key: string]: number } = {
  'N': 0, 'NNE': 22.5, 'NE': 45, 'ENE': 67.5,
  'E': 90, 'ESE': 112.5, 'SE': 135, 'SSE': 157.5,
  'S': 180, 'SSW': 202.5, 'SW': 225, 'WSW': 247.5,
  'W': 270, 'WNW': 292.5, 'NW': 315, 'NNW': 337.5,
};

const getDominantWindDirection = (hourlyData: HourlyData[]): string => {
  if (!hourlyData || hourlyData.length === 0 || !hourlyData[0].windDirection) return 'N/A';
  const directions = hourlyData.map(h => h.windDirection);
  const frequencyMap = directions.reduce((acc, dir) => {
    if (dir) acc[dir] = (acc[dir] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  if (Object.keys(frequencyMap).length === 0) return 'N/A';

  return Object.keys(frequencyMap).reduce((a, b) => frequencyMap[a] > frequencyMap[b] ? a : b);
};


const ForecastCard: React.FC<ForecastCardProps> = ({ day, tempUnit }) => {
  const [isOpen, setIsOpen] = useState(false);
  const date = new Date(day.date);
  // Adjust for timezone to avoid off-by-one day errors
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
  
  const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long' });
  const formattedDate = date.toLocaleString('en-US', { month: 'short', day: 'numeric' });

  const convertTemp = (tempF: number) => {
    if (tempUnit === 'C') {
        return (tempF - 32) * 5 / 9;
    }
    return tempF;
  };

  const avgWind = day.hourlyData.reduce((acc, cur) => acc + cur.windSpeed, 0) / day.hourlyData.length;
  const maxUv = Math.max(...day.hourlyData.map(h => h.uvIndex));
  const maxRain = Math.max(...day.hourlyData.map(h => h.rainProbability));
  const avgTempInF = day.hourlyData.reduce((acc, cur) => acc + cur.temperature, 0) / day.hourlyData.length;
  const avgTemp = convertTemp(avgTempInF);
  const dominantWindDirection = getDominantWindDirection(day.hourlyData);
  const rotation = windDirectionToRotation[dominantWindDirection] ?? 0;

  const tempChartData = day.hourlyData.map(item => ({
      ...item,
      temperature: convertTemp(item.temperature),
  }));


  return (
    <div className="bg-slate-800/50 rounded-lg shadow-lg overflow-hidden transition-all duration-300 ease-in-out mb-4">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full text-center sm:text-left p-4 focus:outline-none focus:bg-slate-700/50 transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start">
          <div className="sm:pr-4">
            <p className="text-xl font-bold text-white">{dayOfWeek}</p>
            <p className="text-sm text-slate-400">{formattedDate}</p>
            {day.bikeAdvisory && (
                <div className="flex items-start mt-2 text-slate-300 max-w-sm text-left">
                    <BikeIcon className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-cyan-400"/>
                    <p className="text-sm">{day.bikeAdvisory}</p>
                </div>
            )}
          </div>
          <div className="flex items-center space-x-4 text-slate-300 flex-shrink-0 mt-4 sm:mt-0">
             <div className="flex items-center space-x-1" title={`Average Temperature: ${avgTemp.toFixed(0)}°${tempUnit}`}>
                <TemperatureIcon className="w-5 h-5 text-orange-400" /> <span>{avgTemp.toFixed(0)}°{tempUnit}</span>
             </div>
             <div className="flex items-center space-x-2" title={`Average Wind: ${avgWind.toFixed(0)} mph from ${dominantWindDirection}`}>
                <WindIcon className="w-5 h-5 text-sky-300" />
                <span className="whitespace-nowrap">{avgWind.toFixed(0)} mph</span>
                {dominantWindDirection !== 'N/A' && (
                    <div className="flex items-center gap-1 text-slate-400">
                        <WindArrowIcon className="w-4 h-4" rotation={rotation} />
                        <span className="text-xs font-semibold">{dominantWindDirection}</span>
                    </div>
                )}
             </div>
             <div className="flex items-center space-x-1" title={`Max UV Index: ${maxUv}`}>
                <SunIcon className="w-5 h-5 text-amber-300" /> <span>{maxUv}</span>
             </div>
             <div className="flex items-center space-x-1.5" title={`Max Rain Probability: ${maxRain}%`}>
                <RainDropIcon className="w-6 h-6" percentage={maxRain} />
                <span className="font-medium">{maxRain}%</span>
             </div>
            <svg
              className={`w-6 h-6 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="p-4 border-t border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="flex items-center text-lg font-semibold mb-2 text-orange-400">
                        <TemperatureIcon className="w-5 h-5 mr-2" /> Temperature (°{tempUnit})
                    </h3>
                    <WeatherChart data={tempChartData} dataKey="temperature" strokeColor="#fb923c" unit={`°${tempUnit}`} tempUnit={tempUnit} />
                </div>
                <div>
                    <h3 className="flex items-center text-lg font-semibold mb-2 text-sky-300">
                        <WindIcon className="w-5 h-5 mr-2" /> Wind Speed (mph)
                    </h3>
                    <WeatherChart data={day.hourlyData} dataKey="windSpeed" strokeColor="#38bdf8" unit="mph" tempUnit={tempUnit} />
                </div>
                <div>
                    <h3 className="flex items-center text-lg font-semibold mb-2 text-amber-300">
                        <SunIcon className="w-5 h-5 mr-2" /> UV Index
                    </h3>
                    <WeatherChart data={day.hourlyData} dataKey="uvIndex" strokeColor="#fcd34d" unit="" tempUnit={tempUnit} />
                </div>
                <div>
                    <h3 className="flex items-center text-lg font-semibold mb-2 text-teal-300">
                        <RainIcon className="w-5 h-5 mr-2" /> Rain Probability (%)
                    </h3>
                    <WeatherChart data={day.hourlyData} dataKey="rainProbability" strokeColor="#5eead4" unit="%" chartType="area" tempUnit={tempUnit} />
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ForecastCard;
