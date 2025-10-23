
import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from 'recharts';
import { HourlyData } from '../types';

interface WeatherChartProps {
  data: HourlyData[];
  dataKey: keyof HourlyData;
  strokeColor: string;
  unit: string;
  chartType?: 'line' | 'area';
}

const CustomTooltip: React.FC<any> = ({ active, payload, label, unit }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800/80 backdrop-blur-sm p-2 border border-slate-600 rounded-md text-sm">
        <p className="label text-slate-300">{`${label}`}</p>
        <p className="intro text-white">{`${payload[0].value} ${unit}`}</p>
      </div>
    );
  }
  return null;
};

const WeatherChart: React.FC<WeatherChartProps> = ({ data, dataKey, strokeColor, unit, chartType = 'line' }) => {
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
          <Tooltip content={<CustomTooltip unit={unit} />} />
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
        <Tooltip content={<CustomTooltip unit={unit} />} />
        <Line type="monotone" dataKey={dataKey} stroke={strokeColor} strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 6 }}/>
      </LineChart>
    </ChartContainer>
  );
};

export default WeatherChart;
