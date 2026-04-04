// src/pages/dashboard/admin/ResearchManagement.jsx
import React, { useState } from "react";
import {
  useGetAllResearchPapersQuery,
  useCreateResearchPaperMutation,
  useUpdateResearchPaperMutation,
  useDeleteResearchPaperMutation,
} from "../../../services/api";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { Plus, Edit, Trash2, Eye, X, Check } from "lucide-react";
import Pagination from "../../../components/common/Pagination";

const ResearchManagement = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingPaper, setEditingPaper] = useState(null);
  const itemsPerPage = 10;

  const {
    data: papersData,
    isLoading,
    refetch,
  } = useGetAllResearchPapersQuery({
    page: currentPage + 1,
    limit: itemsPerPage,
  });
  const [createPaper] = useCreateResearchPaperMutation();
  const [updatePaper] = useUpdateResearchPaperMutation();
  const [deletePaper] = useDeleteResearchPaperMutation();

  const [formData, setFormData] = useState({
    title: "",
    authors: "",
    abstract: "",
    content: "",
    journal: "",
    publicationDate: "",
    category: "environmental-science",
    keywords: "",
    pdfUrl: "",
    coverImage: "",
    published: false,
  });

  const papers = papersData?.data || [];
  const totalItems = papersData?.pagination?.totalItems || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        authors: formData.authors.split(",").map((a) => a.trim()),
        keywords: formData.keywords.split(",").map((k) => k.trim()),
      };
      if (editingPaper) {
        await updatePaper({ id: editingPaper._id, ...data }).unwrap();
        toast.success("Research paper updated successfully");
      } else {
        await createPaper(data).unwrap();
        toast.success("Research paper created successfully");
      }
      setShowModal(false);
      setEditingPaper(null);
      setFormData({
        title: "",
        authors: "",
        abstract: "",
        content: "",
        journal: "",
        publicationDate: "",
        category: "environmental-science",
        keywords: "",
        pdfUrl: "",
        coverImage: "",
        published: false,
      });
      refetch();
    } catch (error) {
      toast.error("Failed to save research paper");
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this research paper?")
    ) {
      try {
        await deletePaper(id).unwrap();
        toast.success("Research paper deleted");
        refetch();
      } catch (error) {
        toast.error("Failed to delete research paper");
      }
    }
  };

  const handleEdit = (paper) => {
    setEditingPaper(paper);
    setFormData({
      title: paper.title,
      authors: paper.authors?.join(", ") || "",
      abstract: paper.abstract,
      content: paper.content,
      journal: paper.journal || "",
      publicationDate: paper.publicationDate?.split("T")[0] || "",
      category: paper.category,
      keywords: paper.keywords?.join(", ") || "",
      pdfUrl: paper.pdfUrl || "",
      coverImage: paper.coverImage || "",
      published: paper.published,
    });
    setShowModal(true);
  };

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eco-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Research Papers Management
        </h1>
        <button
          onClick={() => {
            setEditingPaper(null);
            setFormData({
              title: "",
              authors: "",
              abstract: "",
              content: "",
              journal: "",
              publicationDate: "",
              category: "environmental-science",
              keywords: "",
              pdfUrl: "",
              coverImage: "",
              published: false,
            });
            setShowModal(true);
          }}
          className="px-4 py-2 bg-eco-600 text-white rounded-xl hover:bg-eco-700 transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          Add Paper
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Authors
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Journal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {papers.map((paper) => (
                <tr
                  key={paper._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {paper.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {paper.authors?.join(", ")?.substring(0, 30)}...
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {paper.journal || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(paper.publicationDate).getFullYear()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${paper.published ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                    >
                      {paper.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <a
                        href={`/research/${paper.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-blue-500 hover:text-blue-700"
                      >
                        <Eye size={18} />
                      </a>
                      <button
                        onClick={() => handleEdit(paper)}
                        className="p-1 text-yellow-500 hover:text-yellow-700"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(paper._id)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageClick}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
          />
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl p-6 my-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingPaper
                  ? "Edit Research Paper"
                  : "Add New Research Paper"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={handleSubmit}
              className="space-y-4 max-h-[70vh] overflow-y-auto px-1"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-eco-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Authors (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.authors}
                  onChange={(e) =>
                    setFormData({ ...formData, authors: e.target.value })
                  }
                  placeholder="John Doe, Jane Smith"
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-eco-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Abstract
                </label>
                <textarea
                  value={formData.abstract}
                  onChange={(e) =>
                    setFormData({ ...formData, abstract: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-eco-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Content / Full Text
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  rows={5}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-eco-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Journal
                  </label>
                  <input
                    type="text"
                    value={formData.journal}
                    onChange={(e) =>
                      setFormData({ ...formData, journal: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-eco-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Publication Date
                  </label>
                  <input
                    type="date"
                    value={formData.publicationDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        publicationDate: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-eco-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-eco-500"
                >
                  <option value="environmental-science">
                    Environmental Science
                  </option>
                  <option value="iot-technology">IoT Technology</option>
                  <option value="climate-adaptation">Climate Adaptation</option>
                  <option value="data-analytics">Data Analytics</option>
                  <option value="policy">Policy</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Keywords (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.keywords}
                  onChange={(e) =>
                    setFormData({ ...formData, keywords: e.target.value })
                  }
                  placeholder="climate change, IoT, monitoring"
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-eco-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  PDF URL
                </label>
                <input
                  type="text"
                  value={formData.pdfUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, pdfUrl: e.target.value })
                  }
                  placeholder="https://example.com/paper.pdf"
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-eco-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cover Image URL
                </label>
                <input
                  type="text"
                  value={formData.coverImage}
                  onChange={(e) =>
                    setFormData({ ...formData, coverImage: e.target.value })
                  }
                  placeholder="https://example.com/cover.jpg"
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-eco-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) =>
                    setFormData({ ...formData, published: e.target.checked })
                  }
                  className="w-4 h-4 text-eco-600 focus:ring-eco-500"
                />
                <label className="text-sm text-gray-700 dark:text-gray-300">
                  Publish immediately
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-eco-600 text-white rounded-xl hover:bg-eco-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Check size={16} />
                  {editingPaper ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearchManagement;
