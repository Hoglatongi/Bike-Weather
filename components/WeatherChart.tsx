import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from 'recharts';
import { HourlyData } from '../types';
import { TemperatureIcon, WindIcon, SunIcon, RainIcon, WindArrowIcon, SnowflakeIcon } from './icons';

interface WeatherChartProps {
  data: HourlyData[];
  dataKey: keyof HourlyData;
  strokeColor: string;
  unit: string;
  chartType?: 'line' | 'area';
  tempUnit?: 'F' | 'C';
}

const windDirectionToRotation: { [key: string]: number } = {
  'N': 0, 'NNE': 22.5, 'NE': 45, 'ENE': 67.5,
  'E': 90, 'ESE': 112.5, 'SE': 135, 'SSE': 157.5,
  'S': 180, 'SSW': 202.5, 'SW': 225, 'WSW': 247.5,
  'W': 270, 'WNW': 292.5, 'NW': 315, 'NNW': 337.5,
};

const calculateWindChill = (tempF: number, windSpeedMph: number): number | null => {
  // Wind chill is generally calculated for temps <= 50°F and wind > 3 mph.
  if (tempF > 50 || windSpeedMph <= 3) {
    return null;
  }
  const windChill = 35.74 + 0.6215 * tempF - 35.75 * Math.pow(windSpeedMph, 0.16) + 0.4275 * tempF * Math.pow(windSpeedMph, 0.16);
  return windChill;
};

const CustomTooltip: React.FC<any> = ({ active, payload, label, tempUnit = 'F' }) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload as HourlyData;
    const currentDataKey = payload[0].dataKey;

    const convertTemp = (tempF: number) => {
      if (tempUnit === 'C') {
        return (tempF - 32) * 5 / 9;
      }
      return tempF;
    };
    
    // The `data` prop for the temperature chart is pre-converted. 
    // For all other charts, it's the raw data with temp in Fahrenheit.
    const temperature = currentDataKey === 'temperature' 
      ? dataPoint.temperature 
      : convertTemp(dataPoint.temperature);
        
    const rotation = windDirectionToRotation[dataPoint.windDirection] ?? 0;

    // Wind chill calculation - always use the raw Fahrenheit temperature from the payload.
    const windChillF = calculateWindChill(dataPoint.temperature, dataPoint.windSpeed);

    return (
      <div className="bg-slate-800/90 backdrop-blur-sm p-3 border border-slate-600 rounded-lg text-sm shadow-lg w-52">
        <p className="label text-slate-200 font-bold mb-2 text-base">{`${label}`}</p>
        <div className="space-y-1.5 text-slate-300">
          <div className="flex items-center justify-between" title={`Temperature: ${temperature.toFixed(0)}°${tempUnit}`}>
            <div className="flex items-center gap-2"><TemperatureIcon className="w-4 h-4 text-orange-400" /><span>Temp</span></div>
            <span>{temperature.toFixed(0)}°{tempUnit}</span>
          </div>

          {windChillF !== null && (
            <div className="flex items-center justify-between" title={`Feels Like: ${convertTemp(windChillF).toFixed(0)}°${tempUnit}`}>
              <div className="flex items-center gap-2"><SnowflakeIcon className="w-4 h-4 text-cyan-400" /><span>Feels Like</span></div>
              <span>{convertTemp(windChillF).toFixed(0)}°{tempUnit}</span>
            </div>
          )}

          <div className="flex items-center justify-between" title={`Wind: ${dataPoint.windSpeed} mph from ${dataPoint.windDirection}`}>
            <div className="flex items-center gap-2"><WindIcon className="w-4 h-4 text-sky-300" /><span>Wind</span></div>
            <div className="flex items-center gap-1.5">
              <span>{dataPoint.windSpeed} mph</span>
              {dataPoint.windDirection && <>
                <WindArrowIcon className="w-3 h-3 text-slate-400" rotation={rotation} />
                <span className="font-mono text-xs">{dataPoint.windDirection}</span>
              </>}
            </div>
          </div>
          <div className="flex items-center justify-between" title={`Rain Probability: ${dataPoint.rainProbability}%`}>
            <div className="flex items-center gap-2"><RainIcon className="w-4 h-4 text-teal-300" /><span>Rain</span></div>
            <span>{dataPoint.rainProbability}%</span>
          </div>
          <div className="flex items-center justify-between" title={`UV Index: ${dataPoint.uvIndex}`}>
            <div className="flex items-center gap-2"><SunIcon className="w-4 h-4 text-amber-300" /><span>UV</span></div>
            <span>{dataPoint.uvIndex}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const WeatherChart: React.FC<WeatherChartProps> = ({ data, dataKey, strokeColor, unit, chartType = 'line', tempUnit }) => {
  const formattedData = data.map(item => ({
    ...item,
    time: item.time.split(':')[0] + ':00', 
  }));

  const ChartContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="h-48 w-full">
      <ResponsiveContainer>
        {children}
      </ResponsiveContainer>
    </div>
  );

  if (chartType === 'area') {
    return (
      <ChartContainer>
        <AreaChart data={formattedData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <defs>
            <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.7}/>
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tick={{ fill: '#94a3b8' }} />
          <YAxis stroke="#94a3b8" fontSize={12} unit={unit} tick={{ fill: '#94a3b8' }} />
          <Tooltip content={<CustomTooltip tempUnit={tempUnit} />} />
          <Area type="monotone" dataKey={dataKey} stroke={strokeColor} strokeWidth={2} fillOpacity={1} fill={`url(#gradient-${dataKey})`} />
        </AreaChart>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer>
      <LineChart data={formattedData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tick={{ fill: '#94a3b8' }} />
        <YAxis stroke="#94a3b8" fontSize={12} unit={unit} tick={{ fill: '#94a3b8' }} />
        <Tooltip content={<CustomTooltip tempUnit={tempUnit} />} />
        <Line type="monotone" dataKey={dataKey} stroke={strokeColor} strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 6 }}/>
      </LineChart>
    </ChartContainer>
  );
};

export default WeatherChart;