// src/pages/dashboard/Sensors.jsx
import React, { useState, useEffect, useMemo } from "react";
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
  RefreshCw,
  Sprout,
  Waves,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  useGetAllSensorDataQuery,
  useLazyGetAllSensorDataQuery,
} from "../../services/api";
import { format } from "date-fns";
import Pagination from "../../components/common/Pagination";
import FilterPills from "../../components/common/FilterPills";

/** Chart.js label (canvas text); Unicode subscript ₂ renders reliably. */
const CO2_CHART_LABEL = "CO\u2082 (ppm)";

function escapeCsvCell(value) {
  if (value === null || value === undefined || value === "") return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

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
  const [fetchSensorExport] = useLazyGetAllSensorDataQuery();
  const [sensorReadings, setSensorReadings] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    if (sensorData && Array.isArray(sensorData)) {
      // Keep every API row (export + table); sort oldest → newest for stable CSV/charts.
      const sorted = [...sensorData].sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
      );
      setSensorReadings(sorted);
    } else {
      setSensorReadings([]);
    }
  }, [sensorData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const metrics = [
    {
      key: "temperature",
      label: "Temperature (°C)",
      pillLabel: "Temperature",
      color: "#2E7D32",
      icon: Thermometer,
    },
    {
      key: "humidity",
      label: "Humidity (%)",
      pillLabel: "Humidity",
      color: "#2E6B9E",
      icon: Droplets,
    },
    {
      key: "co2_ppm",
      label: CO2_CHART_LABEL,
      pillLabel: "CO\u2082",
      color: "#20B2AA",
      icon: Wind,
    },
    {
      key: "soil_moisture_percent",
      label: "Soil Moisture (%)",
      pillLabel: "Soil",
      color: "#D4A017",
      icon: Sprout,
    },
    {
      key: "water_level_percent",
      label: "Water Level (%)",
      pillLabel: "Water",
      color: "#1E88E5",
      icon: Waves,
    },
  ];

  const metricPillOptions = [
    { value: "all", label: "All metrics" },
    ...metrics.map((m) => ({ value: m.key, label: m.pillLabel })),
  ];

  const validForChart = useMemo(
    () => sensorReadings.slice(-100),
    [sensorReadings],
  );
  const labels = validForChart.map((d) =>
    format(new Date(d.timestamp), "MM/dd HH:mm")
  );

  const chartData = {
    labels,
    datasets:
      selectedMetric === "all"
        ? metrics.map((metric) => ({
            label: metric.label,
            data: validForChart.map((d) => d[metric.key] ?? 0),
            borderColor: metric.color,
            backgroundColor: `${metric.color}20`,
            tension: 0.4,
            fill: false,
            pointRadius: 1,
          }))
        : [
            {
              label: metrics.find((m) => m.key === selectedMetric)?.label,
              data: validForChart.map((d) => d[selectedMetric] ?? 0),
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

  const sortByTimestamp = (rows) =>
    [...rows].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const exportCSV = async () => {
    setIsExporting(true);
    let rowsSource = sensorReadings;
    try {
      // Request a large page from the API when supported so the CSV is not capped by the default list size.
      const bulk = await fetchSensorExport({ limit: 100000 }).unwrap();
      if (Array.isArray(bulk) && bulk.length >= rowsSource.length) {
        rowsSource = sortByTimestamp(bulk);
      }
    } catch {
      rowsSource = sensorReadings;
    } finally {
      setIsExporting(false);
    }

    if (!rowsSource.length) {
      toast.error("No sensor rows to export.");
      return;
    }

    const headers = [
      "Timestamp",
      "Temperature_C",
      "Humidity_pct",
      "CO2_ppm",
      "Soil_Moisture_pct",
      "Water_Level_pct",
    ];
    const rows = rowsSource.map((r) => [
      format(new Date(r.timestamp), "yyyy-MM-dd HH:mm:ss"),
      r.temperature != null && r.temperature !== "" ? r.temperature : "",
      r.humidity != null && r.humidity !== "" ? r.humidity : "",
      r.co2_ppm != null && r.co2_ppm !== "" ? r.co2_ppm : "",
      r.soil_moisture_percent != null && r.soil_moisture_percent !== ""
        ? r.soil_moisture_percent
        : "",
      r.water_level_percent != null && r.water_level_percent !== ""
        ? r.water_level_percent
        : "",
    ]);
    const csvContent = [
      headers.map(escapeCsvCell).join(","),
      ...rows.map((row) => row.map(escapeCsvCell).join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sensor_data_${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const offset = currentPage * itemsPerPage;
  const paginatedReadings = sensorReadings.slice(offset, offset + itemsPerPage);
  const totalPages = Math.ceil(sensorReadings.length / itemsPerPage);

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Sensor Data
        </h1>
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl px-4 py-2 border border-gray-200 dark:border-gray-700 disabled:opacity-50"
          >
            <RefreshCw
              size={18}
              className={isRefreshing ? "animate-spin" : ""}
            />
            <span className="text-sm">{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
          <button
            onClick={() => void exportCSV()}
            disabled={!sensorReadings.length || isExporting}
            className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl px-4 py-2 border border-gray-200 dark:border-gray-700 disabled:opacity-50"
          >
            <Download size={18} />
            <span className="text-sm">
              {isExporting ? "Exporting…" : "Export CSV"}
            </span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="mb-6 overflow-x-auto pb-1 -mb-1">
          <FilterPills
            ariaLabel="Sensor metric"
            options={metricPillOptions}
            value={selectedMetric}
            onChange={setSelectedMetric}
            className="min-w-min"
          />
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
          <div className="h-96 flex items-center justify-center text-gray-500 dark:text-gray-400">
            No sensor data available
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Historical Data
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
              {paginatedReadings.map((reading, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {format(new Date(reading.timestamp), "MM/dd/yyyy HH:mm:ss")}
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
          {sensorReadings.length === 0 && (
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
          totalItems={sensorReadings.length}
        />
      </div>
    </div>
  );
}

export default Sensors;