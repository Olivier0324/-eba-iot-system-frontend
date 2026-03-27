// src/pages/dashboard/Reports.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Download,
  Eye,
  Trash2,
  Calendar,
  Loader2,
  Plus,
} from "lucide-react";
import {
  useGenerateReportMutation,
  useGetReportsQuery,
  useDeleteReportMutation,
} from "../../services/api";
import { toast } from "react-toastify";
import { format } from "date-fns";

function Reports() {
  const [reportType, setReportType] = useState("weekly");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [generateReport, { isLoading: isGenerating }] =
    useGenerateReportMutation();
  const [deleteReport, { isLoading: isDeleting }] = useDeleteReportMutation();
  const { data: reports, isLoading, refetch } = useGetReportsQuery();

  const handleGenerate = async () => {
    try {
      const params = { type: reportType };
      if (dateRange.start && dateRange.end) {
        params.startDate = dateRange.start;
        params.endDate = dateRange.end;
      }
      await generateReport(params).unwrap();
      toast.success("Report generated successfully!");
      refetch();
      setDateRange({ start: "", end: "" });
    } catch (error) {
      toast.error(error?.data?.message || "Failed to generate report");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      try {
        await deleteReport(id).unwrap();
        toast.success("Report deleted");
        refetch();
      } catch (error) {
        toast.error("Failed to delete report");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Reports
        </h1>
      </div>

      {/* Generate Report Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Generate New Report
        </h2>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange({ ...dateRange, start: e.target.value })
              }
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange({ ...dateRange, end: e.target.value })
              }
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-eco-600 text-white px-6 py-2 rounded-xl hover:bg-eco-700 transition-colors flex items-center gap-2"
          >
            {isGenerating ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
              <Plus size={18} />
            )}
            Generate Report
          </button>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Reports
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Filename
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {reports?.map((report) => (
                <tr
                  key={report._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {report.originalFilename}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 rounded-full bg-eco-100 dark:bg-eco-900/30 text-eco-700 dark:text-eco-300 text-xs">
                      {report.reportType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {format(new Date(report.createdAt), "MM/dd/yyyy HH:mm")}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {(report.fileSize / 1024).toFixed(1)} KB
                  </td>
                  <td className="px-6 py-4 text-sm flex gap-2">
                    <a
                      href={report.viewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-gray-500 hover:text-eco-600 transition-colors"
                    >
                      <Eye size={18} />
                    </a>
                    <a
                      href={report.downloadUrl}
                      download
                      className="p-1 text-gray-500 hover:text-eco-600 transition-colors"
                    >
                      <Download size={18} />
                    </a>
                    <button
                      onClick={() => handleDelete(report._id)}
                      className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                      disabled={isDeleting}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!reports || reports.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              No reports generated yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Reports;
