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
import { type Indicator, type Gender } from '../data/kemenkes-standards';
import { getTableData } from '../utils/zscore';

interface GrowthChartProps {
  indicator: Indicator;
  gender: Gender;
  userData: { x: number; y: number; date: string }[];
}

export const GrowthChart: React.FC<GrowthChartProps> = ({ indicator, gender, userData }) => {
  const chartData = useMemo(() => {
    const table = getTableData(indicator, gender);
    return table.map(row => ({
      x: row.x,
      sd3Neg: row.sd3neg,
      sd2Neg: row.sd2neg,
      sd1Neg: row.sd1neg,
      median: row.median,
      sd1Pos: row.sd1pos,
      sd2Pos: row.sd2pos,
      sd3Pos: row.sd3pos,
    }));
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
