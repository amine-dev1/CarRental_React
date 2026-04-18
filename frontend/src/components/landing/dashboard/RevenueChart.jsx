import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import CustomSelect from "../../common/CustomSelect";
import { useTheme } from "../../../context/ThemeContext";

export default function RevenueChart({ data, totalRevenue, period, onPeriodChange }) {
  const { darkMode } = useTheme();
  // Format total revenue to local string (MAD)
  const formattedTotal = new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD',
    maximumFractionDigits: 0
  }).format(totalRevenue || 0);

  return (
    <div
      className={`
        rounded-2xl p-8
        transition-all duration-250
        ${darkMode ? 'bg-[#111827] border-white/5 shadow-[0_8px_24px_rgba(0,0,0,0.4)]' : 'bg-white border-gray-100 shadow-[0_8px_24px_rgba(0,0,0,0.05)]'}
        border
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-sm font-semibold text-[#64748B] uppercase tracking-wider">Aperçu des Revenus (MAD)</p>
          <h2 className={`text-4xl font-bold mt-1 ${darkMode ? 'text-[#F1F5F9]' : 'text-[#0F172A]'}`}>
            {formattedTotal}
          </h2>
        </div>

        <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <span className="text-xs">▲</span> +12.5%
            </div>
            
            <CustomSelect
                value={period}
                onChange={onPeriodChange}
                options={[
                    { value: 'weekly', label: 'Semaine' },
                    { value: 'monthly', label: 'Mensuel' },
                    { value: 'annual', label: 'Annuel' }
                ]}
                className="w-32"
            />
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-6 text-sm mb-6">
        <LegendDot color={darkMode ? "#3B82F6" : "#2563EB"} label="Revenus bruts" darkMode={darkMode} />
        <LegendDot color={darkMode ? "#60A5FA" : "#9DB7FF"} label="Estimations" darkMode={darkMode} />
      </div>

      {/* Chart */}
      <div className="h-64 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={darkMode ? "#3B82F6" : "#2563EB"} stopOpacity={0.8}/>
                    <stop offset="100%" stopColor={darkMode ? "#3B82F6" : "#2563EB"} stopOpacity={1}/>
                </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94A3B8", fontSize: 12, fontWeight: 500 }}
              dy={10}
            />
            <YAxis hide />
            <Tooltip 
                cursor={{ fill: "rgba(255, 255, 255, 0.03)", radius: 12 }}
                contentStyle={{ 
                    backgroundColor: '#1E293B', 
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                    padding: '12px'
                }}
                itemStyle={{ color: '#F1F5F9', fontWeight: 600 }}
                labelStyle={{ color: '#94A3B8', marginBottom: '4px' }}
                formatter={(value) => [`${value} €`, "Revenu"]}
            />
            <Bar 
                dataKey="revenue" 
                fill="url(#barGradient)" 
                radius={[8, 8, 8, 8]}
                barSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function LegendDot({ color, label, darkMode }) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className="w-3 h-3 rounded-full shadow-sm"
        style={{ backgroundColor: color }}
      />
      <span className={`text-sm font-medium uppercase tracking-tight ${darkMode ? 'text-[#64748B]' : 'text-gray-600'}`}>{label}</span>
    </div>
  );
}
