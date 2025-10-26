
import React, { useState } from 'react';
import { DailyForecast } from '../types';
import WeatherChart from './WeatherChart';
import { WindIcon, SunIcon, RainIcon, RainDropIcon, TemperatureIcon, BikeIcon } from './icons';

interface ForecastCardProps {
  day: DailyForecast;
}

const ForecastCard: React.FC<ForecastCardProps> = ({ day }) => {
  const [isOpen, setIsOpen] = useState(false);
  const date = new Date(day.date);
  // Adjust for timezone to avoid off-by-one day errors
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
  
  const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long' });
  const formattedDate = date.toLocaleString('en-US', { month: 'short', day: 'numeric' });

  const avgWind = day.hourlyData.reduce((acc, cur) => acc + cur.windSpeed, 0) / day.hourlyData.length;
  const maxUv = Math.max(...day.hourlyData.map(h => h.uvIndex));
  const maxRain = Math.max(...day.hourlyData.map(h => h.rainProbability));
  const avgTemp = day.hourlyData.reduce((acc, cur) => acc + cur.temperature, 0) / day.hourlyData.length;


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
             <div className="flex items-center space-x-1" title={`Average Temperature: ${avgTemp.toFixed(0)}°F`}>
                <TemperatureIcon className="w-5 h-5 text-orange-400" /> <span>{avgTemp.toFixed(0)}°F</span>
             </div>
             <div className="flex items-center space-x-1" title={`Average Wind: ${avgWind.toFixed(0)} mph`}>
                <WindIcon className="w-5 h-5" /> <span>{avgWind.toFixed(0)} mph</span>
             </div>
             <div className="flex items-center space-x-1" title={`Max UV Index: ${maxUv}`}>
                <SunIcon className="w-5 h-5" /> <span>{maxUv}</span>
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
                        <TemperatureIcon className="w-5 h-5 mr-2" /> Temperature (°F)
                    </h3>
                    <WeatherChart data={day.hourlyData} dataKey="temperature" strokeColor="#fb923c" unit="°F" />
                </div>
                <div>
                    <h3 className="flex items-center text-lg font-semibold mb-2 text-sky-300">
                        <WindIcon className="w-5 h-5 mr-2" /> Wind Speed (mph)
                    </h3>
                    <WeatherChart data={day.hourlyData} dataKey="windSpeed" strokeColor="#38bdf8" unit="mph" />
                </div>
                <div>
                    <h3 className="flex items-center text-lg font-semibold mb-2 text-amber-300">
                        <SunIcon className="w-5 h-5 mr-2" /> UV Index
                    </h3>
                    <WeatherChart data={day.hourlyData} dataKey="uvIndex" strokeColor="#fcd34d" unit="" />
                </div>
                <div>
                    <h3 className="flex items-center text-lg font-semibold mb-2 text-teal-300">
                        <RainIcon className="w-5 h-5 mr-2" /> Rain Probability (%)
                    </h3>
                    <WeatherChart data={day.hourlyData} dataKey="rainProbability" strokeColor="#5eead4" unit="%" chartType="area" />
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ForecastCard;
