import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Area,
} from 'recharts';
import { MONTH_NAMES } from '@/lib/constants';
import type { DestinationWeather } from '@voyage-matcher/shared';

interface WeatherChartProps {
  weather: DestinationWeather[];
}

export function WeatherChart({ weather }: WeatherChartProps) {
  const data = weather
    .sort((a, b) => a.month - b.month)
    .map((w) => ({
      month: MONTH_NAMES[w.month - 1],
      temp: Math.round(w.avgTempC),
      rainfall: Math.round(w.avgRainfallMm),
      sunshine: Math.round(w.sunshineHours),
    }));

  return (
    <div className="space-y-4">
      <h3 className="font-display text-lg font-semibold text-gray-900">Monthly Weather</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <YAxis yAxisId="temp" tick={{ fontSize: 12 }} stroke="#9ca3af" unit="°" />
            <YAxis yAxisId="rain" orientation="right" tick={{ fontSize: 12 }} stroke="#9ca3af" unit="mm" />
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
            />
            <Bar yAxisId="rain" dataKey="rainfall" fill="#bae6fd" radius={[4, 4, 0, 0]} name="Rainfall (mm)" />
            <Line
              yAxisId="temp"
              type="monotone"
              dataKey="temp"
              stroke="#0ea5e9"
              strokeWidth={2.5}
              dot={{ fill: '#0ea5e9', r: 4 }}
              name="Temperature (°C)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
