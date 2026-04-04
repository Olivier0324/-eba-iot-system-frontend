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

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Please enter your name");
      return false;
    }

    if (!formData.email.trim()) {
      toast.error("Please enter your email address");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    if (!formData.subject.trim()) {
      toast.error("Please enter a subject");
      return false;
    }

    if (!formData.message.trim()) {
      toast.error("Please enter your message");
      return false;
    }

    if (formData.message.trim().length < 10) {
      toast.error("Message must be at least 10 characters long");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
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

      // Reset form after 3 seconds
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
    },
    {
      question: "What sensors are currently supported?",
      answer:
        "Our system supports temperature, humidity, CO₂, soil moisture, and water level sensors. Additional sensors can be integrated upon request.",
    },
    {
      question: "How often is data collected?",
      answer:
        "Data collection intervals are configurable from 5 seconds to 5 minutes. You can adjust this in the Control Panel section.",
    },
    {
      question: "Can I export the data for my own analysis?",
      answer:
        "Yes! You can export sensor data as CSV files from the Sensor Data page, and generate PDF reports from the Reports section.",
    },
    {
      question: "How do I set up alert thresholds?",
      answer:
        "Alert thresholds are pre-configured for each sensor type. For custom thresholds, please contact our support team.",
    },
  ];

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <div className="grow pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div
              className="mb-8 flex justify-center cursor-pointer"
              onClick={() => navigate("/")}
            >
              <Logo />
            </div>
            <div className="max-w-md mx-auto bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600" />
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
                className="px-6 py-2 bg-eco-600 text-white rounded-xl hover:bg-eco-700 transition-colors"
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="grow pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Logo - Centered */}
          <div
            className="mb-8 flex justify-center cursor-pointer"
            onClick={() => navigate("/")}
          >
            <Logo />
          </div>

          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Support Forum
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Get help with the EBA Monitoring System. Find answers to common
              questions or contact our support team directly.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column: Contact Info */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Mail className="text-eco-600" size={20} />
                  Contact Us
                </h2>
                <div className="space-y-6">
                  <a
                    href="mailto:eba-system@ur.ac.rw"
                    className="flex items-center gap-3 text-gray-600 hover:text-eco-600 transition-colors p-2 rounded-lg hover:bg-gray-50"
                  >
                    <Mail size={20} className="text-gray-400" />
                    <span className="font-medium">eba-system@ur.ac.rw</span>
                  </a>
                  <a
                    href="tel:+250788123456"
                    className="flex items-center gap-3 text-gray-600 hover:text-eco-600 transition-colors p-2 rounded-lg hover:bg-gray-50"
                  >
                    <Phone size={20} className="text-gray-400" />
                    <span className="font-medium">+250 788 123 456</span>
                  </a>
                  <div className="flex items-center gap-3 text-gray-600 p-2">
                    <Clock size={20} className="text-gray-400" />
                    <span className="font-medium">
                      Mon-Fri: 8:00 AM - 5:00 PM
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <ExternalLink className="text-eco-600" size={20} />
                  Quick Links
                </h2>
                <div className="space-y-3">
                  <a
                    href="http://localhost:3000/api-docs/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-600 hover:text-eco-600 transition-colors p-2 rounded-lg hover:bg-gray-50 group"
                  >
                    <ExternalLink
                      size={18}
                      className="text-gray-400 group-hover:translate-x-1 transition-transform"
                    />
                    <span className="font-medium">API Documentation</span>
                  </a>
                  <a
                    href="/blog"
                    className="flex items-center gap-3 text-gray-600 hover:text-eco-600 transition-colors p-2 rounded-lg hover:bg-gray-50 group"
                  >
                    <ExternalLink
                      size={18}
                      className="text-gray-400 group-hover:translate-x-1 transition-transform"
                    />
                    <span className="font-medium">Technical Blog</span>
                  </a>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-600 hover:text-eco-600 transition-colors p-2 rounded-lg hover:bg-gray-50 group"
                  >
                    <ExternalLink
                      size={18}
                      className="text-gray-400 group-hover:translate-x-1 transition-transform"
                    />
                    <span className="font-medium">GitHub Repository</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: FAQ & Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* FAQ Section */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <HelpCircle size={24} className="text-eco-600" />
                  Frequently Asked Questions
                </h2>
                <div className="space-y-2">
                  {faqs.map((faq, index) => (
                    <details
                      key={index}
                      className="group border border-gray-100 rounded-xl overflow-hidden"
                    >
                      <summary className="font-medium text-gray-800 cursor-pointer hover:text-eco-600 transition-colors list-none flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 select-none">
                        <span>{faq.question}</span>
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
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <MessageCircle size={24} className="text-eco-600" />
                  Send us a Message
                </h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-gray-700">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-eco-500 focus:ring-2 focus:ring-eco-500/20 transition-all outline-none"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-gray-700">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-eco-500 focus:ring-2 focus:ring-eco-500/20 transition-all outline-none"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-gray-700">
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) =>
                          setFormData({ ...formData, subject: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-eco-500 focus:ring-2 focus:ring-eco-500/20 transition-all outline-none"
                        placeholder="How can we help?"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-gray-700">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-eco-500 focus:ring-2 focus:ring-eco-500/20 transition-all outline-none bg-white"
                      >
                        <option value="technical">Technical Issue</option>
                        <option value="account">Account & Billing</option>
                        <option value="feature">Feature Request</option>
                        <option value="feedback">General Feedback</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={5}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-eco-500 focus:ring-2 focus:ring-eco-500/20 transition-all outline-none resize-y"
                      placeholder="Please describe your issue in detail..."
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Minimum 10 characters
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-eco-600 text-white py-3 rounded-xl font-bold hover:bg-eco-700 transition-all shadow-md hover:shadow-lg transform active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

export default Support;
