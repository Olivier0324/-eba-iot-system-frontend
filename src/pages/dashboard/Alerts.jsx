// src/pages/dashboard/Alerts.jsx
import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Eye,
  Check,
  Loader2,
  AlertCircle,
  CircleAlert,
  TriangleAlert,
  Info,
} from "lucide-react";
import {
  useGetAlertsQuery,
  useResolveAlertMutation,
  useAcknowledgeAlertMutation,
} from "../../services/api";
import { toast } from "react-toastify";
import Pagination from "../../components/common/Pagination";

function Alerts() {
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  const {
    data: alertsData,
    isLoading,
    refetch,
  } = useGetAlertsQuery({ status: filter !== "all" ? filter : undefined });
  const [resolveAlert, { isLoading: isResolving }] = useResolveAlertMutation();
  const [acknowledgeAlert, { isLoading: isAcknowledging }] =
    useAcknowledgeAlertMutation();

  const alerts = alertsData?.data || alertsData || [];
  const totalAlerts = alertsData?.totalItems || alerts.length;

  const offset = currentPage * itemsPerPage;
  const paginatedAlerts = alerts.slice(offset, offset + itemsPerPage);
  const totalPages = Math.ceil(alerts.length / itemsPerPage);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const handleResolve = async (id) => {
    try {
      await resolveAlert(id).unwrap();
      toast.success("Alert resolved");
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to resolve alert");
    }
  };

  const handleAcknowledge = async (id) => {
    try {
      await acknowledgeAlert(id).unwrap();
      toast.success("Alert acknowledged");
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to acknowledge alert");
    }
  };

  const getSeverityStyles = (severity) => {
    switch (severity?.toLowerCase()) {
      case "emergency":
        return {
          bg: "bg-red-100 dark:bg-red-900/30",
          text: "text-red-700 dark:text-red-400",
          border: "border-red-500",
          icon: AlertCircle,
        };
      case "critical":
        return {
          bg: "bg-orange-100 dark:bg-orange-900/30",
          text: "text-orange-700 dark:text-orange-400",
          border: "border-orange-500",
          icon: CircleAlert,
        };
      case "warning":
        return {
          bg: "bg-yellow-100 dark:bg-yellow-900/30",
          text: "text-yellow-700 dark:text-yellow-400",
          border: "border-yellow-500",
          icon: TriangleAlert,
        };
      default:
        return {
          bg: "bg-blue-100 dark:bg-blue-900/30",
          text: "text-blue-700 dark:text-blue-400",
          border: "border-blue-500",
          icon: Info,
        };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin h-8 w-8 text-eco-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Alerts
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Total: {totalAlerts} alerts
          </p>
        </div>
        <div className="flex gap-2">
          {["all", "active", "resolved", "acknowledged"].map((status) => (
            <button
              key={status}
              onClick={() => {
                setFilter(status);
                setCurrentPage(0);
              }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${
                filter === status
                  ? "bg-eco-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {paginatedAlerts.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              No alerts at this time
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              All systems are operating normally
            </p>
          </div>
        ) : (
          paginatedAlerts.map((alert) => {
            const styles = getSeverityStyles(alert.severity);
            const IconComponent = styles.icon;
            return (
              <div
                key={alert._id}
                className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border-l-4 ${styles.border} border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow`}
              >
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="flex gap-4">
                    <div className={`p-2 rounded-xl ${styles.bg}`}>
                      <IconComponent className={`h-5 w-5 ${styles.text}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {alert.title}
                        </h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${styles.bg} ${styles.text}`}
                        >
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {alert.message}
                      </p>
                      <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                        <span>Value: {alert.value}</span>
                        <span>Threshold: {alert.threshold}</span>
                        <span>Type: {alert.type}</span>
                        <span>
                          {new Date(alert.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {alert.status === "active" && (
                      <>
                        <button
                          onClick={() => handleAcknowledge(alert._id)}
                          disabled={isAcknowledging}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm disabled:opacity-50"
                        >
                          <Check size={14} />
                          Acknowledge
                        </button>
                        <button
                          onClick={() => handleResolve(alert._id)}
                          disabled={isResolving}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-eco-100 dark:bg-eco-900/30 text-eco-700 dark:text-eco-400 hover:bg-eco-200 dark:hover:bg-eco-900/50 transition-colors text-sm disabled:opacity-50"
                        >
                          <CheckCircle size={14} />
                          Resolve
                        </button>
                      </>
                    )}
                    {alert.status === "resolved" && (
                      <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm">
                        <CheckCircle size={14} />
                        Resolved
                      </span>
                    )}
                    {alert.status === "acknowledged" && (
                      <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm">
                        <Eye size={14} />
                        Acknowledged
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageClick}
        itemsPerPage={itemsPerPage}
        totalItems={alerts.length}
      />
    </div>
  );
}

export default Alerts;
