// src/pages/dashboard/Alerts.jsx
import React, { useState } from "react";
import {
  CheckCircle,
  Eye,
  Check,
  Loader2,
  AlertCircle,
  CircleAlert,
  TriangleAlert,
  Info,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetAlertsQuery,
  useGetAlertByIdQuery,
  useResolveAlertMutation,
  useAcknowledgeAlertMutation,
} from "../../services/api";
import { toast } from "react-toastify";
import Pagination from "../../components/common/Pagination";
import FilterPills from "../../components/common/FilterPills";

const FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "resolved", label: "Resolved" },
  { value: "acknowledged", label: "Acknowledged" },
];

/** Renders plain text with CO2 / co2 → CO<sub>2</sub> for readability. */
function RichCo2Text({ text, className = "" }) {
  if (text == null) return null;
  if (typeof text !== "string") {
    return <span className={className}>{String(text)}</span>;
  }
  const parts = text.split(/(\bco2\b|\bCO2\b)/gi);
  return (
    <span className={className}>
      {parts.map((part, i) =>
        /^co2$/i.test(part) ? (
          <span key={i} className="whitespace-nowrap">
            CO<sub className="text-[0.78em] leading-none align-baseline">2</sub>
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </span>
  );
}

function formatTypeLabel(type) {
  if (type == null || type === "") return "—";
  const t = String(type).trim().toLowerCase();
  if (t === "co2" || t === "co₂") {
    return (
      <span className="whitespace-nowrap">
        CO<sub className="text-[0.78em] leading-none align-baseline">2</sub>
      </span>
    );
  }
  return type;
}

function actorLabel(actor) {
  if (!actor) return "";
  if (typeof actor === "string") {
    // Keep UI human-friendly if backend returns only Mongo ObjectId.
    if (/^[a-fA-F0-9]{24}$/.test(actor.trim())) return "Staff user";
    return actor;
  }
  return (
    actor.username ||
    actor.name ||
    actor.displayName ||
    actor.firstName ||
    actor.email ||
    actor.fullName ||
    actor.id ||
    actor._id ||
    ""
  );
}

function toLocalDateTime(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
}

function Alerts() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isSingleView = Boolean(id);
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  const {
    data: alertsData,
    isLoading,
    refetch,
  } = useGetAlertsQuery(
    { status: filter !== "all" ? filter : undefined },
    { skip: isSingleView },
  );
  const [resolveAlert, { isLoading: isResolving }] = useResolveAlertMutation();
  const [acknowledgeAlert, { isLoading: isAcknowledging }] =
    useAcknowledgeAlertMutation();
  const { data: alertByIdData, isLoading: isSingleLoading } = useGetAlertByIdQuery(
    id,
    { skip: !id },
  );

  const alerts = isSingleView
    ? [alertByIdData].filter(Boolean)
    : alertsData?.data || alertsData || [];
  const totalAlerts = alertsData?.totalItems || alerts.length;

  const offset = currentPage * itemsPerPage;
  const paginatedAlerts = alerts.slice(offset, offset + itemsPerPage);
  const totalPages = Math.ceil(alerts.length / itemsPerPage);

  const handlePageClick = (page) => {
    setCurrentPage(page);
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
          iconBg: "bg-red-50 dark:bg-red-950/35",
          iconText: "text-red-600 dark:text-red-400",
          badge:
            "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 ring-1 ring-red-200/60 dark:ring-red-800/50",
          bar: "bg-red-500/55",
          icon: AlertCircle,
        };
      case "critical":
        return {
          iconBg: "bg-orange-50 dark:bg-orange-950/35",
          iconText: "text-orange-600 dark:text-orange-400",
          badge:
            "bg-orange-50 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300 ring-1 ring-orange-200/60 dark:ring-orange-800/50",
          bar: "bg-orange-500/55",
          icon: CircleAlert,
        };
      case "warning":
        return {
          iconBg: "bg-amber-50 dark:bg-amber-950/35",
          iconText: "text-amber-700 dark:text-amber-400",
          badge:
            "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 ring-1 ring-amber-200/60 dark:ring-amber-800/50",
          bar: "bg-amber-500/55",
          icon: TriangleAlert,
        };
      default:
        return {
          iconBg: "bg-blue-50 dark:bg-blue-950/35",
          iconText: "text-blue-600 dark:text-blue-400",
          badge:
            "bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 ring-1 ring-blue-200/60 dark:ring-blue-800/50",
          bar: "bg-blue-500/50",
          icon: Info,
        };
    }
  };

  if (isLoading || isSingleLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <Loader2 className="animate-spin h-8 w-8 text-eco-600" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Loading alerts…
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isSingleView ? "Alert Details" : "Alerts"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isSingleView ? `Alert ID: ${id}` : `Total: ${totalAlerts} alerts`}
          </p>
        </div>
        {isSingleView ? (
          <button
            type="button"
            onClick={() => navigate("/dashboard/alerts")}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Back to alerts
          </button>
        ) : (
          <FilterPills
            ariaLabel="Filter alerts by status"
            options={FILTER_OPTIONS}
            value={filter}
            onChange={(next) => {
              setFilter(next);
              setCurrentPage(0);
            }}
            className="w-full sm:w-auto"
          />
        )}
      </div>

      <div className="space-y-4">
        {paginatedAlerts.length === 0 ? (
          <div className="text-center py-12 sm:py-14 px-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <CheckCircle className="h-12 w-12 text-eco-500 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-300 font-medium">
              No alerts at this time
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
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
                className="relative overflow-hidden rounded-2xl border border-gray-200/95 dark:border-gray-700/90 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Slim accent bar — severity hint without a heavy outline */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${styles.bar}`}
                  aria-hidden
                />
                <div className="relative pl-4 sm:pl-5 pr-4 sm:pr-5 py-4 sm:py-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex gap-3 sm:gap-4 min-w-0">
                      <div
                        className={`shrink-0 p-2.5 rounded-xl ${styles.iconBg}`}
                      >
                        <IconComponent
                          className={`h-5 w-5 ${styles.iconText}`}
                          aria-hidden
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 gap-y-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white leading-snug">
                            <RichCo2Text text={alert.title} />
                          </h3>
                          <span
                            className={`text-xs px-2.5 py-0.5 rounded-full capitalize font-medium ${styles.badge}`}
                          >
                            {alert.severity}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
                          <RichCo2Text text={alert.message} />
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-xs text-gray-500 dark:text-gray-400">
                          <span>
                            Value:{" "}
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {alert.value}
                            </span>
                          </span>
                          <span>
                            Threshold:{" "}
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {alert.threshold}
                            </span>
                          </span>
                          <span className="inline-flex items-center gap-1">
                            Type:{" "}
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {formatTypeLabel(alert.type)}
                            </span>
                          </span>
                          <span className="text-gray-400 dark:text-gray-500">
                            {new Date(alert.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {(alert.status === "acknowledged" ||
                          alert.status === "resolved") && (
                          <div className="mt-2 space-y-1 text-xs text-gray-500 dark:text-gray-400">
                            {(() => {
                              const ackBy = actorLabel(
                                alert.acknowledgedBy ||
                                  alert.acknowledgedByUser ||
                                  alert.acknowledgedByInfo ||
                                  alert.acknowledgedByDetails ||
                                  alert.ackBy ||
                                  alert.ackByUser ||
                                  alert.ackUser ||
                                  alert.acknowledgedByName,
                              );
                              const ackAt = toLocalDateTime(
                                alert.acknowledgedAt || alert.ackAt,
                              );
                              if (!ackBy && !ackAt) return null;
                              return (
                                <p>
                                  Acknowledged by{" "}
                                  <span className="font-medium text-gray-700 dark:text-gray-300">
                                    {ackBy || "staff"}
                                  </span>
                                  {ackAt ? ` at ${ackAt}` : ""}
                                </p>
                              );
                            })()}
                            {(() => {
                              const resolvedBy = actorLabel(
                                alert.resolvedBy ||
                                  alert.resolvedByUser ||
                                  alert.resolvedByInfo ||
                                  alert.resolvedByDetails ||
                                  alert.resolvedByName,
                              );
                              const resolvedAt = toLocalDateTime(
                                alert.resolvedAt,
                              );
                              if (!resolvedBy && !resolvedAt) return null;
                              return (
                                <p>
                                  Resolved by{" "}
                                  <span className="font-medium text-gray-700 dark:text-gray-300">
                                    {resolvedBy || "staff"}
                                  </span>
                                  {resolvedAt ? ` at ${resolvedAt}` : ""}
                                </p>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 shrink-0 lg:justify-end">
                      {alert.status === "active" && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleAcknowledge(alert._id)}
                            disabled={isAcknowledging}
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/80 transition-colors disabled:opacity-50"
                          >
                            <Check size={16} strokeWidth={2.5} />
                            Acknowledge
                          </button>
                          <button
                            type="button"
                            onClick={() => handleResolve(alert._id)}
                            disabled={isResolving}
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-eco-600 text-white hover:bg-eco-700 shadow-sm transition-colors disabled:opacity-50"
                          >
                            <CheckCircle size={16} strokeWidth={2.5} />
                            Resolve
                          </button>
                        </>
                      )}
                      {alert.status === "resolved" && (
                        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-eco-50 dark:bg-eco-950/40 text-eco-800 dark:text-eco-300 ring-1 ring-eco-200/70 dark:ring-eco-800/50">
                          <CheckCircle size={16} />
                          Resolved
                        </span>
                      )}
                      {alert.status === "acknowledged" && (
                        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-700/80 text-gray-800 dark:text-gray-200 ring-1 ring-gray-200/80 dark:ring-gray-600/60">
                          <Eye size={16} />
                          Acknowledged
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {!isSingleView && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageClick}
          itemsPerPage={itemsPerPage}
          totalItems={alerts.length}
        />
      )}
    </div>
  );
}

export default Alerts;
