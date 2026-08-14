import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { type Indicator, type Gender, lmsData } from '../data/lms-reference';
import { getInterpolatedLMS, calculateSDValue } from '../utils/zscore';

interface GrowthChartProps {
  indicator: Indicator;
  gender: Gender;
  userData: { x: number; y: number; date: string }[];
}

export const GrowthChart: React.FC<GrowthChartProps> = ({ indicator, gender, userData }) => {
  const chartData = useMemo(() => {
    const data = [];
    // Generate points for the curves based on the indicator's domain
    const table = lmsData[indicator][gender];
    const minX = table[0].x;
    const maxX = table[table.length - 1].x;
    const step = indicator === 'BBTB' ? 5 : 1; // 5cm step for BBTB, 1 month step for others

    for (let x = minX; x <= maxX; x += step) {
      const lms = getInterpolatedLMS(indicator, gender, x);
      if (lms) {
        data.push({
          x,
          sd3Neg: calculateSDValue(-3, lms),
          sd2Neg: calculateSDValue(-2, lms),
          sd1Neg: calculateSDValue(-1, lms),
          median: calculateSDValue(0, lms),
          sd1Pos: calculateSDValue(1, lms),
          sd2Pos: calculateSDValue(2, lms),
          sd3Pos: calculateSDValue(3, lms),
        });
      }
    }
    return data;
  }, [indicator, gender]);

  const yAxisLabel = indicator === 'TBU' ? 'Tinggi (cm)' : indicator === 'IMTU' ? 'IMT (kg/m²)' : 'Berat (kg)';
  const xAxisLabel = indicator === 'BBTB' ? 'Tinggi/Panjang (cm)' : 'Usia (Bulan)';
  
  // Custom tooltip to format values
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 p-3 shadow-md rounded-md text-sm">
          <p className="font-semibold text-gray-700 mb-2">{xAxisLabel}: {label}</p>
          {payload.map((entry: any, index: number) => (
             <p key={index} style={{ color: entry.color }} className="font-medium text-xs">
               {entry.name}: {entry.value.toFixed(2)}
             </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[400px] w-full bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis 
            dataKey="x" 
            type="number" 
            domain={['dataMin', 'dataMax']} 
            allowDataOverflow={false}
            label={{ value: xAxisLabel, position: 'bottom', offset: -10 }}
            tick={{ fontSize: 12, fill: '#666' }}
            allowDuplicatedCategory={false}
          />
          <YAxis 
            domain={['auto', 'auto']}
            label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', offset: 15 }}
            tick={{ fontSize: 12, fill: '#666' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
          
          {/* Reference Curves */}
          <Line data={chartData} type="monotone" dataKey="sd3Pos" stroke="#ef4444" strokeWidth={1} dot={false} name="+3 SD" isAnimationActive={false} />
          <Line data={chartData} type="monotone" dataKey="sd2Pos" stroke="#f97316" strokeWidth={1} dot={false} name="+2 SD" isAnimationActive={false} />
          <Line data={chartData} type="monotone" dataKey="sd1Pos" stroke="#eab308" strokeWidth={1} dot={false} name="+1 SD" isAnimationActive={false} />
          <Line data={chartData} type="monotone" dataKey="median" stroke="#22c55e" strokeWidth={2} dot={false} name="Median" isAnimationActive={false} />
          <Line data={chartData} type="monotone" dataKey="sd1Neg" stroke="#eab308" strokeWidth={1} dot={false} name="-1 SD" isAnimationActive={false} />
          <Line data={chartData} type="monotone" dataKey="sd2Neg" stroke="#f97316" strokeWidth={1} dot={false} name="-2 SD" isAnimationActive={false} />
          <Line data={chartData} type="monotone" dataKey="sd3Neg" stroke="#ef4444" strokeWidth={1} dot={false} name="-3 SD" isAnimationActive={false} />

          {/* User Data Points */}
          <Line 
            data={userData} 
            type="linear" 
            dataKey="y" 
            stroke="#2563eb" 
            strokeWidth={2} 
            name="Anak" 
            dot={{ r: 5, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
