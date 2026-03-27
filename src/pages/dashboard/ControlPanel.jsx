// src/pages/dashboard/ControlPanel.jsx
import React, { useState } from "react";
import {
  Activity,
  Clock,
  Power,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Settings,
} from "lucide-react";
import {
  useSetIntervalMutation,
  useGetDeviceStatusQuery,
  useGetIntervalPresetsQuery,
} from "../../services/api";
import { toast } from "react-toastify";

function ControlPanel() {
  const [intervalSeconds, setIntervalSeconds] = useState(60);
  const [setInterval, { isLoading: isSetting }] = useSetIntervalMutation();
  const {
    data: deviceStatus,
    isLoading: statusLoading,
    refetch,
  } = useGetDeviceStatusQuery();
  const { data: presets } = useGetIntervalPresetsQuery();

  const handleSetInterval = async () => {
    try {
      await setInterval({ intervalSeconds }).unwrap();
      toast.success(`Interval set to ${intervalSeconds} seconds`);
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to set interval");
    }
  };

  const isDeviceOnline = deviceStatus?.status === "online";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Device Control Panel
        </h1>
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${isDeviceOnline ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"}`}
          >
            {isDeviceOnline ? (
              <CheckCircle size={14} />
            ) : (
              <AlertCircle size={14} />
            )}
            <span>
              {isDeviceOnline
                ? "Online"
                : deviceStatus?.status === "warning"
                  ? "Warning"
                  : "Offline"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interval Control */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="text-eco-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Sensor Reading Interval
            </h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Interval:{" "}
                <span className="font-bold text-eco-600">
                  {deviceStatus?.expected_interval_seconds || 60} seconds
                </span>
              </label>
              <input
                type="range"
                min="5"
                max="300"
                step="5"
                value={intervalSeconds}
                onChange={(e) => setIntervalSeconds(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>5s</span>
                <span>60s</span>
                <span>120s</span>
                <span>180s</span>
                <span>300s</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                Selected:{" "}
                <span className="font-medium text-eco-600">
                  {intervalSeconds} seconds
                </span>
              </p>
            </div>

            <button
              onClick={handleSetInterval}
              disabled={isSetting || !isDeviceOnline}
              className="w-full bg-eco-600 text-white py-2 rounded-xl hover:bg-eco-700 transition-colors disabled:opacity-50"
            >
              {isSetting ? "Updating..." : "Update Interval"}
            </button>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="text-eco-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Quick Presets
            </h2>
          </div>
          <div className="space-y-2">
            {presets?.map((preset) => (
              <button
                key={preset.seconds}
                onClick={() => setIntervalSeconds(preset.seconds)}
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {preset.name}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {preset.description}
                    </p>
                  </div>
                  <span className="text-sm text-eco-600">
                    {preset.seconds}s
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Device Information */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Device Information
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
              {deviceStatus?.status || "Unknown"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Last Reading
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {deviceStatus?.last_reading
                ? new Date(deviceStatus.last_reading).toLocaleString()
                : "No data"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Temperature
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {deviceStatus?.temperature || "--"}°C
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              CO₂ Level
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {deviceStatus?.co2_ppm || "--"} ppm
            </p>
          </div>
        </div>
        {deviceStatus?.status_message && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {deviceStatus.status_message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ControlPanel;
