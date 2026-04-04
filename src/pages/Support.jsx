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
} from "lucide-react";
import Footer from "../components/common/Footer";
import Logo from "../components/common/Logo";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Support = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const validateForm = () => {
    let isValid = true;

    // Name validation
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.subject.trim() ||
      !formData.message.trim()
    ) {
      toast.error("All fields are required");
    }

    // Email validation
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Email address is invalid");
      isValid = false;
    }

    if (formData.message.trim().length < 10) {
      toast.error("Message must be at least 10 characters long");
      isValid = false;
    }
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      // Handle form submission - send to backend or email
      console.log("Support request:", formData);

      // Show success toast
      toast.success(
        "Support request sent! We'll get back to you within 24 hours.",
      );

      setFormData({ name: "", email: "", subject: "", message: "" });
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-grow pt-20">
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
                  {[
                    {
                      label: "API Documentation",
                      href: "http://localhost:3000/api-docs/",
                    },
                    { label: "Technical Blog", href: "/blog" },
                    {
                      label: "GitHub Repository",
                      href: "https://github.com",
                      external: true,
                    },
                  ].map((link, index) => (
                    <a
                      key={index}
                      href={link.href}
                      target={link.external ? "_blank" : "_self"}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      className="flex items-center gap-3 text-gray-600 hover:text-eco-600 transition-colors p-2 rounded-lg hover:bg-gray-50 group"
                    >
                      <ExternalLink
                        size={18}
                        className="text-gray-400 group-hover:translate-x-1 transition-transform"
                      />
                      <span className="font-medium">{link.label}</span>
                    </a>
                  ))}
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
                        Name
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
                        Email
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
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700">
                      Subject
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
                      Message
                    </label>
                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-eco-500 focus:ring-2 focus:ring-eco-500/20 transition-all outline-none resize-y"
                      placeholder="Tell us more about your issue..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-eco-600 text-white py-3 rounded-xl font-bold hover:bg-eco-700 transition-all shadow-md hover:shadow-lg transform active:scale-[0.99]"
                  >
                    Send Message
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
