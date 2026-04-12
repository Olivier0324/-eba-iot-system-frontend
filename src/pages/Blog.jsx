// src/pages/Blog.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/common/Footer";
import Logo from "../components/common/Logo";
import ThemeToggleButton from "../components/common/ThemeToggleButton";
import { useGetAllBlogsQuery } from "../services/api";
import { format } from "date-fns";

const Blog = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: blogsResponse,
    isLoading,
    error,
    refetch,
  } = useGetAllBlogsQuery({
    page: 1,
    limit: 100,
  });

  // Extract blogs from response - handle different possible structures
  let allBlogs = [];
  if (blogsResponse?.data && Array.isArray(blogsResponse.data)) {
    allBlogs = blogsResponse.data;
  } else if (Array.isArray(blogsResponse)) {
    allBlogs = blogsResponse;
  } else if (
    blogsResponse?.data?.data &&
    Array.isArray(blogsResponse.data.data)
  ) {
    allBlogs = blogsResponse.data.data;
  }

  // Filter only published posts
  const publishedBlogs = allBlogs.filter((blog) => blog.published === true);

  // Get unique categories from published blogs
  const categories = [
    "All",
    ...new Set(publishedBlogs.map((blog) => blog.category).filter(Boolean)),
  ];

  // Filter by category and search query
  const filteredPosts = publishedBlogs.filter((post) => {
    const matchesCategory =
      selectedCategory === "All" || post.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="relative min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggleButton />
        </div>
        <div className="grow pt-20 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-eco-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggleButton />
        </div>
        <div className="grow pt-20 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">
              Failed to load blog posts
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-eco-600 text-white rounded-lg hover:bg-eco-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggleButton />
      </div>
      <div className="grow pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Logo - Centered and Clickable */}
          <div
            className="mb-8 flex justify-center cursor-pointer"
            onClick={() => navigate("/")}
          >
            <Logo />
          </div>

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
              Technical Blog
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Insights, tutorials, and updates from the EBA System team
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-12 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-eco-500 focus:ring-2 focus:ring-eco-500/20 transition-all outline-none"
              />
              <svg
                className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 dark:text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Category Filter */}
          {categories.length > 1 && (
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-full text-sm font-semibold transition-all shadow-sm ${
                    selectedCategory === category
                      ? "bg-eco-600 text-white shadow-md transform scale-105"
                      : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}

          {/* Results Count */}
          {publishedBlogs.length > 0 && (
            <div className="text-center mb-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing {filteredPosts.length} of {publishedBlogs.length}{" "}
                {publishedBlogs.length === 1 ? "post" : "posts"}
              </p>
            </div>
          )}

          {/* Blog Posts Grid */}
          {filteredPosts.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="max-w-md mx-auto">
                <svg
                  className="h-16 w-16 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
                <p className="text-gray-500 dark:text-gray-300 text-lg font-medium mb-2">
                  No blog posts found
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-sm">
                  {publishedBlogs.length === 0
                    ? "No published blog posts available at the moment."
                    : searchQuery
                      ? `No results found for "${searchQuery}". Try a different search term.`
                      : selectedCategory !== "All"
                        ? `No posts in the "${selectedCategory}" category yet.`
                        : "No blog posts available."}
                </p>
                {(searchQuery || selectedCategory !== "All") && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("All");
                    }}
                    className="mt-4 px-4 py-2 text-eco-600 hover:text-eco-700 font-medium"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <article
                  key={post._id}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 flex flex-col h-full group"
                >
                  <div
                    className="relative h-52 overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/blog/${post.slug}`)}
                  >
                    <img
                      src={
                        post.featuredImage ||
                        "https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=800"
                      }
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=800";
                      }}
                    />
                    <div className="absolute top-4 left-4">
                      <span className="text-xs px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-eco-700 font-bold shadow-sm">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col grow">
                    <div className="flex items-center gap-2 mb-3 text-xs text-gray-500 dark:text-gray-400 font-medium">
                      <span>{post.readTime} min read</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      <span>
                        {format(new Date(post.createdAt), "MMM dd, yyyy")}
                      </span>
                    </div>
                    <h2
                      className="text-xl font-bold text-gray-900 dark:text-white mb-3 leading-tight hover:text-eco-600 dark:hover:text-eco-400 transition-colors cursor-pointer line-clamp-2"
                      onClick={() => navigate(`/blog/${post.slug}`)}
                    >
                      {post.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 line-clamp-3 grow">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-eco-100 flex items-center justify-center text-eco-600 font-bold text-xs">
                          {post.author?.charAt(0) || "A"}
                        </div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                          {post.author}
                        </p>
                      </div>
                      <button
                        onClick={() => navigate(`/blog/${post.slug}`)}
                        className="text-eco-600 hover:text-eco-700 font-bold text-sm flex items-center gap-1 group"
                      >
                        Read More
                        <span className="transform transition-transform group-hover:translate-x-1">
                          →
                        </span>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Footer Component */}
      <Footer />
    </div>
  );
};

export default Blog;
