// src/components/common/Navbar.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  BookOpen,
  Code,
  BookMarked,
  FileText,
  HelpCircle,
  Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "./Logo";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["home", "about", "features", "team", "testimonials"];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetBottom = offsetTop + element.offsetHeight;
          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: "Home", id: "home", icon: Eye },
    { name: "About", id: "about", icon: BookOpen },
    { name: "Features", id: "features" },
    { name: "Team", id: "team" },
    { name: "Testimonials", id: "testimonials" },
  ];

  const resourceLinks = [
    {
      name: "API Documentation",
      icon: Code,
      href: "http://localhost:3000/api-docs/",
    },
    { name: "Technical Blog", icon: BookMarked, href: "/blog" },
    { name: "Research Papers", icon: FileText, href: "/research" },
    { name: "GitHub Repository", icon: Code, href: "https://github.com" },
    { name: "Support Forum", icon: HelpCircle, href: "/support" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div
            className="cursor-pointer"
            onClick={() => scrollToSection("home")}
          >
            <Logo />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeSection === link.id
                    ? "bg-eco-50 text-eco-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-eco-600"
                }`}
              >
                {link.name}
              </button>
            ))}
          </div>

          {/* Desktop Right Links */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/dashboard"
              className="px-4 py-2 bg-eco-600 text-white rounded-lg text-sm font-medium hover:bg-eco-700 transition-all shadow-sm"
            >
              Dashboard
            </Link>
            <div className="relative group">
              <button className="flex items-center gap-1 px-3 py-2 text-gray-600 hover:text-eco-600 transition-colors">
                <BookOpen size={16} />
                <span className="text-sm">Resources</span>
              </button>
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                {resourceLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.href}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-eco-50 hover:text-eco-600 transition-colors"
                  >
                    <link.icon size={16} />
                    {link.name}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-100"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-gray-600 hover:bg-eco-50 hover:text-eco-600 transition-colors"
                >
                  <span>{link.name}</span>
                </button>
              ))}
              <div className="border-t border-gray-100 my-2"></div>
              {resourceLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-eco-50 hover:text-eco-600 transition-colors"
                >
                  <link.icon size={18} />
                  <span>{link.name}</span>
                </a>
              ))}
              <div className="border-t border-gray-100 my-2"></div>
              <Link
                to="/dashboard"
                className="block w-full text-center px-4 py-3 bg-eco-600 text-white rounded-lg font-medium hover:bg-eco-700 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Go to Dashboard
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
