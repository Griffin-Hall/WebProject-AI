import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';
import { CloudRain, Sun, Thermometer } from 'lucide-react';
import { MONTH_NAMES } from '@/lib/constants';
import type { DestinationWeather } from '@voyage-matcher/shared';

interface WeatherChartProps {
  weather: DestinationWeather[];
}

type MetricType = 'temp' | 'rain' | 'sun';

export function WeatherChart({ weather }: WeatherChartProps) {
  const [activeMetric, setActiveMetric] = useState<MetricType>('temp');

  const data = weather
    .sort((a, b) => a.month - b.month)
    .map((w) => ({
      month: MONTH_NAMES[w.month - 1],
      temp: Math.round(w.avgTempC),
      rainfall: Math.round(w.avgRainfallMm),
      sunshine: Math.round(w.sunshineHours),
    }));

  // Compute nice Y-axis domains so temp line and bars each use their own scale
  const tempDomain = useMemo(() => {
    const temps = data.map(d => d.temp);
    const min = Math.min(...temps);
    const max = Math.max(...temps);
    const pad = Math.max(5, Math.ceil((max - min) * 0.2));
    return [Math.floor(min - pad), Math.ceil(max + pad)];
  }, [data]);

  const barDataKey = activeMetric === 'rain' ? 'rainfall' : activeMetric === 'sun' ? 'sunshine' : 'rainfall';

  const barDomain = useMemo(() => {
    const vals = data.map(d => d[barDataKey as keyof typeof d] as number);
    const max = Math.max(...vals);
    return [0, Math.ceil(max * 1.15) || 10];
  }, [data, barDataKey]);

  const metrics = [
    { key: 'temp', label: 'Temperature', icon: Thermometer, color: '#3377ff', unit: '°C' },
    { key: 'rain', label: 'Rainfall', icon: CloudRain, color: '#599dff', unit: 'mm' },
    { key: 'sun', label: 'Sunshine', icon: Sun, color: '#F59E0B', unit: 'h' },
  ] as const;

  const activeMetricConfig = metrics.find(m => m.key === activeMetric)!;
  const barUnit = activeMetric === 'rain' ? 'mm' : activeMetric === 'sun' ? 'h' : 'mm';

  return (
    <div className="glass-card-premium p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h3 className="font-display text-lg font-semibold text-white flex items-center gap-2">
          <activeMetricConfig.icon className="h-5 w-5 text-aurora-light" />
          Monthly Weather
        </h3>
        
        {/* Metric Toggle */}
        <div className="flex items-center gap-1 rounded-lg bg-white/[0.03] p-1">
          {metrics.map((metric) => (
            <motion.button
              key={metric.key}
              onClick={() => setActiveMetric(metric.key as MetricType)}
              className={`
                relative px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                ${activeMetric === metric.key ? 'text-white' : 'text-slate-500 hover:text-slate-300'}
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {activeMetric === metric.key && (
                <motion.div
                  layoutId="weather-metric"
                  className="absolute inset-0 bg-white/[0.08] rounded-md"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <metric.icon className="h-3 w-3" />
                <span className="hidden sm:inline">{metric.label}</span>
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3377ff" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3377ff" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#599dff" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#599dff" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="sunGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 11, fill: '#64748b' }} 
              stroke="rgba(255,255,255,0.06)"
              axisLine={false}
              tickLine={false}
            />
            {/* Left Y-axis: Temperature (°C) */}
            <YAxis 
              yAxisId="temp"
              orientation="left"
              domain={tempDomain}
              tick={{ fontSize: 11, fill: '#3377ff' }} 
              stroke="rgba(255,255,255,0.06)"
              axisLine={false}
              tickLine={false}
              unit="°C"
            />
            {/* Right Y-axis: Bars (rainfall mm or sunshine h) */}
            <YAxis 
              yAxisId="bar"
              orientation="right"
              domain={barDomain}
              tick={{ fontSize: 11, fill: '#64748b' }} 
              stroke="rgba(255,255,255,0.06)"
              axisLine={false}
              tickLine={false}
              unit={barUnit}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-xl border border-white/[0.08] bg-[#1a1f2e] p-3 shadow-xl">
                      <p className="text-xs text-slate-400 mb-2">{label}</p>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Thermometer className="h-3 w-3 text-blue-400" />
                          <span className="text-sm text-white">{payload[0]?.payload?.temp}°C</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CloudRain className="h-3 w-3 text-blue-300" />
                          <span className="text-sm text-slate-300">{payload[0]?.payload?.rainfall}mm rain</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Sun className="h-3 w-3 text-amber-400" />
                          <span className="text-sm text-slate-300">{payload[0]?.payload?.sunshine}h sun</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            
            {/* Bars on right axis */}
            <Bar 
              yAxisId="bar"
              dataKey={barDataKey}
              fill={activeMetric === 'rain' ? 'url(#rainGradient)' : activeMetric === 'sun' ? 'url(#sunGradient)' : 'url(#rainGradient)'}
              radius={[4, 4, 0, 0]}
              name={activeMetricConfig.label}
            />

            {/* Temperature line on left axis — always visible */}
            <Line
              yAxisId="temp"
              type="monotone"
              dataKey="temp"
              stroke="#3377ff"
              strokeWidth={2.5}
              dot={{ fill: '#3377ff', r: 3, stroke: '#0A0E1A', strokeWidth: 2 }}
              activeDot={{ r: 5, fill: '#3377ff', stroke: '#fff', strokeWidth: 2 }}
              name="Temperature (°C)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-[#3377ff]" />
          <span>Temperature (°C)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-[#599dff]" />
          <span>Rainfall (mm)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-amber-500" />
          <span>Sunshine hours</span>
        </div>
      </div>
    </div>
  );
}
