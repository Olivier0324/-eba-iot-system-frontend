// src/pages/dashboard/admin/BlogManagement.jsx
import React, { useState, useEffect } from "react";
import {
  useGetAllBlogsQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
} from "../../../services/api";
import { toast } from "react-toastify";
import { format } from "date-fns";
import {
  Plus,
  Edit,
  Trash2,
  X,
  Check,
  Image,
  Tag,
  Clock,
  BookOpen,
  User,
  RefreshCw,
} from "lucide-react";
import Pagination from "../../../components/common/Pagination";
import ModalShell from "../../../components/common/ModalShell";

const BlogManagement = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const itemsPerPage = 10;

  const {
    data: blogsResponse,
    isLoading,
    refetch,
    error,
  } = useGetAllBlogsQuery({
    page: currentPage + 1,
    limit: itemsPerPage,
  });

  const [createBlog] = useCreateBlogMutation();
  const [updateBlog] = useUpdateBlogMutation();
  const [deleteBlog] = useDeleteBlogMutation();

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    author: "",
    category: "tutorial",
    readTime: 5,
    tags: "",
    published: false,
    featuredImage: "",
  });

  // Extract blogs from response - handle different response structures
  const blogs = blogsResponse?.data || blogsResponse || [];
  const totalItems = blogsResponse?.pagination?.totalItems || blogs.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  useEffect(() => {
    if (error) {
      toast.error("Failed to load blogs. Please refresh.");
    }
  }, [error]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
    toast.info("Blogs refreshed");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Only include fields that have values
      const data = {
        title: formData.title || undefined,
        excerpt: formData.excerpt || undefined,
        content: formData.content || undefined,
        author: formData.author || undefined,
        category: formData.category || undefined,
        readTime: formData.readTime || undefined,
        tags: formData.tags
          ? formData.tags
              .split(",")
              .map((t) => t.trim())
              .filter((t) => t)
          : undefined,
        published: formData.published,
        featuredImage: formData.featuredImage || undefined,
      };

      // Remove undefined values
      Object.keys(data).forEach(
        (key) => data[key] === undefined && delete data[key]
      );

      if (editingBlog) {
        // For editing, only send changed fields
        const changedData = {};
        Object.keys(data).forEach((key) => {
          if (data[key] !== editingBlog[key]) {
            changedData[key] = data[key];
          }
        });

        await updateBlog({ id: editingBlog._id, ...changedData }).unwrap();
        toast.success("Blog updated successfully");
      } else {
        await createBlog(data).unwrap();
        toast.success("Blog created successfully");
      }
      setShowModal(false);
      setEditingBlog(null);
      setFormData({
        title: "",
        excerpt: "",
        content: "",
        author: "",
        category: "tutorial",
        readTime: 5,
        tags: "",
        published: false,
        featuredImage: "",
      });
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to save blog");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this blog?")) {
      try {
        await deleteBlog(id).unwrap();
        toast.success("Blog deleted");
        refetch();
      } catch (error) {
        toast.error(error?.data?.message || "Failed to delete blog");
      }
    }
  };

  const handleEdit = (blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title || "",
      excerpt: blog.excerpt || "",
      content: blog.content || "",
      author: blog.author || "",
      category: blog.category || "tutorial",
      readTime: blog.readTime || 5,
      tags: blog.tags?.join(", ") || "",
      published: blog.published || false,
      featuredImage: blog.featuredImage || "",
    });
    setShowModal(true);
  };

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  if (isLoading && !blogsResponse) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eco-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Blog Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Create, edit, and manage blog posts
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <RefreshCw
              size={16}
              className={isRefreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
          <button
            onClick={() => {
              setEditingBlog(null);
              setFormData({
                title: "",
                excerpt: "",
                content: "",
                author: "",
                category: "tutorial",
                readTime: 5,
                tags: "",
                published: false,
                featuredImage: "",
              });
              setShowModal(true);
            }}
            className="px-4 py-2 bg-eco-600 text-white rounded-xl hover:bg-eco-700 transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            New Post
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700">
          <p className="font-medium">Error loading blogs</p>
          <p className="text-sm">
            {error?.data?.message ||
              error.message ||
              "Please check your connection"}
          </p>
        </div>
      )}

      {/* Blogs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            All Blog Posts
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Showing {blogs.length} of {totalItems} posts
          </p>
        </div>

        {blogs.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No blog posts yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Click "New Post" to create your first blog post
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Author
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
                {blogs.map((blog) => (
                  <tr
                    key={blog._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {blog.title}
                        </p>
                        {blog.excerpt && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                            {blog.excerpt.substring(0, 80)}...
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {blog.author}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs capitalize">
                        {blog.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          blog.published
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {blog.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {format(new Date(blog.createdAt), "MMM dd, yyyy")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(blog)}
                          className="p-1.5 text-yellow-500 hover:text-yellow-700 hover:bg-yellow-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(blog._id)}
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

      <ModalShell
        open={showModal}
        onClose={() => setShowModal(false)}
        maxWidthClass="max-w-3xl"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl w-full my-8 shadow-2xl border border-gray-200 dark:border-gray-700 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-eco-100 rounded-xl">
                  <BookOpen size={20} className="text-eco-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {editingBlog ? "Edit Blog Post" : "Create New Blog Post"}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {editingBlog
                      ? "Update your existing blog post"
                      : "Add a new blog post to your website"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-5 max-h-[70vh] overflow-y-auto"
            >
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter blog title"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-eco-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Author & Read Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Author
                  </label>
                  <div className="relative">
                    <User
                      size={18}
                      className="absolute left-3 top-2.5 text-gray-400"
                    />
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) =>
                        setFormData({ ...formData, author: e.target.value })
                      }
                      placeholder="Author name"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-eco-500 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Read Time (minutes)
                  </label>
                  <div className="relative">
                    <Clock
                      size={18}
                      className="absolute left-3 top-2.5 text-gray-400"
                    />
                    <input
                      type="number"
                      value={formData.readTime}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          readTime: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="5"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-eco-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Category & Tags */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-eco-500"
                  >
                    <option value="tutorial">Tutorial</option>
                    <option value="research">Research</option>
                    <option value="technical">Technical</option>
                    <option value="guide">Guide</option>
                    <option value="news">News</option>
                    <option value="case-study">Case Study</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Tags (comma separated)
                  </label>
                  <div className="relative">
                    <Tag
                      size={18}
                      className="absolute left-3 top-2.5 text-gray-400"
                    />
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) =>
                        setFormData({ ...formData, tags: e.target.value })
                      }
                      placeholder="iot, environment, monitoring"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-eco-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Excerpt
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData({ ...formData, excerpt: e.target.value })
                  }
                  rows={3}
                  placeholder="Brief description of your blog post..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-eco-500 focus:border-transparent resize-none transition-all"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {formData.excerpt.length}/300 characters
                </p>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Content
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  rows={10}
                  placeholder="Write your blog content here..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-eco-500 focus:border-transparent resize-none transition-all"
                />
              </div>

              {/* Featured Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Featured Image URL
                </label>
                <div className="relative">
                  <Image
                    size={18}
                    className="absolute left-3 top-2.5 text-gray-400"
                  />
                  <input
                    type="text"
                    value={formData.featuredImage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        featuredImage: e.target.value,
                      })
                    }
                    placeholder="https://example.com/image.jpg"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-eco-500 transition-all"
                  />
                </div>
                {formData.featuredImage && (
                  <div className="mt-2">
                    <img
                      src={formData.featuredImage}
                      alt="Preview"
                      className="h-20 rounded-lg object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Publish Option */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) =>
                    setFormData({ ...formData, published: e.target.checked })
                  }
                  className="w-4 h-4 text-eco-600 focus:ring-eco-500 rounded"
                  id="published"
                />
                <label
                  htmlFor="published"
                  className="text-sm text-gray-700 dark:text-gray-300"
                >
                  Publish immediately
                </label>
                {!formData.published && (
                  <span className="text-xs text-gray-400 ml-2">
                    (Will be saved as draft)
                  </span>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-eco-600 text-white rounded-xl hover:bg-eco-700 transition-all flex items-center justify-center gap-2 font-medium shadow-sm hover:shadow-md transform active:scale-[0.98]"
                >
                  <Check size={16} />
                  {editingBlog ? "Update Blog" : "Create Blog"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
      </ModalShell>
    </div>
  );
};

export default BlogManagement;
