// src/pages/BlogPost.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Footer from "../components/common/Footer";
import Logo from "../components/common/Logo";
import ThemeToggleButton from "../components/common/ThemeToggleButton";
import { Calendar, User, ArrowLeft, Clock, Tag } from "lucide-react";
import { useGetBlogBySlugQuery } from "../services/api";
import { format } from "date-fns";

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { data: blogResponse, isLoading, error } = useGetBlogBySlugQuery(slug);

  // Extract blog from response
  const post = blogResponse?.data || blogResponse;

  // If post not found or error
  if (!isLoading && (error || !post)) {
    return (
      <div className="relative min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
        <div className="absolute top-4 right-4 left-4 z-50 flex justify-end sm:left-auto">
          <ThemeToggleButton className="shrink-0" />
        </div>
        <div className="grow pt-20 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Post Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              The blog post you're looking for doesn't exist or has been
              removed.
            </p>
            <button
              onClick={() => navigate("/blog")}
              className="px-6 py-2 bg-eco-600 text-white rounded-xl hover:bg-eco-700 transition-colors"
            >
              Back to Blog
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="relative min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
        <div className="absolute top-4 right-4 left-4 z-50 flex justify-end sm:left-auto">
          <ThemeToggleButton className="shrink-0" />
        </div>
        <div className="grow pt-20 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-eco-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  // Function to render markdown-like content (basic formatting)
  const renderContent = (content) => {
    if (!content) return "";

    // Split content into paragraphs
    const paragraphs = content.split("\n\n");

    return paragraphs.map((paragraph, index) => {
      // Check for headers
      if (paragraph.startsWith("## ")) {
        return (
          <h2
            key={index}
            className="text-2xl font-bold mb-4 mt-8 text-gray-900 dark:text-white"
          >
            {paragraph.substring(3)}
          </h2>
        );
      }
      if (paragraph.startsWith("### ")) {
        return (
          <h3
            key={index}
            className="text-xl font-semibold mb-3 mt-6 text-gray-900 dark:text-white"
          >
            {paragraph.substring(4)}
          </h3>
        );
      }

      // Check for lists
      if (paragraph.includes("\n- ")) {
        const lines = paragraph.split("\n");
        const listItems = lines
          .filter((line) => line.startsWith("- "))
          .map((line) => line.substring(2));
        return (
          <ul key={index} className="list-disc pl-6 mb-4 space-y-2">
            {listItems.map((item, i) => (
              <li key={i} className="text-gray-700 dark:text-gray-300">
                {item}
              </li>
            ))}
          </ul>
        );
      }

      // Regular paragraph
      if (paragraph.trim()) {
        return (
          <p key={index} className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
            {paragraph}
          </p>
        );
      }

      return null;
    });
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <div className="absolute top-4 right-4 left-4 z-50 flex justify-end sm:left-auto">
        <ThemeToggleButton className="shrink-0" />
      </div>
      <div className="grow pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Logo - Centered and Clickable */}
          <div
            className="mb-8 flex justify-center cursor-pointer"
            onClick={() => navigate("/")}
          >
            <Logo />
          </div>

          {/* Back Button */}
          <button
            onClick={() => navigate("/blog")}
            className="mb-8 flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-eco-600 dark:hover:text-eco-400 transition-colors font-medium"
          >
            <ArrowLeft size={20} />
            Back to Blog
          </button>

          {/* Hero Image */}
          {post.featuredImage && (
            <div className="mb-8 rounded-2xl overflow-hidden shadow-lg">
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-64 md:h-96 object-cover"
                onError={(e) => {
                  e.target.src =
                    "https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=1200";
                }}
              />
            </div>
          )}

          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-block px-3 py-1 rounded-full bg-eco-100 dark:bg-eco-900/40 text-eco-700 dark:text-eco-300 text-xs font-bold">
                {post.category || "Uncategorized"}
              </span>
              {post.tags &&
                post.tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-block px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs"
                  >
                    #{tag}
                  </span>
                ))}
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
              {post.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-gray-500 dark:text-gray-400 text-sm">
              <div className="flex items-center gap-2">
                <User size={18} />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={18} />
                <span>{format(new Date(post.createdAt), "MMMM dd, yyyy")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={18} />
                <span>{post.readTime} min read</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <article className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300 leading-relaxed dark:prose-invert">
            {renderContent(post.content)}
          </article>

          {/* Tags Section */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Tag size={18} className="text-gray-400 dark:text-gray-500" />
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Tags:
                </span>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-sm text-eco-600 dark:text-eco-400 bg-eco-50 dark:bg-eco-950/40 px-2 py-1 rounded-lg"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BlogPost;
