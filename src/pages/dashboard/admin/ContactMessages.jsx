// src/pages/dashboard/admin/ContactMessages.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { format } from "date-fns";
import {
  Mail,
  CheckCircle,
  Reply,
  Trash2,
  Eye,
  Clock,
  MessageSquare,
  Send,
  X,
  RefreshCw,
  User,
  AtSign,
  Tag,
  Calendar,
  AlertCircle,
} from "lucide-react";
import Pagination from "../../../components/common/Pagination";
import { api } from "../../../services/api";

const ContactMessages = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Fetch messages using RTK Query
  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const result = await dispatch(
        api.endpoints.getAllContactMessages.initiate({
          page: currentPage + 1,
          limit: itemsPerPage,
        }),
      ).unwrap();
      setMessages(result?.data || []);
      setTotalItems(result?.pagination?.totalItems || 0);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const result = await dispatch(
        api.endpoints.getContactMessageStats.initiate(),
      ).unwrap();
      setStats(result?.data || result || {});
    } catch {
      // Stats are optional; list fetch still drives the UI.
    }
  };

  useEffect(() => {
    fetchMessages();
    fetchStats();
  }, [currentPage]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchMessages();
    await fetchStats();
    setIsRefreshing(false);
    toast.info("Messages refreshed");
  };

  const handleReply = async () => {
    if (!replyText.trim()) {
      toast.error("Please enter a reply message");
      return;
    }
    try {
      await dispatch(
        api.endpoints.replyToContactMessage.initiate({
          id: selectedMessage._id,
          replyMessage: replyText,
        }),
      ).unwrap();
      toast.success("Reply sent successfully");
      setShowReplyModal(false);
      setReplyText("");
      fetchMessages();
      fetchStats();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to send reply");
    }
  };

  const handleResolve = async (id) => {
    try {
      await dispatch(api.endpoints.resolveContactMessage.initiate(id)).unwrap();
      toast.success("Message marked as resolved");
      fetchMessages();
      fetchStats();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to resolve message");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      try {
        await dispatch(
          api.endpoints.deleteContactMessage.initiate(id),
        ).unwrap();
        toast.success("Message deleted");
        fetchMessages();
        fetchStats();
      } catch (error) {
        toast.error(error?.data?.message || "Failed to delete message");
      }
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      read: "bg-blue-100 text-blue-800",
      replied: "bg-green-100 text-green-800",
      resolved: "bg-gray-100 text-gray-800",
    };
    return styles[status] || styles.pending;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock size={12} className="mr-1" />;
      case "replied":
        return <Reply size={12} className="mr-1" />;
      case "resolved":
        return <CheckCircle size={12} className="mr-1" />;
      default:
        return <Mail size={12} className="mr-1" />;
    }
  };

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  if (isLoading && !messages.length) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eco-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Contact Messages
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and respond to user inquiries
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
        >
          <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-4 shadow-sm border border-blue-200 dark:border-blue-800">
          <Mail className="h-6 w-6 text-blue-600 mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats?.total || 0}
          </p>
          <p className="text-sm text-gray-600">Total Messages</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-2xl p-4 shadow-sm border border-yellow-200 dark:border-yellow-800">
          <Clock className="h-6 w-6 text-yellow-600 mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats?.pending || 0}
          </p>
          <p className="text-sm text-gray-600">Pending</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl p-4 shadow-sm border border-green-200 dark:border-green-800">
          <MessageSquare className="h-6 w-6 text-green-600 mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats?.replied || 0}
          </p>
          <p className="text-sm text-gray-600">Replied</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-4 shadow-sm border border-purple-200 dark:border-purple-800">
          <CheckCircle className="h-6 w-6 text-purple-600 mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats?.resolved || 0}
          </p>
          <p className="text-sm text-gray-600">Resolved</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-2xl p-4 shadow-sm border border-red-200 dark:border-red-800">
          <Eye className="h-6 w-6 text-red-600 mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats?.unread || 0}
          </p>
          <p className="text-sm text-gray-600">Unread</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 flex items-start gap-3">
          <AlertCircle size={20} className="mt-0.5" />
          <div>
            <p className="font-medium">Error loading messages</p>
            <p className="text-sm">
              {error?.data?.message ||
                error.message ||
                "Please check your connection"}
            </p>
          </div>
        </div>
      )}

      {/* Messages Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            All Messages
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Showing {messages.length} of {totalItems} messages
          </p>
        </div>

        {messages.length === 0 ? (
          <div className="text-center py-16">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No messages yet</p>
            <p className="text-sm text-gray-400 mt-1">
              When users contact you, messages will appear here
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    From
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {messages.map((message) => (
                  <tr
                    key={message._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {message.name}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <AtSign size={10} />
                          {message.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        {message.subject}
                      </p>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                        {message.message.substring(0, 60)}...
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs capitalize">
                        {message.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs capitalize flex items-center ${getStatusBadge(message.status)}`}
                        >
                          {getStatusIcon(message.status)}
                          {message.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {format(
                        new Date(message.createdAt),
                        "MMM dd, yyyy HH:mm",
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedMessage(message);
                            setShowReplyModal(true);
                          }}
                          className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Reply"
                        >
                          <Reply size={16} />
                        </button>
                        {message.status !== "resolved" && (
                          <button
                            onClick={() => handleResolve(message._id)}
                            className="p-1.5 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                            title="Mark as Resolved"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(message._id)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageClick}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
            />
          </div>
        )}
      </div>

      {/* Professional Reply Modal */}
      {showReplyModal && selectedMessage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-eco-100 rounded-xl">
                  <Reply size={20} className="text-eco-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Reply to Message
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Respond to {selectedMessage.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowReplyModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Original Message Section */}
            <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <User size={18} className="text-eco-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedMessage.name}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                        <Mail size={10} />
                        {selectedMessage.email}
                        <span className="text-gray-300">|</span>
                        <Calendar size={10} />
                        {format(
                          new Date(selectedMessage.createdAt),
                          "MMMM dd, yyyy 'at' h:mm a",
                        )}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs capitalize flex items-center gap-1 ${getStatusBadge(selectedMessage.status)}`}
                    >
                      {getStatusIcon(selectedMessage.status)}
                      {selectedMessage.status}
                    </span>
                  </div>
                  <div className="mt-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                      Original Message
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {selectedMessage.message}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reply Form */}
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Reply
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply here..."
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-eco-500 focus:border-transparent resize-none transition-all"
                  autoFocus
                />
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  <AlertCircle size={12} />
                  Your reply will be sent via email to {selectedMessage.email}
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleReply}
                  className="flex-1 py-2.5 bg-eco-600 text-white rounded-xl hover:bg-eco-700 transition-all flex items-center justify-center gap-2 font-medium shadow-sm hover:shadow-md transform active:scale-[0.98]"
                >
                  <Send size={16} />
                  Send Reply
                </button>
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="flex-1 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactMessages;
