// src/pages/dashboard/Analytics.jsx
import React, { useState, useEffect } from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  Download,
} from "lucide-react";
import {
  useGetAllSensorDataQuery,
  useGetSensorStatsQuery,
  useGetAlertStatisticsQuery,
} from "../../services/api";
import { format } from "date-fns";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

function Analytics() {
  const [period, setPeriod] = useState("7d");
  const { data: sensorData } = useGetAllSensorDataQuery();
  const { data: stats } = useGetSensorStatsQuery();
  const { data: alertStats } = useGetAlertStatisticsQuery({
    days: period === "7d" ? 7 : period === "30d" ? 30 : 90,
  });
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    if (sensorData && Array.isArray(sensorData)) {
      const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
      const filtered = sensorData.slice(0, days * 24);
      const labels = filtered.map((d) =>
        format(new Date(d.timestamp), "MM/dd HH:mm"),
      );

      setChartData({
        labels,
        datasets: [
          {
            label: "Temperature (°C)",
            data: filtered.map((d) => d.temperature),
            borderColor: "#FF6B6B",
            backgroundColor: "rgba(255, 107, 107, 0.1)",
            tension: 0.4,
            fill: true,
          },
          {
            label: "CO₂ (ppm) / 10",
            data: filtered.map((d) => d.co2_ppm / 10),
            borderColor: "#45B7D1",
            backgroundColor: "rgba(69, 183, 209, 0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      });
    }
  }, [sensorData, period]);

  const statsCards = [
    {
      name: "Avg Temperature",
      value: stats?.[0]?.avgTemperature?.toFixed(1) || "--",
      unit: "°C",
      change: "+2.3%",
      positive: true,
    },
    {
      name: "Avg Humidity",
      value: stats?.[0]?.avgHumidity?.toFixed(1) || "--",
      unit: "%",
      change: "-5%",
      positive: false,
    },
    {
      name: "Max CO₂",
      value: stats?.[0]?.maxCO2 || "--",
      unit: "ppm",
      change: "+8%",
      positive: false,
    },
    {
      name: "Active Alerts",
      value: alertStats?.activeAlerts || 0,
      unit: "",
      change: "-3%",
      positive: true,
    },
  ];

  const severityData = {
    labels: alertStats?.bySeverity?.map((s) => s._id) || [],
    datasets: [
      {
        label: "Alerts by Severity",
        data: alertStats?.bySeverity?.map((s) => s.count) || [],
        backgroundColor: ["#DC3545", "#FD7E14", "#FFC107", "#17A2B8"],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "top" } },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Analytics
        </h1>
        <div className="flex gap-2">
          {["7d", "30d", "90d"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                period === p
                  ? "bg-eco-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              }`}
            >
              {p === "7d" ? "7 Days" : p === "30d" ? "30 Days" : "90 Days"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => (
          <div
            key={stat.name}
            className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {stat.name}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {stat.value}
              {stat.unit}
            </p>
            <div
              className={`flex items-center mt-2 text-sm ${stat.positive ? "text-green-600" : "text-red-600"}`}
            >
              {stat.positive ? (
                <TrendingUp size={14} />
              ) : (
                <TrendingDown size={14} />
              )}
              <span className="ml-1">{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Environmental Trends
          </h2>
          <div className="h-80">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Alerts by Severity
          </h2>
          <div className="h-80">
            <Bar data={severityData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
