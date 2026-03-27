// src/pages/dashboard/Overview.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
} from "chart.js";
import {
  Thermometer,
  Droplets,
  Wind,
  Activity,
  TrendingUp,
  Eye,
  Database,
} from "lucide-react";
import {
  useGetAllSensorDataQuery,
  useGetSensorStatsQuery,
} from "../../services/api";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
);

function Overview() {
  const { data: sensorData, isLoading: sensorLoading } =
    useGetAllSensorDataQuery();
  const { data: statsData, isLoading: statsLoading } = useGetSensorStatsQuery();
  const [recentReadings, setRecentReadings] = useState([]);
  const [latestReading, setLatestReading] = useState(null);

  useEffect(() => {
    if (sensorData && Array.isArray(sensorData)) {
      setRecentReadings(sensorData.slice(0, 30));
      setLatestReading(sensorData[0]);
    }
  }, [sensorData]);

  // Stats from API or calculated from data
  const stats = [
    {
      name: "Temperature",
      value: latestReading?.temperature ?? "--",
      unit: "°C",
      avg: statsData?.[0]?.avgTemperature?.toFixed(1) || "--",
      icon: Thermometer,
      color: "from-eco-500 to-eco-600",
      bg: "bg-eco-50 dark:bg-eco-900/20",
    },
    {
      name: "Humidity",
      value: latestReading?.humidity ?? "--",
      unit: "%",
      avg: statsData?.[0]?.avgHumidity?.toFixed(1) || "--",
      icon: Droplets,
      color: "from-ocean-500 to-ocean-600",
      bg: "bg-ocean-50 dark:bg-ocean-900/20",
    },
    {
      name: "CO₂",
      value: latestReading?.co2_ppm ?? "--",
      unit: "ppm",
      avg: statsData?.[0]?.maxCO2 || "--",
      icon: Wind,
      color: "from-teal-500 to-teal-600",
      bg: "bg-teal-50 dark:bg-teal-900/20",
    },
    {
      name: "Air Quality",
      value:
        latestReading?.co2_ppm > 1000
          ? "Poor"
          : latestReading?.co2_ppm > 800
            ? "Moderate"
            : "Good",
      unit: "",
      icon: Activity,
      color:
        latestReading?.co2_ppm > 1000
          ? "from-alert-500 to-alert-600"
          : "from-eco-500 to-eco-600",
      bg: "bg-gray-50 dark:bg-gray-800",
    },
  ];

  // Prepare chart data
  const chartLabels = recentReadings.map((d) =>
    new Date(d.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  );
  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Temperature (°C)",
        data: recentReadings.map((d) => d.temperature),
        borderColor: "#2E7D32",
        backgroundColor: "rgba(46, 125, 50, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 2,
        pointHoverRadius: 5,
      },
      {
        label: "Humidity (%)",
        data: recentReadings.map((d) => d.humidity),
        borderColor: "#2E6B9E",
        backgroundColor: "rgba(46, 107, 158, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 2,
        pointHoverRadius: 5,
      },
    ],
  };

  // CO₂ Distribution for pie chart
  const co2Levels = recentReadings
    .map((d) => d.co2_ppm)
    .filter((v) => v != null);
  const good = co2Levels.filter((v) => v < 800).length;
  const moderate = co2Levels.filter((v) => v >= 800 && v < 1000).length;
  const elevated = co2Levels.filter((v) => v >= 1000 && v < 1500).length;
  const high = co2Levels.filter((v) => v >= 1500).length;

  const pieData = {
    labels: [
      "Good (< 800 ppm)",
      "Moderate (800-1000 ppm)",
      "Elevated (1000-1500 ppm)",
      "High (> 1500 ppm)",
    ],
    datasets: [
      {
        data: [good, moderate, elevated, high],
        backgroundColor: ["#28A745", "#FFC107", "#FD7E14", "#DC3545"],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      y: { beginAtZero: false, grid: { color: "#E0E0E0" } },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          autoSkip: true,
          maxTicksLimit: 10,
        },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage =
              total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  if (sensorLoading && recentReadings.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-eco-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading sensor data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-linear-to-br from-eco-500 to-ocean-500 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3">
          <Eye className="h-8 w-8" />
          <div>
            <h1 className="text-2xl font-bold">Environmental Dashboard</h1>
            <p className="text-white/80 mt-1">
              Real-time monitoring of your ecosystem
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className={`rounded-2xl p-5 ${stat.bg} border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md`}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`p-2 rounded-xl bg-linear-to-br ${stat.color} text-white`}
              >
                <stat.icon size={20} />
              </div>
              {stat.avg !== "--" && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Avg: {stat.avg}
                  {stat.unit}
                </div>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stat.value}
              {stat.unit && (
                <span className="text-sm font-normal text-gray-500">
                  {stat.unit}
                </span>
              )}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {stat.name}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Environmental Trends
          </h2>
          {recentReadings.length > 0 ? (
            <div className="h-80">
              <Line data={chartData} options={chartOptions} />
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </div>

        {/* Pie Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            CO₂ Distribution
          </h2>
          {co2Levels.length > 0 ? (
            <div className="h-64 flex items-center justify-center">
              <Doughnut data={pieData} options={pieOptions} />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No CO₂ data available
            </div>
          )}
        </div>
      </div>

      {/* Recent Readings Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Readings
          </h2>
          <Database className="h-5 w-5 text-gray-400" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Temp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Humidity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  CO₂
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Soil
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Water
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentReadings.slice(0, 10).map((reading, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {new Date(reading.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {reading.temperature}°C
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {reading.humidity}%
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {reading.co2_ppm} ppm
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {reading.soil_moisture_percent || 0}%
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {reading.water_level_percent || 0}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentReadings.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No sensor data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Overview;
