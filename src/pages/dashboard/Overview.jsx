// src/pages/dashboard/Overview.jsx
import React, { useState, useEffect } from "react";
import { Line, Doughnut } from "react-chartjs-2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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
  Eye,
  Database,
  Sprout,
  Waves,
  Calendar,
} from "lucide-react";
import { useGetAllSensorDataQuery } from "../../services/api";
import Pagination from "../../components/common/Pagination";

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
  const [recentReadings, setRecentReadings] = useState([]);
  const [latestReading, setLatestReading] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const itemsPerPage = 10;

  // Filter data by date range
  const filterDataByDate = (data) => {
    if (!startDate && !endDate) return data;
    return data.filter((item) => {
      const itemDate = new Date(item.timestamp);
      if (startDate && endDate) {
        return itemDate >= startDate && itemDate <= endDate;
      }
      if (startDate) {
        return itemDate >= startDate;
      }
      if (endDate) {
        return itemDate <= endDate;
      }
      return true;
    });
  };

  useEffect(() => {
    if (sensorData && Array.isArray(sensorData)) {
      const filteredData = filterDataByDate(sensorData);
      setRecentReadings(filteredData.slice(0, 100));
      setLatestReading(filteredData[0]);
      setCurrentPage(0);
    }
  }, [sensorData, startDate, endDate]);

  // Calculate averages (handle NaN)
  const calculateAvg = (values) => {
    const validValues = values.filter((v) => v != null && !isNaN(v) && v !== 0);
    if (validValues.length === 0) return "--";
    return (
      validValues.reduce((sum, d) => sum + d, 0) / validValues.length
    ).toFixed(1);
  };

  const avgTemp = calculateAvg(recentReadings.map((d) => d.temperature));
  const avgHumidity = calculateAvg(recentReadings.map((d) => d.humidity));
  const avgCO2 =
    recentReadings.length > 0
      ? Math.round(calculateAvg(recentReadings.map((d) => d.co2_ppm)))
      : "--";
  const avgSoil = calculateAvg(
    recentReadings.map((d) => d.soil_moisture_percent),
  );
  const avgWater = calculateAvg(
    recentReadings.map((d) => d.water_level_percent),
  );

  const stats = [
    {
      name: "Temperature",
      value: latestReading?.temperature ?? "--",
      avg: avgTemp,
      unit: "°C",
      icon: Thermometer,
      color: "from-eco-500 to-eco-600",
      bg: "bg-eco-50 dark:bg-eco-900/20",
    },
    {
      name: "Humidity",
      value: latestReading?.humidity ?? "--",
      avg: avgHumidity,
      unit: "%",
      icon: Droplets,
      color: "from-ocean-500 to-ocean-600",
      bg: "bg-ocean-50 dark:bg-ocean-900/20",
    },
    {
      name: "CO₂",
      value: latestReading?.co2_ppm ?? "--",
      avg: avgCO2,
      unit: "ppm",
      icon: Wind,
      color: "from-teal-500 to-teal-600",
      bg: "bg-teal-50 dark:bg-teal-900/20",
    },
    {
      name: "Soil Moisture",
      value: latestReading?.soil_moisture_percent ?? "--",
      avg: avgSoil,
      unit: "%",
      icon: Sprout,
      color: "from-yellow-600 to-yellow-700",
      bg: "bg-yellow-50 dark:bg-yellow-900/20",
    },
    {
      name: "Water Level",
      value: latestReading?.water_level_percent ?? "--",
      avg: avgWater,
      unit: "%",
      icon: Waves,
      color: "from-blue-500 to-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      name: "Air Quality",
      value:
        latestReading?.co2_ppm > 1000
          ? "Poor"
          : latestReading?.co2_ppm > 800
            ? "Moderate"
            : "Good",
      avg: "",
      unit: "",
      icon: Activity,
      color:
        latestReading?.co2_ppm > 1000
          ? "from-alert-500 to-alert-600"
          : "from-eco-500 to-eco-600",
      bg: "bg-gray-50 dark:bg-gray-800",
    },
  ];

  // Prepare chart data - NOW INCLUDES SOIL AND WATER
  const validReadings = recentReadings.filter(
    (d) => d.temperature != null && d.humidity != null,
  );

  const chartLabels = validReadings.slice(0, 30).map((d) =>
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
        data: validReadings.slice(0, 30).map((d) => d.temperature ?? 0),
        borderColor: "#2E7D32",
        backgroundColor: "rgba(46, 125, 50, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 2,
        pointHoverRadius: 5,
      },
      {
        label: "Humidity (%)",
        data: validReadings.slice(0, 30).map((d) => d.humidity ?? 0),
        borderColor: "#2E6B9E",
        backgroundColor: "rgba(46, 107, 158, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 2,
        pointHoverRadius: 5,
      },
      {
        label: "Soil Moisture (%)",
        data: validReadings
          .slice(0, 30)
          .map((d) => d.soil_moisture_percent ?? 0),
        borderColor: "#D4A017",
        backgroundColor: "rgba(212, 160, 23, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 2,
        pointHoverRadius: 5,
      },
      {
        label: "Water Level (%)",
        data: validReadings.slice(0, 30).map((d) => d.water_level_percent ?? 0),
        borderColor: "#1E88E5",
        backgroundColor: "rgba(30, 136, 229, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 2,
        pointHoverRadius: 5,
      },
    ],
  };

  // CO₂ Distribution for pie chart (handle NaN)
  const co2Levels = recentReadings
    .map((d) => d.co2_ppm)
    .filter((v) => v != null && !isNaN(v) && v > 0);
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
      legend: { position: "top", labels: { font: { size: 11 } } },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            let value = context.raw;
            if (value !== undefined && value !== null && !isNaN(value)) {
              label += `: ${value.toFixed(1)}`;
              if (context.dataset.label.includes("Temperature")) label += "°C";
              if (context.dataset.label.includes("Humidity")) label += "%";
              if (context.dataset.label.includes("Soil")) label += "%";
              if (context.dataset.label.includes("Water")) label += "%";
            } else {
              label += ": No data";
            }
            return label;
          },
        },
      },
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
      legend: { position: "bottom", labels: { font: { size: 10 } } },
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

  const offset = currentPage * itemsPerPage;
  const paginatedReadings = validReadings.slice(offset, offset + itemsPerPage);
  const totalPages = Math.ceil(validReadings.length / itemsPerPage);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  // Clear date filter
  const clearDateFilter = () => {
    setStartDate(null);
    setEndDate(null);
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
      <div className="bg-gradient-to-r from-eco-500 to-ocean-500 rounded-2xl p-6 text-white">
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

      {/* Date Filter */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
        <Calendar className="h-5 w-5 text-gray-500" />
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          placeholderText="Start Date"
          className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
        />
        <span className="text-gray-500">to</span>
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          placeholderText="End Date"
          className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
        />
        {(startDate || endDate) && (
          <button
            onClick={clearDateFilter}
            className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 text-sm"
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* Stats Cards - 6 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className={`rounded-2xl p-4 ${stat.bg} border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md`}
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className={`p-1.5 rounded-xl bg-gradient-to-br ${stat.color} text-white`}
              >
                <stat.icon size={16} />
              </div>
              {stat.avg !== "--" && stat.avg !== "" && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Avg: {stat.avg}
                  {stat.unit}
                </div>
              )}
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {stat.value}
              {stat.unit && (
                <span className="text-xs font-normal text-gray-500">
                  {stat.unit}
                </span>
              )}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {stat.name}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Environmental Trends
          </h2>
          {validReadings.length > 0 ? (
            <div className="h-96">
              <Line data={chartData} options={chartOptions} />
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              No valid data available
            </div>
          )}
        </div>

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

      {/* Recent Readings Table with Pagination */}
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
                  Date & Time
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
              {paginatedReadings.slice(0, 10).map((reading, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {new Date(reading.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm">{reading.temperature}°C</td>
                  <td className="px-6 py-4 text-sm">{reading.humidity}%</td>
                  <td className="px-6 py-4 text-sm">{reading.co2_ppm} ppm</td>
                  <td className="px-6 py-4 text-sm">
                    {reading.soil_moisture_percent || 0}%
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {reading.water_level_percent || 0}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {validReadings.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No sensor data available
            </div>
          )}
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageClick}
          itemsPerPage={itemsPerPage}
          totalItems={validReadings.length}
        />
      </div>
    </div>
  );
}

export default Overview;
