// src/pages/BlogPost.jsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Footer from "../components/common/Footer";
import Logo from "../components/common/Logo";
import { Calendar, User, ArrowLeft, Clock } from "lucide-react";

const BlogPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // In a real app, you would fetch the post data using the ID from an API
  // For now, we use mock data based on the ID
  const mockPost = {
    1: {
      title: "Getting Started with IoT-Based Environmental Monitoring",
      date: "March 15, 2026",
      author: "Olivier CYUZUZO KWIZERA",
      category: "Tutorial",
      readTime: "5 min read",
      image:
        "https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=1200",
      content: `
        <p class="mb-4">Environmental monitoring is crucial for understanding and protecting our ecosystems. With the advent of Internet of Things (IoT) technology, we can now collect real-time data with unprecedented accuracy and frequency.</p>
        
        <h2 class="text-2xl font-bold mb-3 mt-6">Why IoT?</h2>
        <p class="mb-4">Traditional monitoring methods often rely on manual data collection, which is time-consuming and prone to human error. IoT sensors, on the other hand, can automatically collect data 24/7 and transmit it to a central dashboard for analysis.</p>
        
        <h2 class="text-2xl font-bold mb-3 mt-6">Setting Up Your First Station</h2>
        <p class="mb-4">To set up your first environmental monitoring station, you will need:</p>
        <ul class="list-disc pl-5 mb-4 space-y-2">
          <li>IoT sensors (temperature, humidity, etc.)</li>
          <li>A microcontroller (e.g., ESP32, Arduino)</li>
          <li>A power source (solar panel + battery)</li>
          <li>An internet connection (Wi-Fi, LoRaWAN, or Cellular)</li>
        </ul>
        
        <h2 class="text-2xl font-bold mb-3 mt-6">Data Visualization</h2>
        <p class="mb-4">Once your sensors are collecting data, the next step is to visualize it. Our dashboard provides real-time graphs and alerts, allowing you to spot trends and anomalies instantly.</p>
      `,
    },
    2: {
      title: "Understanding Ecosystem-Based Adaptation in Rwanda",
      date: "March 10, 2026",
      author: "Emmanuel NIYONGABO",
      category: "Research",
      readTime: "8 min read",
      image:
        "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200",
      content: `
        <p class="mb-4">Ecosystem-based Adaptation (EbA) is a nature-based solution that harnesses biodiversity and ecosystem services to help people adapt to the adverse effects of climate change.</p>
        <p class="mb-4">In Rwanda, EbA strategies are being implemented in various sectors, including agriculture, water management, and disaster risk reduction.</p>
      `,
    },
    // Add more mock posts as needed
  };

  const post = mockPost[id];

  // Handle case where post doesn't exist
  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <button
            onClick={() => navigate("/blog")}
            className="text-eco-600 hover:text-eco-700 font-medium"
          >
            Back to Blog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-grow pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Logo - Centered and Clickable */}
          <div className="mb-8 flex justify-center cursor-pointer" onClick={() => navigate("/")}>
            <Logo />
          </div>

          {/* Back Button */}
          <button
            onClick={() => navigate("/blog")}
            className="mb-8 flex items-center gap-2 text-gray-600 hover:text-eco-600 transition-colors font-medium"
          >
            <ArrowLeft size={20} />
            Back to Blog
          </button>

          {/* Hero Image */}
          <div className="mb-8 rounded-2xl overflow-hidden shadow-lg">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-64 md:h-96 object-cover"
            />
          </div>

          {/* Header */}
          <div className="mb-8">
            <span className="inline-block px-3 py-1 rounded-full bg-eco-100 text-eco-700 text-xs font-bold mb-4">
              {post.category}
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
              {post.title}
            </h1>
            
            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-gray-500 text-sm">
              <div className="flex items-center gap-2">
                <User size={18} />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={18} />
                <span>{post.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={18} />
                <span>{post.readTime}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <article className="prose prose-lg prose-eco max-w-none text-gray-700 leading-relaxed">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </article>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BlogPost;
