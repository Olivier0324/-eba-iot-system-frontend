// src/pages/dashboard/Analytics.jsx
import React, { useState, useEffect } from "react";
import { Line, Bar } from "react-chartjs-2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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
  Sprout,
  Waves,
  Thermometer,
  Droplets,
  Wind,
  Calendar,
} from "lucide-react";
import {
  useGetAllSensorDataQuery,
  useGetSensorStatsQuery,
  useGetAlertStatisticsQuery,
} from "../../services/api";
import { format } from "date-fns";
import Pagination from "../../components/common/Pagination";

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
  const [currentPage, setCurrentPage] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const itemsPerPage = 10;

  const { data: sensorData, isLoading: sensorLoading } =
    useGetAllSensorDataQuery();
  const { data: alertStats } = useGetAlertStatisticsQuery({
    days: period === "7d" ? 7 : period === "30d" ? 30 : 90,
  });

  const [chartData1, setChartData1] = useState({ labels: [], datasets: [] });
  const [chartData2, setChartData2] = useState({ labels: [], datasets: [] });
  const [filteredData, setFilteredData] = useState([]);
  const [calculatedStats, setCalculatedStats] = useState({
    avgTemp: 0,
    avgHumidity: 0,
    maxCO2: 0,
    avgSoil: 0,
    avgWater: 0,
    minTemp: 0,
    maxTemp: 0,
    hasSoilData: false,
    hasWaterData: false,
  });

  // Filter data by date range
  const filterDataByDate = (data) => {
    if (!startDate && !endDate) return data;
    return data.filter((item) => {
      const itemDate = new Date(item.timestamp);
      if (startDate && endDate) {
        return itemDate >= startDate && itemDate <= endDate;
      }
      if (startDate) return itemDate >= startDate;
      if (endDate) return itemDate <= endDate;
      return true;
    });
  };

  // Calculate stats from actual data
  const calculateStatsFromData = (data) => {
    if (!data || data.length === 0) {
      return {
        avgTemp: 0,
        avgHumidity: 0,
        maxCO2: 0,
        avgSoil: 0,
        avgWater: 0,
        minTemp: 0,
        maxTemp: 0,
        hasSoilData: false,
        hasWaterData: false,
      };
    }

    const temps = data
      .map((d) => d.temperature)
      .filter((v) => v != null && !isNaN(v));
    const humidities = data
      .map((d) => d.humidity)
      .filter((v) => v != null && !isNaN(v));
    const co2s = data
      .map((d) => d.co2_ppm)
      .filter((v) => v != null && !isNaN(v));
    // Include 0 values for soil and water (they are valid readings)
    const soils = data
      .map((d) => d.soil_moisture_percent)
      .filter((v) => v != null && !isNaN(v));
    const waters = data
      .map((d) => d.water_level_percent)
      .filter((v) => v != null && !isNaN(v));

    // Check if there are any non-zero soil/water readings (for display purposes)
    const nonZeroSoils = soils.filter((v) => v > 0);
    const nonZeroWaters = waters.filter((v) => v > 0);

    return {
      avgTemp:
        temps.length > 0
          ? (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1)
          : 0,
      avgHumidity:
        humidities.length > 0
          ? (humidities.reduce((a, b) => a + b, 0) / humidities.length).toFixed(
              1,
            )
          : 0,
      maxCO2: co2s.length > 0 ? Math.max(...co2s) : 0,
      avgSoil:
        soils.length > 0
          ? (soils.reduce((a, b) => a + b, 0) / soils.length).toFixed(1)
          : 0,
      avgWater:
        waters.length > 0
          ? (waters.reduce((a, b) => a + b, 0) / waters.length).toFixed(1)
          : 0,
      minTemp: temps.length > 0 ? Math.min(...temps).toFixed(1) : 0,
      maxTemp: temps.length > 0 ? Math.max(...temps).toFixed(1) : 0,
      hasSoilData: nonZeroSoils.length > 0,
      hasWaterData: nonZeroWaters.length > 0,
    };
  };

  useEffect(() => {
    if (sensorData && Array.isArray(sensorData)) {
      const filtered = filterDataByDate(sensorData);
      setFilteredData(filtered);

      // Calculate stats from filtered data
      const stats = calculateStatsFromData(filtered);
      setCalculatedStats(stats);

      // Limit data for charts (max 100 points for performance)
      const maxPoints = 100;
      const step = Math.max(1, Math.floor(filtered.length / maxPoints));
      const sampledData = filtered.filter((_, index) => index % step === 0);

      const labels = sampledData.map((d) =>
        format(new Date(d.timestamp), "MM/dd HH:mm"),
      );

      setChartData1({
        labels,
        datasets: [
          {
            label: "Temperature (°C)",
            data: sampledData.map((d) => d.temperature ?? 0),
            borderColor: "#FF6B6B",
            backgroundColor: "rgba(255, 107, 107, 0.1)",
            tension: 0.4,
            fill: true,
          },
          {
            label: "Humidity (%)",
            data: sampledData.map((d) => d.humidity ?? 0),
            borderColor: "#4ECDC4",
            backgroundColor: "rgba(78, 205, 196, 0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      });

      setChartData2({
        labels,
        datasets: [
          {
            label: "Soil Moisture (%)",
            data: sampledData.map((d) => d.soil_moisture_percent ?? 0),
            borderColor: "#D4A017",
            backgroundColor: "rgba(212, 160, 23, 0.1)",
            tension: 0.4,
            fill: true,
          },
          {
            label: "Water Level (%)",
            data: sampledData.map((d) => d.water_level_percent ?? 0),
            borderColor: "#1E88E5",
            backgroundColor: "rgba(30, 136, 229, 0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      });
    }
  }, [sensorData, period, startDate, endDate]);

  // Format display value for soil/water (show actual value even if 0)
  const formatDisplayValue = (value, hasData) => {
    if (value === 0 || value === "0") return "0";
    if (value === "--") return "--";
    return value;
  };

  const statsCards = [
    {
      name: "Avg Temperature",
      value: calculatedStats.avgTemp || "--",
      unit: "°C",
      icon: Thermometer,
      color: "text-red-500",
    },
    {
      name: "Avg Humidity",
      value: calculatedStats.avgHumidity || "--",
      unit: "%",
      icon: Droplets,
      color: "text-blue-500",
    },
    {
      name: "Max CO₂",
      value: calculatedStats.maxCO2 || "--",
      unit: "ppm",
      icon: Wind,
      color: "text-teal-500",
    },
    {
      name: "Avg Soil Moisture",
      value: formatDisplayValue(
        calculatedStats.avgSoil,
        calculatedStats.hasSoilData,
      ),
      unit: "%",
      icon: Sprout,
      color: "text-yellow-600",
    },
    {
      name: "Avg Water Level",
      value: formatDisplayValue(
        calculatedStats.avgWater,
        calculatedStats.hasWaterData,
      ),
      unit: "%",
      icon: Waves,
      color: "text-blue-600",
    },
    {
      name: "Active Alerts",
      value: alertStats?.activeAlerts || 0,
      unit: "",
      icon: Activity,
      color:
        (alertStats?.activeAlerts || 0) > 0 ? "text-red-500" : "text-green-500",
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
              if (context.dataset.label.includes("CO₂")) label += " ppm";
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
          maxTicksLimit: 15,
        },
      },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "top" } },
  };

  const co2ChartData = {
    labels: chartData1.labels,
    datasets: [
      {
        label: "CO₂ (ppm)",
        data: chartData1.labels.map((_, idx) => {
          const step = Math.max(
            1,
            Math.floor(filteredData.length / chartData1.labels.length),
          );
          const index = idx * step;
          return filteredData[index]?.co2_ppm ?? 0;
        }),
        borderColor: "#45B7D1",
        backgroundColor: "rgba(69, 183, 209, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const co2Options = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      y: {
        ...chartOptions.scales.y,
        title: { display: true, text: "CO₂ (ppm)", font: { size: 10 } },
      },
    },
  };

  const offset = currentPage * itemsPerPage;
  const paginatedData = filteredData.slice(offset, offset + itemsPerPage);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const clearDateFilter = () => {
    setStartDate(null);
    setEndDate(null);
  };

  if (sensorLoading && filteredData.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-eco-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading analytics data...</p>
      </div>
    );
  }

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statsCards.map((stat) => (
          <div
            key={stat.name}
            className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon size={18} className={stat.color} />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {stat.name}
              </p>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {stat.value}
              {stat.unit && stat.value !== "--" && (
                <span className="text-xs font-normal text-gray-500 ml-1">
                  {stat.unit}
                </span>
              )}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Temperature & Humidity Trends
          </h2>
          <div className="h-80">
            <Line data={chartData1} options={chartOptions} />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Soil Moisture & Water Level
          </h2>
          <div className="h-80">
            <Line data={chartData2} options={chartOptions} />
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">
            Note: Values of 0 indicate no data or sensors not active
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            CO₂ Levels (ppm)
          </h2>
          <div className="h-80">
            <Line data={co2ChartData} options={co2Options} />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Alerts by Severity
          </h2>
          <div className="h-80">
            <Bar data={severityData} options={barOptions} />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Detailed Data Log
        </h2>
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
                  CO₂
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
              {paginatedData.map((reading, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {format(new Date(reading.timestamp), "MM/dd/yyyy HH:mm:ss")}
                  </td>
                  <td className="px-4 py-3 text-sm">{reading.temperature}°C</td>
                  <td className="px-4 py-3 text-sm">{reading.humidity}%</td>
                  <td className="px-4 py-3 text-sm">{reading.co2_ppm} ppm</td>
                  <td className="px-4 py-3 text-sm">
                    {reading.soil_moisture_percent !== undefined &&
                    reading.soil_moisture_percent !== null
                      ? `${reading.soil_moisture_percent}%`
                      : "N/A"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {reading.water_level_percent !== undefined &&
                    reading.water_level_percent !== null
                      ? `${reading.water_level_percent}%`
                      : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageClick}
          itemsPerPage={itemsPerPage}
          totalItems={filteredData.length}
        />
      </div>
    </div>
  );
}

export default Analytics;
