// src/components/common/Navbar.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Menu,
  X,
  BookOpen,
  Code,
  BookMarked,
  HelpCircle,
  Github,
  Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "./Logo";
import ThemeModeSelector from "./ThemeModeSelector";
import {
  API_DOCUMENTATION_URL,
  FRONTEND_REPOSITORY_URL,
} from "../../constants/projectLinks";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

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
      name: "API documentation",
      icon: Code,
      href: API_DOCUMENTATION_URL,
      external: true,
    },
    {
      name: "Frontend on GitHub",
      icon: Github,
      href: FRONTEND_REPOSITORY_URL,
      external: true,
    },
    { name: "Technical Blog", icon: BookMarked, href: "/blog", external: false },
    { name: "Support", icon: HelpCircle, href: "/support", external: false },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm shadow-sm border-b border-gray-100 dark:border-gray-800">
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
                    ? "bg-eco-50 dark:bg-eco-950/40 text-eco-600 dark:text-eco-400"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-eco-600 dark:hover:text-eco-400"
                }`}
              >
                {link.name}
              </button>
            ))}
          </div>

          {/* Desktop Right Links */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeModeSelector variant="compact" className="shrink-0" />
            <Link
              to="/dashboard"
              className="px-4 py-2 bg-eco-600 text-white rounded-lg text-sm font-medium hover:bg-eco-700 transition-all shadow-sm"
            >
              Dashboard
            </Link>
            <div className="relative group">
              <button
                type="button"
                className="flex items-center gap-1 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-eco-600 dark:hover:text-eco-400 transition-colors"
              >
                <BookOpen size={16} />
                <span className="text-sm">Resources</span>
              </button>
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                {resourceLinks.map((link) => {
                  const itemClass =
                    "flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-eco-50 dark:hover:bg-gray-800 hover:text-eco-600 dark:hover:text-eco-400 transition-colors";
                  const inner = (
                    <>
                      <link.icon size={16} />
                      {link.name}
                    </>
                  );
                  return link.external ? (
                    <a
                      key={link.name}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={itemClass}
                    >
                      {inner}
                    </a>
                  ) : (
                    <Link key={link.name} to={link.href} className={itemClass}>
                      {inner}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
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
            className="md:hidden bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => scrollToSection(link.id)}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-eco-50 dark:hover:bg-gray-800 hover:text-eco-600 dark:hover:text-eco-400 transition-colors"
                >
                  <span>{link.name}</span>
                </button>
              ))}
              <div className="border-t border-gray-100 dark:border-gray-800 my-2" />
              <p className="px-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                Theme
              </p>
              <div className="px-2 pb-1">
                <ThemeModeSelector variant="compact" />
              </div>
              {resourceLinks.map((link) => {
                const itemClass =
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-eco-50 dark:hover:bg-gray-800 hover:text-eco-600 dark:hover:text-eco-400 transition-colors";
                const inner = (
                  <>
                    <link.icon size={18} />
                    <span>{link.name}</span>
                  </>
                );
                return link.external ? (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={itemClass}
                  >
                    {inner}
                  </a>
                ) : (
                  <Link
                    key={link.name}
                    to={link.href}
                    className={itemClass}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {inner}
                  </Link>
                );
              })}
              <div className="border-t border-gray-100 dark:border-gray-800 my-2" />
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
