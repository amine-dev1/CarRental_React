import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function RevenueChart({ data, totalRevenue, period, onPeriodChange }) {
  // Format total revenue to local string (MAD)
  const formattedTotal = new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD',
    maximumFractionDigits: 0
  }).format(totalRevenue || 0);

  return (
    <div
      className="
        rounded-3xl p-8
        bg-white/40 backdrop-blur-md
        border border-white/20
        shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]
        transition-all duration-300
      "
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Aperçu des Revenus (MAD)</p>
          <h2 className="text-4xl font-bold text-gray-900 mt-1">
            {formattedTotal}
          </h2>
        </div>

        <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <span className="text-xs">▲</span> +12.5%
            </div>
            
            <select 
                value={period}
                onChange={(e) => onPeriodChange(e.target.value)}
                className="bg-white/50 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-1.5 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-secondary/50 cursor-pointer shadow-sm hover:bg-white/80 transition-all"
            >
                <option value="weekly">Semaine</option>
                <option value="monthly">Mensuel</option>
                <option value="annual">Annuel</option>
            </select>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-6 text-sm mb-6">
        <LegendDot color="#2563EB" label="Revenus bruts" />
        <LegendDot color="#9DB7FF" label="Estimations" />
      </div>

      {/* Chart */}
      <div className="h-64 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#2563EB" stopOpacity={1}/>
                </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280", fontSize: 12, fontWeight: 500 }}
              dy={10}
            />
            <YAxis hide />
            <Tooltip 
                cursor={{ fill: "rgba(37, 99, 235, 0.05)", radius: 12 }}
                contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
                    padding: '12px'
                }}
                itemStyle={{ color: '#111827', fontWeight: 600 }}
                labelStyle={{ color: '#6B7280', marginBottom: '4px' }}
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

function LegendDot({ color, label }) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className="w-3 h-3 rounded-full shadow-sm"
        style={{ backgroundColor: color }}
      />
      <span className="text-sm font-medium text-gray-600 uppercase tracking-tight">{label}</span>
    </div>
  );
}
