// src/pages/Blog.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/common/Footer";
import Logo from "../components/common/Logo";

const Blog = () => {
  const navigate = useNavigate();

  const [posts] = useState([
    {
      id: 1,
      title: "Getting Started with IoT-Based Environmental Monitoring",
      date: "March 15, 2026",
      author: "Olivier CYUZUZO KWIZERA",
      excerpt:
        "Learn how to set up your first environmental monitoring station using our IoT sensors and dashboard.",
      imageUrl:
        "https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=800",
      readTime: "5 min read",
      category: "Tutorial",
    },
    {
      id: 2,
      title: "Understanding Ecosystem-Based Adaptation in Rwanda",
      date: "March 10, 2026",
      author: "Emmanuel NIYONGABO",
      excerpt:
        "Explore how EbA strategies are being implemented across Rwanda's wetland and reforestation sites.",
      imageUrl:
        "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800",
      readTime: "8 min read",
      category: "Research",
    },
    {
      id: 3,
      title: "Real-time Data Visualization Best Practices",
      date: "March 5, 2026",
      author: "Divine IRADUKUNDA",
      excerpt:
        "Tips and tricks for creating effective environmental data dashboards that drive decision-making.",
      imageUrl:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
      readTime: "6 min read",
      category: "Technical",
    },
    {
      id: 4,
      title: "Sensor Calibration and Maintenance Guide",
      date: "February 28, 2026",
      author: "Olivier CYUZUZO KWIZERA",
      excerpt:
        "A comprehensive guide to keeping your environmental sensors accurate and reliable.",
      imageUrl:
        "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800",
      readTime: "10 min read",
      category: "Guide",
    },
    {
      id: 5,
      title: "Climate Resilience Through Technology",
      date: "February 20, 2026",
      author: "Emmanuel NIYONGABO",
      excerpt:
        "How IoT and data analytics are helping Rwanda build climate-resilient communities.",
      imageUrl:
        "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800",
      readTime: "7 min read",
      category: "Insights",
    },
  ]);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const categories = [
    "All",
    "Tutorial",
    "Research",
    "Technical",
    "Guide",
    "Insights",
  ];

  const filteredPosts =
    selectedCategory === "All"
      ? posts
      : posts.filter((post) => post.category === selectedCategory);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="grow pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Logo - Centered and Clickable */}
          <div className="mb-8 flex justify-center cursor-pointer" onClick={() => navigate("/")}>
            <Logo />
          </div>

          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Technical Blog
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Insights, tutorials, and updates from the EBA System team
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all shadow-sm ${
                  selectedCategory === category
                    ? "bg-eco-600 text-white shadow-md transform scale-105"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Blog Posts Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full"
              >
                <div className="relative h-48 overflow-hidden group cursor-pointer" onClick={() => navigate(`/blog/${post.id}`)}>
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="text-xs px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-eco-700 font-bold shadow-sm">
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="p-6 flex flex-col grow">
                  <div className="flex items-center gap-2 mb-3 text-xs text-gray-500 font-medium">
                    <span>{post.readTime}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span>{post.date}</span>
                  </div>
                  <h2 
                    className="text-xl font-bold text-gray-900 mb-3 leading-tight hover:text-eco-600 transition-colors cursor-pointer"
                    onClick={() => navigate(`/blog/${post.id}`)}
                  >
                    {post.title}
                  </h2>
                  <p className="text-gray-600 mb-6 line-clamp-3 grow">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-eco-100 flex items-center justify-center text-eco-600 font-bold text-xs">
                        {post.author.charAt(0)}
                      </div>
                      <p className="text-sm font-medium text-gray-700">{post.author}</p>
                    </div>
                    <button 
                      onClick={() => navigate(`/blog/${post.id}`)}
                      className="text-eco-600 hover:text-eco-700 font-bold text-sm flex items-center gap-1 group"
                    >
                      Read More
                      <span className="transform transition-transform group-hover:translate-x-1">→</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
      {/* Footer Component */}
      <Footer />
    </div>
  );
};

export default Blog;
