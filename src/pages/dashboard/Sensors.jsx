// src/pages/dashboard/Sensors.jsx
import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
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
} from "chart.js";
import {
  Thermometer,
  Droplets,
  Wind,
  Download,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { useGetAllSensorDataQuery } from "../../services/api";
import { format } from "date-fns";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

function Sensors() {
  const [selectedMetric, setSelectedMetric] = useState("all");
  const { data: sensorData, isLoading, refetch } = useGetAllSensorDataQuery();
  const [sensorReadings, setSensorReadings] = useState([]);

  useEffect(() => {
    if (sensorData && Array.isArray(sensorData)) {
      setSensorReadings(sensorData);
    }
  }, [sensorData]);

  const metrics = [
    {
      key: "temperature",
      label: "Temperature (°C)",
      color: "#2E7D32",
      icon: Thermometer,
    },
    {
      key: "humidity",
      label: "Humidity (%)",
      color: "#2E6B9E",
      icon: Droplets,
    },
    { key: "co2_ppm", label: "CO₂ (ppm)", color: "#20B2AA", icon: Wind },
  ];

  const labels = sensorReadings.map((d) =>
    format(new Date(d.timestamp), "MM/dd HH:mm"),
  );

  const chartData = {
    labels,
    datasets:
      selectedMetric === "all"
        ? metrics.map((metric) => ({
            label: metric.label,
            data: sensorReadings.map((d) => d[metric.key]) || [],
            borderColor: metric.color,
            backgroundColor: `${metric.color}20`,
            tension: 0.4,
            fill: false,
            pointRadius: 1,
          }))
        : [
            {
              label: metrics.find((m) => m.key === selectedMetric)?.label,
              data: sensorReadings.map((d) => d[selectedMetric]) || [],
              borderColor: "#2E7D32",
              backgroundColor: "#2E7D3220",
              tension: 0.4,
              fill: true,
              pointRadius: 2,
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
          maxTicksLimit: 15,
        },
      },
    },
  };

  const exportCSV = () => {
    const headers = [
      "Timestamp",
      "Temperature (°C)",
      "Humidity (%)",
      "CO₂ (ppm)",
      "Soil Moisture (%)",
      "Water Level (%)",
    ];
    const rows = sensorReadings.map((r) => [
      new Date(r.timestamp).toLocaleString(),
      r.temperature,
      r.humidity,
      r.co2_ppm,
      r.soil_moisture_percent || 0,
      r.water_level_percent || 0,
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sensor_data_${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Sensor Data
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl px-4 py-2 border border-gray-200 dark:border-gray-700"
          >
            <RefreshCw size={18} />
            <span className="text-sm">Refresh</span>
          </button>
          <button
            onClick={exportCSV}
            disabled={sensorReadings.length === 0}
            className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl px-4 py-2 border border-gray-200 dark:border-gray-700 disabled:opacity-50"
          >
            <Download size={18} />
            <span className="text-sm">Export CSV</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setSelectedMetric("all")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              selectedMetric === "all"
                ? "bg-eco-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
            }`}
          >
            All Metrics
          </button>
          {metrics.map((metric) => (
            <button
              key={metric.key}
              onClick={() => setSelectedMetric(metric.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                selectedMetric === metric.key
                  ? "bg-eco-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
              }`}
            >
              <metric.icon size={16} />
              {metric.label}
            </button>
          ))}
        </div>
        {isLoading ? (
          <div className="h-96 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eco-600"></div>
          </div>
        ) : sensorReadings.length > 0 ? (
          <div className="h-96">
            <Line data={chartData} options={chartOptions} />
          </div>
        ) : (
          <div className="h-96 flex items-center justify-center text-gray-500">
            No data available
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Historical Data
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Timestamp
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
              {sensorReadings.slice(0, 50).map((reading, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {format(new Date(reading.timestamp), "MM/dd/yyyy HH:mm:ss")}
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
          {sensorReadings.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No historical data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sensors;
