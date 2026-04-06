// src/components/common/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  Mail,
  Phone,
  MapPin,
  Twitter,
  Linkedin,
  Github,
  Facebook,
  Youtube,
} from "lucide-react";

const Footer = () => {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Eye className="h-8 w-8 text-eco-400" />
              <span className="text-xl font-bold">EBA OBSERVA</span>
            </div>
            <p className="text-gray-400 text-sm">
              IoT-based Monitoring System for Ecosystem-Based Adaptation in
              Rwanda
            </p>
            <div className="flex gap-3 mt-4">
              <a
                href="#"
                className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-eco-600 transition"
              >
                <Twitter size={14} />
              </a>
              <a
                href="#"
                className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-eco-600 transition"
              >
                <Linkedin size={14} />
              </a>
              <a
                href="#"
                className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-eco-600 transition"
              >
                <Github size={14} />
              </a>
              <a
                href="#"
                className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-eco-600 transition"
              >
                <Facebook size={14} />
              </a>
              <a
                href="#"
                className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-eco-600 transition"
              >
                <Youtube size={14} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <button
                  onClick={() => scrollToSection("home")}
                  className="hover:text-eco-400 transition"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("about")}
                  className="hover:text-eco-400 transition"
                >
                  About
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("features")}
                  className="hover:text-eco-400 transition"
                >
                  Features
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("team")}
                  className="hover:text-eco-400 transition"
                >
                  Team
                </button>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-eco-400 transition">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/api-docs" className="hover:text-eco-400 transition">
                  API Documentation
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-eco-400 transition">
                  Technical Blog
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-eco-400 transition"
                >
                  GitHub Repository
                </a>
              </li>
              <li>
                <Link to="/support" className="hover:text-eco-400 transition">
                  Support Forum
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <Mail size={14} />
                <span>eba-system@ur.ac.rw</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} />
                <span>+250 788 123 456</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={14} />
                <span>Kigali, Rwanda</span>
              </li>
            </ul>
            <div className="mt-4 pt-4 border-t border-gray-800">
              <p className="text-xs text-gray-500">
                College of Science and Technology
                <br />
                School of ICT | Department of Information Systems
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} EBA System - IoT-Based
            Environmental Monitoring. All rights reserved.
          </p>
          <p className="mt-1">
            Supervised by Dr. Martin KURADUSENGE | Group 8 | Department of
            Information Systems
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
