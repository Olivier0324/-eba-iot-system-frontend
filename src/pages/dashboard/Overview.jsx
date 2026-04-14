// src/pages/dashboard/Overview.jsx
import React, { useState, useEffect, useMemo } from "react";
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
  Database,
  Sprout,
  Waves,
} from "lucide-react";
import { useGetAllSensorDataQuery } from "../../services/api";
import Pagination from "../../components/common/Pagination";
import DateRangeFilterBar from "../../components/common/DateRangeFilterBar";

const OVERVIEW_CHART_MAX_POINTS = 200;

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
      setRecentReadings(filteredData);
      const newestFirst = [...filteredData].sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
      );
      setLatestReading(newestFirst[0] ?? null);
      setCurrentPage(0);
    }
  }, [sensorData, startDate, endDate]);

  /** Mean across all filtered rows; includes numeric 0 (important for soil/water). */
  const meanField = (rows, key) => {
    if (!rows?.length) return "--";
    const nums = rows
      .map((r) => r[key])
      .filter((v) => v != null && v !== "" && !Number.isNaN(Number(v)))
      .map(Number);
    if (!nums.length) return "--";
    return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1);
  };

  const avgTemp = meanField(recentReadings, "temperature");
  const avgHumidity = meanField(recentReadings, "humidity");
  const co2Mean = meanField(recentReadings, "co2_ppm");
  const avgCO2 =
    co2Mean === "--" ? "--" : String(Math.round(Number(co2Mean)));
  const avgSoil = meanField(recentReadings, "soil_moisture_percent");
  const avgWater = meanField(recentReadings, "water_level_percent");

  const stats = [
    {
      id: "temperature",
      name: "Temperature",
      value: latestReading?.temperature ?? "--",
      avg: avgTemp,
      unit: "°C",
      icon: Thermometer,
      color: "from-eco-500 to-eco-600",
      bg: "bg-eco-50 dark:bg-eco-900/20",
    },
    {
      id: "humidity",
      name: "Humidity",
      value: latestReading?.humidity ?? "--",
      avg: avgHumidity,
      unit: "%",
      icon: Droplets,
      color: "from-ocean-500 to-ocean-600",
      bg: "bg-ocean-50 dark:bg-ocean-900/20",
    },
    {
      id: "co2",
      name: "CO₂",
      displayName: (
        <>
          CO<sub>2</sub>
        </>
      ),
      value: latestReading?.co2_ppm ?? "--",
      avg: avgCO2,
      unit: "ppm",
      icon: Wind,
      color: "from-teal-500 to-teal-600",
      bg: "bg-teal-50 dark:bg-teal-900/20",
    },
    {
      id: "soil",
      name: "Soil Moisture",
      value: latestReading?.soil_moisture_percent ?? "--",
      avg: avgSoil,
      unit: "%",
      icon: Sprout,
      color: "from-yellow-600 to-yellow-700",
      bg: "bg-yellow-50 dark:bg-yellow-900/20",
    },
    {
      id: "water",
      name: "Water Level",
      value: latestReading?.water_level_percent ?? "--",
      avg: avgWater,
      unit: "%",
      icon: Waves,
      color: "from-blue-500 to-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      id: "air-quality",
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

  const validReadings = recentReadings.filter(
    (d) => d.temperature != null && d.humidity != null,
  );

  const offset = currentPage * itemsPerPage;
  const paginatedReadings = validReadings.slice(offset, offset + itemsPerPage);
  const totalPages = Math.ceil(validReadings.length / itemsPerPage);

  /**
   * Overview chart should reflect the whole filtered window (not just one paginated table page).
   * Keep only the latest N points for rendering speed on large datasets.
   */
  const chartReadings = useMemo(
    () => {
      const sorted = [...recentReadings].sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
      );
      return sorted.slice(-OVERVIEW_CHART_MAX_POINTS);
    },
    [recentReadings],
  );

  const chartLabels = chartReadings.map((d) =>
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
        data: chartReadings.map((d) => d.temperature ?? 0),
        borderColor: "#2E7D32",
        backgroundColor: "rgba(46, 125, 50, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 2,
        pointHoverRadius: 5,
      },
      {
        label: "Humidity (%)",
        data: chartReadings.map((d) => d.humidity ?? 0),
        borderColor: "#2E6B9E",
        backgroundColor: "rgba(46, 107, 158, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 2,
        pointHoverRadius: 5,
      },
      {
        label: "Soil Moisture (%)",
        data: chartReadings.map((d) => d.soil_moisture_percent ?? 0),
        borderColor: "#D4A017",
        backgroundColor: "rgba(212, 160, 23, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 2,
        pointHoverRadius: 5,
      },
      {
        label: "Water Level (%)",
        data: chartReadings.map((d) => d.water_level_percent ?? 0),
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

  const handlePageClick = (page) => {
    setCurrentPage(page);
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
      <div className="bg-linear-to-r from-eco-500 to-ocean-500 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold">Environmental Dashboard</h1>
            <p className="text-white/80 mt-1">
              Real-time monitoring of your ecosystem
            </p>
          </div>
        </div>
      </div>

      <DateRangeFilterBar
        startDate={startDate}
        endDate={endDate}
        onStartChange={setStartDate}
        onEndChange={setEndDate}
        onClear={clearDateFilter}
      />

      {/* Stats Cards - 6 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className={`rounded-2xl p-4 ${stat.bg} border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md`}
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className={`p-1.5 rounded-xl bg-linear-to-br ${stat.color} text-white`}
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
              {stat.displayName ?? stat.name}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Environmental Trends
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Chart covers the full filtered time window (latest{" "}
              {OVERVIEW_CHART_MAX_POINTS} points max for performance).
            </p>
          </div>
          {chartReadings.length > 0 ? (
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
            CO<sub>2</sub> distribution
          </h2>
          {co2Levels.length > 0 ? (
            <div className="h-64 flex items-center justify-center">
              <Doughnut data={pieData} options={pieOptions} />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No CO<sub>2</sub> data available
            </div>
          )}
        </div>
      </div>

      {/* Recent Readings Table with Pagination */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent readings
          </h2>
          <Database className="h-5 w-5 text-gray-400" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  Timestamp
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  Temp
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  Humidity
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  CO<sub>2</sub>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  Soil
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  Water
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedReadings.map((reading, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {new Date(reading.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {reading.temperature != null && !Number.isNaN(reading.temperature)
                      ? `${Number(reading.temperature).toFixed(1)}°C`
                      : "N/A"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {reading.humidity != null && !Number.isNaN(reading.humidity)
                      ? `${Number(reading.humidity).toFixed(1)}%`
                      : "N/A"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {reading.co2_ppm != null && !Number.isNaN(reading.co2_ppm)
                      ? `${reading.co2_ppm} ppm`
                      : "N/A"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {reading.soil_moisture_percent !== undefined &&
                    reading.soil_moisture_percent !== null
                      ? `${reading.soil_moisture_percent}%`
                      : "N/A"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {reading.water_level_percent !== undefined &&
                    reading.water_level_percent !== null
                      ? `${reading.water_level_percent}%`
                      : "N/A"}
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
