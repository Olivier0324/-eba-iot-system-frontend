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
  Zap,
  Battery,
  Gauge,
  Thermometer,
  Droplets,
  Wind,
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
    data: deviceStatusData,
    isLoading: statusLoading,
    refetch,
    error: statusError,
  } = useGetDeviceStatusQuery();
  const {
    data: presetsData,
    isLoading: presetsLoading,
    error: presetsError,
  } = useGetIntervalPresetsQuery();

  // Extract the actual data from the response
  const deviceStatus = deviceStatusData?.data || deviceStatusData;
  const presets = presetsData?.data?.presets || presetsData?.presets || [];
  const currentInterval =
    presetsData?.data?.current_interval_seconds ||
    deviceStatus?.expected_interval_seconds ||
    60;

  const handleSetInterval = async () => {
    if (!intervalSeconds || intervalSeconds < 5 || intervalSeconds > 300) {
      toast.error("Interval must be between 5 and 300 seconds");
      return;
    }

    try {
      const result = await setInterval({ intervalSeconds }).unwrap();
      toast.success(
        result?.message || `Interval set to ${intervalSeconds} seconds`,
      );
      refetch();
    } catch (error) {
      toast.error(
        error?.data?.message || error?.message || "Failed to set interval",
      );
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.info("Refreshing device status...");
  };

  const isDeviceOnline = deviceStatus?.status === "online";
  const isDeviceWarning = deviceStatus?.status === "warning";

  const getStatusColor = () => {
    if (isDeviceOnline)
      return "text-green-600 bg-green-100 dark:bg-green-900/30";
    if (isDeviceWarning)
      return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30";
    return "text-red-600 bg-red-100 dark:bg-red-900/30";
  };

  const getStatusIcon = () => {
    if (isDeviceOnline) return <CheckCircle size={16} />;
    if (isDeviceWarning) return <AlertCircle size={16} />;
    return <Power size={16} />;
  };

  if (statusLoading || presetsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eco-600"></div>
      </div>
    );
  }

  if (statusError || presetsError) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
            Unable to Connect to Device
          </h3>
          <p className="text-red-600 dark:text-red-400 mb-4">
            {statusError?.data?.message ||
              statusError?.message ||
              "Failed to fetch device status"}
          </p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={16} />
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Device Control Panel
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Monitor and control your IoT sensor device
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title="Refresh Status"
          >
            <RefreshCw size={18} />
          </button>
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${getStatusColor()}`}
          >
            {getStatusIcon()}
            <span className="font-medium">
              {isDeviceOnline
                ? "Device Online"
                : isDeviceWarning
                  ? "Device Warning"
                  : "Device Offline"}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <Clock className="h-5 w-5 text-eco-600" />
            <span className="text-xs text-gray-400">Current Setting</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {currentInterval}s
          </p>
          <p className="text-xs text-gray-500 mt-1">Reading Interval</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <Thermometer className="h-5 w-5 text-orange-500" />
            <span className="text-xs text-gray-400">Current</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {deviceStatus?.temperature !== null &&
            deviceStatus?.temperature !== undefined
              ? `${deviceStatus.temperature}°C`
              : "--"}
          </p>
          <p className="text-xs text-gray-500 mt-1">Temperature</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <Droplets className="h-5 w-5 text-blue-500" />
            <span className="text-xs text-gray-400">Current</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {deviceStatus?.humidity !== null &&
            deviceStatus?.humidity !== undefined
              ? `${deviceStatus.humidity}%`
              : "--"}
          </p>
          <p className="text-xs text-gray-500 mt-1">Humidity</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <Wind className="h-5 w-5 text-teal-500" />
            <span className="text-xs text-gray-400">Current</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {deviceStatus?.co2_ppm !== null &&
            deviceStatus?.co2_ppm !== undefined
              ? `${deviceStatus.co2_ppm} ppm`
              : "--"}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            CO<sub>2</sub> level
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interval Control */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-eco-100 dark:bg-eco-900/30 rounded-xl">
              <Clock className="text-eco-600" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Sensor Reading Interval
              </h2>
              <p className="text-sm text-gray-500">
                Adjust how often data is collected from sensors
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Interval:{" "}
                  <span className="font-bold text-eco-600">
                    {intervalSeconds} seconds
                  </span>
                </label>
                <span className="text-xs text-gray-400">
                  {intervalSeconds < 60
                    ? `${intervalSeconds}s`
                    : `${(intervalSeconds / 60).toFixed(1)} min`}
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="300"
                step="5"
                value={intervalSeconds}
                onChange={(e) => setIntervalSeconds(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-eco-600"
                disabled={!isDeviceOnline}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>5s (Real-time)</span>
                <span>60s (Standard)</span>
                <span>120s (Moderate)</span>
                <span>300s (Economy)</span>
              </div>
            </div>

            <button
              onClick={handleSetInterval}
              disabled={isSetting || !isDeviceOnline}
              className="w-full bg-gradient-to-r from-eco-600 to-eco-700 text-white py-2.5 rounded-xl hover:from-eco-700 hover:to-eco-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
            >
              {isSetting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Zap size={16} />
                  Apply New Interval
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <Settings className="text-purple-600" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Quick Presets
              </h2>
              <p className="text-xs text-gray-500">Select a preset interval</p>
            </div>
          </div>
          <div className="space-y-2">
            {presets.length > 0 ? (
              presets.map((preset) => (
                <button
                  key={preset.seconds}
                  onClick={() => setIntervalSeconds(preset.seconds)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                    intervalSeconds === preset.seconds
                      ? "bg-eco-50 dark:bg-eco-900/20 border-2 border-eco-500"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-transparent"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{preset.icon || "⚡"}</span>
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {preset.name}
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {preset.description}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-eco-600">
                      {preset.seconds}s
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No presets available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Device Information */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
            <Activity className="text-blue-600" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Device Information
            </h2>
            <p className="text-xs text-gray-500">
              Real-time device status and metrics
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
            <p
              className={`text-sm font-semibold capitalize flex items-center gap-1 mt-1 ${isDeviceOnline ? "text-green-600" : isDeviceWarning ? "text-yellow-600" : "text-red-600"}`}
            >
              {getStatusIcon()}
              {deviceStatus?.status || "Unknown"}
            </p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Last Reading
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
              {deviceStatus?.last_reading
                ? new Date(deviceStatus.last_reading).toLocaleString()
                : "No data"}
            </p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Expected Interval
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
              {deviceStatus?.expected_interval_seconds || currentInterval}{" "}
              seconds
            </p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Device ID
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-white mt-1 font-mono">
              {deviceStatus?.device_id || "EBA-001"}
            </p>
          </div>
        </div>

        {/* Soil Moisture & Water Level if available */}
        {(deviceStatus?.soil_moisture !== undefined ||
          deviceStatus?.water_level !== undefined) && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            {deviceStatus?.soil_moisture !== undefined && (
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Droplets size={12} /> Soil Moisture
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                  {deviceStatus.soil_moisture}%
                </p>
              </div>
            )}
            {deviceStatus?.water_level !== undefined && (
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Gauge size={12} /> Water Level
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                  {deviceStatus.water_level}%
                </p>
              </div>
            )}
          </div>
        )}

        {deviceStatus?.status_message && (
          <div
            className={`mt-4 p-3 rounded-lg ${
              isDeviceOnline
                ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                : isDeviceWarning
                  ? "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
                  : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
            }`}
          >
            <p className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              {deviceStatus.status_message}
            </p>
          </div>
        )}

        {/* Note about MQTT connection */}
        {deviceStatus?.status === "unknown" && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-700 dark:text-yellow-300 flex items-start gap-2">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              Device status is currently unavailable. This may be due to MQTT
              connection issues. Changes will be saved locally and applied when
              the device reconnects.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ControlPanel;
