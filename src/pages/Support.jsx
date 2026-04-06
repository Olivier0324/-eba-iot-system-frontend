// src/pages/Support.jsx
import React, { useState } from "react";
import {
  HelpCircle,
  MessageCircle,
  Mail,
  Phone,
  Clock,
  ExternalLink,
  ChevronDown,
  Send,
  CheckCircle,
  AlertCircle,
  User,
  Tag,
  FileText,
  Github,
  BookOpen,
  Headphones,
  Sparkles,
} from "lucide-react";
import Footer from "../components/common/Footer";
import Logo from "../components/common/Logo";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSubmitContactMessageMutation } from "../services/api";

const Support = () => {
  const navigate = useNavigate();
  const [submitMessage, { isLoading }] = useSubmitContactMessageMutation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    category: "technical",
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      await submitMessage({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        category: formData.category,
      }).unwrap();

      setSubmitted(true);
      toast.success(
        "Message sent successfully! We'll get back to you within 24 hours.",
      );

      setTimeout(() => {
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
          category: "technical",
        });
        setSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(
        error?.data?.message || "Failed to send message. Please try again.",
      );
    }
  };

  const faqs = [
    {
      question: "How do I access the sensor data dashboard?",
      answer:
        "After logging in, navigate to the Dashboard section where you'll find all real-time sensor readings and historical data visualizations.",
      icon: <LayoutDashboard size={18} />,
    },
    {
      question: "What sensors are currently supported?",
      answer:
        "Our system supports temperature, humidity, CO₂, soil moisture, and water level sensors. Additional sensors can be integrated upon request.",
      icon: <Thermometer size={18} />,
    },
    {
      question: "How often is data collected?",
      answer:
        "Data collection intervals are configurable from 5 seconds to 5 minutes. You can adjust this in the Control Panel section.",
      icon: <Clock size={18} />,
    },
    {
      question: "Can I export the data for my own analysis?",
      answer:
        "Yes! You can export sensor data as CSV files from the Sensor Data page, and generate PDF reports from the Reports section.",
      icon: <FileText size={18} />,
    },
    {
      question: "How do I set up alert thresholds?",
      answer:
        "Alert thresholds are pre-configured for each sensor type. For custom thresholds, please contact our support team.",
      icon: <AlertCircle size={18} />,
    },
  ];

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 to-teal-50">
        <div className="grow pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div
              className="mb-8 flex justify-center cursor-pointer"
              onClick={() => navigate("/")}
            >
              <Logo />
            </div>
            <div className="max-w-md mx-auto bg-white rounded-2xl p-8 shadow-xl text-center animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={40} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Message Sent!
              </h2>
              <p className="text-gray-600 mb-6">
                Thank you for reaching out. Our support team will get back to
                you within 24 hours.
              </p>
              <button
                onClick={() => navigate("/")}
                className="px-6 py-2.5 bg-gradient-to-r from-eco-600 to-eco-700 text-white rounded-xl hover:from-eco-700 hover:to-eco-800 transition-all font-medium"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-green-50">
      <div className="grow pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Logo */}
          <div
            className="mb-8 flex justify-center cursor-pointer"
            onClick={() => navigate("/")}
          >
            <Logo />
          </div>

          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-eco-100 text-eco-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Headphones size={16} />
              <span>24/7 Support Available</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
              How Can We Help?
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Get support for the EBA Monitoring System. Find answers to common
              questions or contact our team directly.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column: Contact Info */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-eco-100 rounded-xl">
                    <Mail size={20} className="text-eco-600" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Contact Information
                  </h2>
                </div>
                <div className="space-y-4">
                  <a
                    href="mailto:eba-system@ur.ac.rw"
                    className="flex items-center gap-3 text-gray-600 hover:text-eco-600 transition-colors p-3 rounded-xl hover:bg-gray-50 group"
                  >
                    <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-eco-100 transition-colors">
                      <Mail
                        size={18}
                        className="text-gray-500 group-hover:text-eco-600"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Email Us</p>
                      <p className="font-medium">eba-system@ur.ac.rw</p>
                    </div>
                  </a>
                  <a
                    href="tel:+250788123456"
                    className="flex items-center gap-3 text-gray-600 hover:text-eco-600 transition-colors p-3 rounded-xl hover:bg-gray-50 group"
                  >
                    <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-eco-100 transition-colors">
                      <Phone
                        size={18}
                        className="text-gray-500 group-hover:text-eco-600"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Call Us</p>
                      <p className="font-medium">+250 788 123 456</p>
                    </div>
                  </a>
                  <div className="flex items-center gap-3 text-gray-600 p-3 rounded-xl bg-gray-50">
                    <div className="p-2 bg-gray-200 rounded-lg">
                      <Clock size={18} className="text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Business Hours</p>
                      <p className="font-medium">Mon-Fri: 8:00 AM - 5:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-eco-50 to-teal-50 rounded-2xl p-6 border border-eco-100">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles size={20} className="text-eco-600" />
                  <h2 className="text-lg font-bold text-gray-900">
                    Quick Response
                  </h2>
                </div>
                <p className="text-gray-600 text-sm mb-3">
                  Our average response time is under 4 hours during business
                  days.
                </p>
                <div className="flex gap-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-eco-400"
                    ></div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-100 rounded-xl">
                    <ExternalLink size={20} className="text-purple-600" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Resources</h2>
                </div>
                <div className="space-y-2">
                  <a
                    href="http://localhost:3000/api-docs/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-600 hover:text-eco-600 transition-colors p-2 rounded-lg hover:bg-gray-50 group"
                  >
                    <FileText size={16} />
                    <span>API Documentation</span>
                    <ExternalLink
                      size={12}
                      className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </a>
                  <a
                    href="/blog"
                    className="flex items-center gap-3 text-gray-600 hover:text-eco-600 transition-colors p-2 rounded-lg hover:bg-gray-50 group"
                  >
                    <BookOpen size={16} />
                    <span>Technical Blog</span>
                    <ExternalLink
                      size={12}
                      className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </a>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-600 hover:text-eco-600 transition-colors p-2 rounded-lg hover:bg-gray-50 group"
                  >
                    <Github size={16} />
                    <span>GitHub Repository</span>
                    <ExternalLink
                      size={12}
                      className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: FAQ & Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* FAQ Section */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-yellow-100 rounded-xl">
                    <HelpCircle size={20} className="text-yellow-600" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Frequently Asked Questions
                  </h2>
                </div>
                <div className="space-y-3">
                  {faqs.map((faq, index) => (
                    <details
                      key={index}
                      className="group border border-gray-100 rounded-xl overflow-hidden"
                    >
                      <summary className="font-medium text-gray-800 cursor-pointer hover:text-eco-600 transition-colors list-none flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 select-none">
                        <div className="flex items-center gap-2">
                          <span className="text-eco-500">{faq.icon}</span>
                          <span>{faq.question}</span>
                        </div>
                        <ChevronDown
                          size={18}
                          className="text-gray-400 group-open:rotate-180 transition-transform duration-300"
                        />
                      </summary>
                      <div className="p-4 text-gray-600 bg-white border-t border-gray-100 leading-relaxed animate-in slide-in-from-top-2 duration-200">
                        {faq.answer}
                      </div>
                    </details>
                  ))}
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-eco-100 rounded-xl">
                    <MessageCircle size={20} className="text-eco-600" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Send us a Message
                  </h2>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <User size={14} className="inline mr-1" />
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className={`w-full px-4 py-2.5 rounded-xl border ${errors.name ? "border-red-500 focus:ring-red-500" : "border-gray-200 focus:ring-eco-500"} focus:outline-none focus:ring-2 transition-all`}
                        placeholder="John Doe"
                      />
                      {errors.name && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.name}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Mail size={14} className="inline mr-1" />
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className={`w-full px-4 py-2.5 rounded-xl border ${errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-200 focus:ring-eco-500"} focus:outline-none focus:ring-2 transition-all`}
                        placeholder="john@example.com"
                      />
                      {errors.email && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Tag size={14} className="inline mr-1" />
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) =>
                          setFormData({ ...formData, subject: e.target.value })
                        }
                        className={`w-full px-4 py-2.5 rounded-xl border ${errors.subject ? "border-red-500 focus:ring-red-500" : "border-gray-200 focus:ring-eco-500"} focus:outline-none focus:ring-2 transition-all`}
                        placeholder="How can we help?"
                      />
                      {errors.subject && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.subject}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-eco-500 transition-all bg-white"
                      >
                        <option value="technical">Technical Issue</option>
                        <option value="account">Account & Billing</option>
                        <option value="feature">Feature Request</option>
                        <option value="feedback">General Feedback</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FileText size={14} className="inline mr-1" />
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={5}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className={`w-full px-4 py-2.5 rounded-xl border ${errors.message ? "border-red-500 focus:ring-red-500" : "border-gray-200 focus:ring-eco-500"} focus:outline-none focus:ring-2 transition-all resize-y`}
                      placeholder="Please describe your issue in detail..."
                    />
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <AlertCircle size={12} />
                      Minimum 10 characters ({formData.message.length}/10)
                    </p>
                    {errors.message && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.message}
                      </p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-eco-600 to-eco-700 text-white py-3 rounded-xl font-bold hover:from-eco-700 hover:to-eco-800 transition-all shadow-md hover:shadow-lg transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

// Import missing icons
import { LayoutDashboard, Thermometer } from "lucide-react";

export default Support;
