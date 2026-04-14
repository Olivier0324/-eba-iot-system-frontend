// src/pages/dashboard/Analytics.jsx
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
  Activity,
  Sprout,
  Waves,
  Thermometer,
  Droplets,
  Wind,
} from "lucide-react";
import {
  useGetAllSensorDataQuery,
  useGetAlertStatisticsQuery,
  useGetActiveAlertsQuery,
} from "../../services/api";
import { format, subDays } from "date-fns";
import Pagination from "../../components/common/Pagination";
import FilterPills from "../../components/common/FilterPills";
import DateRangeFilterBar from "../../components/common/DateRangeFilterBar";

const CO2_CHART_LABEL = "CO\u2082 (ppm)";

const ANALYTICS_PERIOD_OPTIONS = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
];

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
  const { data: activeAlertsData } = useGetActiveAlertsQuery();

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

  const isValidNumber = (value) =>
    value !== null && value !== undefined && value !== "" && !Number.isNaN(Number(value));

  const hasCompleteReading = (reading) =>
    isValidNumber(reading?.temperature) &&
    isValidNumber(reading?.humidity) &&
    isValidNumber(reading?.co2_ppm) &&
    isValidNumber(reading?.soil_moisture_percent) &&
    isValidNumber(reading?.water_level_percent);

  // Filter data by custom date range (when set, this overrides the 7/30/90 window)
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

  const filterDataByPeriod = (data) => {
    if (!data?.length) return data;
    if (startDate || endDate) return data;
    const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
    const cutoff = subDays(new Date(), days);
    return data.filter((item) => new Date(item.timestamp) >= cutoff);
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
    setCurrentPage(0);
  }, [period, startDate, endDate]);

  useEffect(() => {
    if (sensorData && Array.isArray(sensorData)) {
      const filtered = filterDataByPeriod(filterDataByDate(sensorData));
      const completeReadings = filtered.filter(hasCompleteReading);
      setFilteredData(completeReadings);

      // Calculate stats from filtered data
      const stats = calculateStatsFromData(completeReadings);
      setCalculatedStats(stats);

      // Limit data for charts (max 100 points for performance)
      const maxPoints = 100;
      const step = Math.max(1, Math.floor(completeReadings.length / maxPoints));
      const sampledData = completeReadings.filter((_, index) => index % step === 0);

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
    (() => {
      const parsedFromStats = Number(
        alertStats?.activeAlerts ??
          alertStats?.active ??
          alertStats?.activeCount ??
          alertStats?.counts?.active ??
          alertStats?.alerts?.active,
      );
      const activeFallback = Array.isArray(activeAlertsData)
        ? activeAlertsData.length
        : Number(activeAlertsData?.totalItems ?? activeAlertsData?.count ?? 0);
      const activeAlertsCount = Number.isFinite(parsedFromStats)
        ? parsedFromStats
        : activeFallback;
      return {
        id: "active-alerts",
        label: "Active Alerts",
        value: activeAlertsCount,
        unit: "",
        icon: Activity,
        color: activeAlertsCount > 0 ? "text-red-500" : "text-green-500",
      };
    })(),
    {
      id: "avg-temp",
      label: "Avg Temperature",
      value: calculatedStats.avgTemp || "--",
      unit: "°C",
      icon: Thermometer,
      color: "text-red-500",
    },
    {
      id: "avg-humidity",
      label: "Avg Humidity",
      value: calculatedStats.avgHumidity || "--",
      unit: "%",
      icon: Droplets,
      color: "text-blue-500",
    },
    {
      id: "max-co2",
      label: (
        <>
          Max CO<sub>2</sub>
        </>
      ),
      value: calculatedStats.maxCO2 || "--",
      unit: "ppm",
      icon: Wind,
      color: "text-teal-500",
    },
    {
      id: "avg-soil",
      label: "Avg Soil Moisture",
      value: formatDisplayValue(
        calculatedStats.avgSoil,
        calculatedStats.hasSoilData,
      ),
      unit: "%",
      icon: Sprout,
      color: "text-yellow-600",
    },
    {
      id: "avg-water",
      label: "Avg Water Level",
      value: formatDisplayValue(
        calculatedStats.avgWater,
        calculatedStats.hasWaterData,
      ),
      unit: "%",
      icon: Waves,
      color: "text-blue-600",
    },
  ];

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
              if (context.dataset.label.includes("\u2082")) label += " ppm";
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

  const co2ChartData = {
    labels: chartData1.labels,
    datasets: [
      {
        label: CO2_CHART_LABEL,
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
        title: { display: true, text: CO2_CHART_LABEL, font: { size: 10 } },
      },
    },
  };

  const offset = currentPage * itemsPerPage;
  const paginatedData = filteredData.slice(offset, offset + itemsPerPage);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  const clearDateFilter = () => {
    setStartDate(null);
    setEndDate(null);
  };

  if (sensorLoading && filteredData.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-eco-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Loading analytics data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Analytics
        </h1>
        <FilterPills
          ariaLabel="Statistics window"
          options={ANALYTICS_PERIOD_OPTIONS}
          value={period}
          onChange={setPeriod}
          className="w-full sm:w-auto"
        />
      </div>

      <DateRangeFilterBar
        startDate={startDate}
        endDate={endDate}
        onStartChange={setStartDate}
        onEndChange={setEndDate}
        onClear={clearDateFilter}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statsCards.map((stat) => (
          <div
            key={stat.id}
            className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon size={18} className={stat.color} />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {stat.label}
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

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          CO<sub>2</sub> levels (ppm)
        </h2>
        <div className="h-80">
          <Line data={co2ChartData} options={co2Options} />
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
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-sm text-center text-gray-500 dark:text-gray-400"
                  >
                    No complete sensor readings available
                  </td>
                </tr>
              ) : (
                paginatedData.map((reading, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {format(new Date(reading.timestamp), "MM/dd/yyyy HH:mm:ss")}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {`${Number(reading.temperature).toFixed(1)}°C`}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {`${Number(reading.humidity).toFixed(1)}%`}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {`${Number(reading.co2_ppm)} ppm`}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {`${Number(reading.soil_moisture_percent)}%`}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {`${Number(reading.water_level_percent)}%`}
                    </td>
                  </tr>
                ))
              )}
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
