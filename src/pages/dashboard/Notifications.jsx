// src/pages/dashboard/Notifications.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  Loader2,
  Trash2,
  Inbox,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useDeleteNotificationMutation,
} from "../../services/api";
import { usePermissions } from "../../hooks/usePermissions";
import { getFetchErrorMessage } from "../../utils/rtkQueryError";
import { toast } from "react-toastify";

const LIMIT = 12;

function rowId(n) {
  const raw = n._id ?? n.id;
  if (raw == null) return "";
  if (typeof raw === "object" && raw.$oid) return String(raw.$oid);
  return String(raw);
}

/** Match dashboard: API may send string booleans; prefer `isRead` then `read`. */
function recordIsRead(n) {
  const v =
    n.isRead !== undefined && n.isRead !== null ? n.isRead : n.read;
  if (v === true || v === 1) return true;
  if (typeof v === "string") {
    const s = v.toLowerCase();
    return s === "true" || s === "1";
  }
  return false;
}

function Notifications() {
  const [page, setPage] = useState(1);
  const { isViewOnly } = usePermissions();
  const {
    data,
    isLoading,
    isFetching,
    refetch,
    isError: notificationsFailed,
    error: notificationsError,
  } = useGetNotificationsQuery({
    page,
    limit: LIMIT,
  });
  const notificationsErrMsg = notificationsFailed
    ? getFetchErrorMessage(
        notificationsError,
        "The server could not load notifications (HTTP 500).",
      )
    : "";
  const [markRead, { isLoading: markingOne }] =
    useMarkNotificationAsReadMutation();
  const [markAll, { isLoading: markingAll }] =
    useMarkAllNotificationsAsReadMutation();
  const [remove, { isLoading: deleting }] = useDeleteNotificationMutation();

  const list = Array.isArray(data?.list) ? data.list : [];
  const pagination = data?.pagination ?? {};
  const serverTotalPages = pagination.totalPages;
  const hasNextPage =
    typeof serverTotalPages === "number"
      ? page < serverTotalPages
      : list.length >= LIMIT;
  const totalPages =
    typeof serverTotalPages === "number"
      ? Math.max(1, serverTotalPages)
      : Math.max(page, hasNextPage ? page + 1 : page);

  const handleMarkRead = async (id) => {
    if (!id || typeof id !== "string") return;
    try {
      await markRead(id).unwrap();
      toast.success("Marked as read");
      refetch();
    } catch {
      toast.error("Could not update notification");
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAll().unwrap();
      toast.success("All notifications marked as read");
      refetch();
    } catch {
      toast.error("Could not mark all as read");
    }
  };

  const handleDelete = async (id) => {
    if (!id || typeof id !== "string") return;
    if (!window.confirm("Delete this notification?")) return;
    try {
      await remove(id).unwrap();
      toast.success("Notification deleted");
      refetch();
    } catch {
      toast.error("Could not delete notification");
    }
  };

  const busy = isLoading || isFetching;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="h-7 w-7 text-eco-600 shrink-0" />
            Notifications
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {notificationsFailed
              ? "Notifications service error — see below."
              : busy
                ? "Loading…"
                : `${data?.unreadCount ?? 0} unread · Page ${page} of ${totalPages}`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void handleMarkAll()}
            disabled={
              markingAll ||
              notificationsFailed ||
              (data?.unreadCount ?? 0) === 0
            }
            className="inline-flex items-center justify-center gap-2 min-h-[2.5rem] px-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {markingAll ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCheck className="h-4 w-4" />
            )}
            Mark all read
          </button>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center min-h-[2.5rem] px-4 rounded-xl text-sm font-medium text-eco-700 dark:text-eco-400 hover:bg-eco-50 dark:hover:bg-eco-950/30"
          >
            Dashboard
          </Link>
        </div>
      </div>

      {isViewOnly && (
        <p className="text-sm text-gray-600 dark:text-gray-400 bg-eco-50/80 dark:bg-eco-950/25 border border-eco-200/60 dark:border-eco-800/40 rounded-xl px-4 py-3">
          View-only account: you can read and mark notifications; deleting
          notifications is disabled.
        </p>
      )}

      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
        {notificationsFailed ? (
          <div className="flex flex-col items-center justify-center py-14 px-6 text-center gap-4">
            <p className="text-sm font-medium text-red-700 dark:text-red-300 max-w-lg">
              {notificationsErrMsg}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md leading-relaxed">
              This is a server-side failure (often a bug in{" "}
              <code className="text-[11px] bg-gray-100 dark:bg-gray-900 px-1 rounded">
                NotificationService.getUserNotifications
              </code>{" "}
              or a Mongo query). Open Vercel → your deployment → Logs and
              reproduce the request to see the stack trace.
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              disabled={busy}
              className="inline-flex items-center gap-2 min-h-[2.5rem] px-5 rounded-xl bg-eco-600 text-white text-sm font-medium hover:bg-eco-700 disabled:opacity-50"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Retry
            </button>
          </div>
        ) : busy && list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-9 w-9 animate-spin text-eco-600" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Loading notifications…
            </p>
          </div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <Inbox className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
            <p className="font-medium text-gray-700 dark:text-gray-300">
              No notifications yet
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-md">
              Alerts and system messages will appear here when available.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {list.map((n) => {
              const id = rowId(n);
              const read = recordIsRead(n);
              return (
                <li
                  key={id || JSON.stringify(n)}
                  className={`flex flex-col gap-3 p-4 sm:p-5 sm:flex-row sm:items-start sm:justify-between ${
                    read ? "" : "bg-eco-50/50 dark:bg-eco-950/20"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 gap-y-1">
                      <h2 className="font-semibold text-gray-900 dark:text-white">
                        {n.title || "Notification"}
                      </h2>
                      {n.priority && (
                        <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                          {n.priority}
                        </span>
                      )}
                      {n.type && (
                        <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-ocean-50 dark:bg-ocean-950/40 text-ocean-800 dark:text-ocean-300">
                          {n.type}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 whitespace-pre-wrap">
                      {n.message || "—"}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      {n.createdAt
                        ? new Date(n.createdAt).toLocaleString()
                        : ""}
                    </p>
                  </div>
                  <div className="flex flex-row sm:flex-col gap-2 shrink-0">
                    {!read && (
                      <button
                        type="button"
                        disabled={markingOne}
                        onClick={() => void handleMarkRead(id)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-eco-600 text-white hover:bg-eco-700 disabled:opacity-50"
                      >
                        Mark read
                      </button>
                    )}
                    {!isViewOnly && (
                      <button
                        type="button"
                        disabled={deleting}
                        onClick={() => void handleDelete(id)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/50">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Page {page} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1 || busy}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40 hover:bg-white dark:hover:bg-gray-800"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                disabled={!hasNextPage || busy}
                onClick={() => setPage((p) => p + 1)}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40 hover:bg-white dark:hover:bg-gray-800"
                aria-label="Next page"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;
