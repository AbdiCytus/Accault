// components/profile/ProfileChart.tsx
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// 1. Interface untuk struktur data poin grafik kita (Data Asli)
interface ChartDataPoint {
  name: string;
  value: number;
  percentage: string;
  color: string;
}

// 2. Interface Manual untuk Props Tooltip (Pengganti TooltipProps bawaan)
// Ini menjamin TypeScript mengenali struktur 'payload' dengan tepat.
interface CustomTooltipProps {
  active?: boolean;
  payload?: {
    value: number; // Nilai angka (jumlah akun)
    payload: ChartDataPoint; // Objek data asli kita (akses ke percentage, color, dll)
  }[];
  label?: string;
}

type Props = {
  categoryData: Record<string, number>;
  totalAccounts: number;
};

// --- Custom Tooltip Component ---
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  // Validasi: Pastikan tooltip aktif dan payload ada isinya
  if (active && payload && payload.length > 0) {
    // Kita bisa langsung akses .payload karena sudah didefinisikan di interface CustomTooltipProps
    const data = payload[0].payload;

    return (
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm p-3 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 min-w-37.5">
        {/* Header Kategori */}
        <p className="text-sm font-bold text-gray-900 dark:text-white mb-2 pb-1 border-b border-gray-100 dark:border-gray-700">
          {label}
        </p>

        <div className="space-y-1.5">
          {/* Info Jumlah */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: data.color }}
              />
              <span className="text-gray-600 dark:text-gray-300">
                Total Accounts:
              </span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-sm">
              {data.value}
            </span>
          </div>

          {/* Info Persentase */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400 pl-4">
              Alocation:
            </span>
            <span className="font-bold text-blue-600 dark:text-blue-400">
              {data.percentage}%
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function ProfileChart({ categoryData, totalAccounts }: Props) {
  // Palet Warna Kategori
  const CATEGORY_COLORS: Record<string, string> = {
    Finance: "#10b981", // Emerald-500 (Uang/Aset)
    Social: "#0ea5e9", // Sky-500 (Konektivitas)
    Game: "#a855f7", // Purple-500 (Fantasi/Kreatif)
    Entertainment: "#f43f5e", // Rose-500 (Gairah/Media)
    Education: "#f59e0b", // Amber-500 (Pencerahan/Ilmu)
    Work: "#f97316", // Orange-500 (Energi/Aktivitas)
    Business: "#4f46e5", // Indigo-600 (Profesional/Formal)
    Other: "#94a3b8", // Slate-400 (Netral)
  };

  const DEFAULT_COLOR = "#94a3b8"; // Slate (fallback)

  // 3. Transformasi Data
  const data: ChartDataPoint[] = Object.entries(categoryData).map(
    ([name, value]) => {
      const percentage =
        totalAccounts > 0 ? ((value / totalAccounts) * 100).toFixed(1) : "0";

      return {
        name,
        value,
        percentage,
        color: CATEGORY_COLORS[name] || DEFAULT_COLOR,
      };
    }
  );

  // 4. Handle State Kosong
  if (data.length === 0) {
    return (
      <div className="w-full h-61 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-900/50">
        <p className="text-sm">Data Not Found</p>
      </div>
    );
  }

  // 5. Render Chart
  return (
    <div className="w-full h-61">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#e5e7eb"
            strokeOpacity={0.5}
          />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            allowDecimals={false}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "transparent" }}
          />

          <Bar
            dataKey="value"
            radius={[6, 6, 0, 0]}
            barSize={50}
            animationDuration={1000}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
