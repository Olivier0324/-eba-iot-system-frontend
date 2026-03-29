// src/pages/LandingPage.jsx
import React, { useState, useEffect } from "react";
import {
  Eye,
  Leaf,
  Users,
  Target,
  Award,
  Quote,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Twitter,
  ArrowRight,
  Droplets,
  Thermometer,
  Wind,
  Activity,
  CheckCircle,
  BarChart3,
  Database,
  Wifi,
  Menu,
  X,
  BookOpen,
  FileText,
  Code,
  BookMarked,
  HelpCircle,
  Shield,
  Zap,
  Globe,
  Facebook,
  Youtube,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../components/common/Logo";

// Testimonial Data
const testimonials = [
  {
    id: 1,
    name: "Dr. Marie Uwimana",
    role: "Environmental Scientist, REMA",
    content:
      "This IoT monitoring system has transformed how we track wetland restoration progress. The real-time data provides invaluable insights that manual surveys simply couldn't deliver.",
    image:
      "https://ui-avatars.com/api/?background=2E7D32&color=fff&size=100&name=MU",
  },
  {
    id: 2,
    name: "Jean Paul Niyonsaba",
    role: "Project Manager, MINAGRI",
    content:
      "The dashboard is intuitive and the data reliability is exceptional. We're now able to make evidence-based decisions for our reforestation programs.",
    image:
      "https://ui-avatars.com/api/?background=2E6B9E&color=fff&size=100&name=JN",
  },
  {
    id: 3,
    name: "Claudine Mukamana",
    role: "Field Officer, RFA",
    content:
      "As someone working in the field, having real-time access to soil moisture and water level data has been a game-changer for our conservation efforts.",
    image:
      "https://ui-avatars.com/api/?background=1B5E20&color=fff&size=100&name=CM",
  },
];

// Team Members
const teamMembers = [
  {
    name: "CYUZUZO KWIZERA Olivier",
    role: "Lead Developer & System Architect",
    regNumber: "222003124",
    image:
      "https://ui-avatars.com/api/?background=2E7D32&color=fff&size=100&name=CO",
  },
  {
    name: "NIYONGABO Emmanuel",
    role: "Hardware Engineer & Sensor Integration",
    regNumber: "222015291",
    image:
      "https://ui-avatars.com/api/?background=2E6B9E&color=fff&size=100&name=NE",
  },
  {
    name: "IRADUKUNDA Divine",
    role: "Data Analyst & Dashboard Developer",
    regNumber: "222011709",
    image:
      "https://ui-avatars.com/api/?background=1B5E20&color=fff&size=100&name=ID",
  },
];

const LandingPage = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
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

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length,
    );
  };

  const navLinks = [
    { name: "Home", id: "home", icon: Eye },
    { name: "About", id: "about", icon: BookOpen },
    { name: "Features", id: "features", icon: Zap },
    { name: "Team", id: "team", icon: Users },
    { name: "Testimonials", id: "testimonials", icon: Quote },
  ];

  const resourceLinks = [
    { name: "API Documentation", icon: Code, href: "/docs" },
    { name: "Technical Blog", icon: BookMarked, href: "/blog" },
    { name: "Research Papers", icon: FileText, href: "/research" },
    { name: "GitHub Repository", icon: Github, href: "https://github.com" },
    { name: "Support Forum", icon: HelpCircle, href: "/support" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Logo fn={() => scrollToSection("home")} />
            

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
              <a
                href="/dashboard"
                className="px-4 py-2 bg-eco-600 text-white rounded-lg text-sm font-medium hover:bg-eco-700 transition-all shadow-sm"
              >
                Dashboard
              </a>
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
                    <link.icon size={18} />
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
                <a
                  href="/dashboard"
                  className="block w-full text-center px-4 py-3 bg-eco-600 text-white rounded-lg font-medium hover:bg-eco-700 transition-colors"
                >
                  Go to Dashboard
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section
        id="home"
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-linear-to-br from-eco-50 via-white to-ocean-50 pt-16"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-eco-200 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-ocean-200 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 bg-eco-100 text-eco-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Eye size={16} />
                IoT-Based Environmental Monitoring
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Monitoring Ecosystem-Based
                <span className="bg-linear-to-r from-eco-600 to-ocean-600 bg-clip-text text-transparent block mt-2">
                  Adaptation
                </span>
                in Real-Time
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Transforming environmental monitoring through IoT technology.
                Collect, analyze, and visualize real-time data for wetland
                restoration, reforestation, and climate resilience.
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <a
                  href="/dashboard"
                  className="px-8 py-3 bg-eco-600 text-white rounded-xl font-medium hover:bg-eco-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  Explore Dashboard <ArrowRight size={18} />
                </a>
                <button
                  onClick={() => scrollToSection("about")}
                  className="px-8 py-3 border-2 border-eco-600 text-eco-600 rounded-xl font-medium hover:bg-eco-50 transition-all"
                >
                  Learn More
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-eco-50 rounded-xl p-4 text-center">
                    <Droplets className="h-8 w-8 text-eco-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">
                      25.3°C
                    </div>
                    <div className="text-sm text-gray-500">Temperature</div>
                  </div>
                  <div className="bg-ocean-50 rounded-xl p-4 text-center">
                    <Wind className="h-8 w-8 text-ocean-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">
                      74.2%
                    </div>
                    <div className="text-sm text-gray-500">Humidity</div>
                  </div>
                  <div className="bg-teal-50 rounded-xl p-4 text-center">
                    <Activity className="h-8 w-8 text-teal-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">
                      892 ppm
                    </div>
                    <div className="text-sm text-gray-500">CO₂ Level</div>
                  </div>
                  <div className="bg-yellow-50 rounded-xl p-4 text-center">
                    <Droplets className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">38%</div>
                    <div className="text-sm text-gray-500">Soil Moisture</div>
                  </div>
                </div>
                <div className="h-32 bg-linear-to-r from-eco-500 to-ocean-500 rounded-xl flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-sm">Live Data Stream</div>
                    <div className="text-xs opacity-80">
                      Updated every 60 seconds
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-center text-sm text-gray-500">
                  Real-time data from Nyagatare Wetland Site
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "3", label: "Active Monitoring Sites", icon: MapPin },
              {
                number: "5+",
                label: "Environmental Parameters",
                icon: Activity,
              },
              { number: "24/7", label: "Real-time Monitoring", icon: Wifi },
              { number: "100%", label: "Data Reliability", icon: CheckCircle },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <stat.icon className="h-8 w-8 text-eco-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-900">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              About the Project
            </h2>
            <div className="w-20 h-1 bg-eco-600 mx-auto"></div>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-gray-600 leading-relaxed mb-4">
                This IoT-based monitoring system is designed to address the
                critical gap in Monitoring and Evaluation (M&E) of
                Ecosystem-Based Adaptation interventions in Rwanda. By
                leveraging sensor technology and cloud computing, we provide
                continuous, real-time data on key environmental indicators.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                The system supports adaptive management of wetland restoration,
                reforestation, and radical terracing projects, enabling
                policymakers and conservation practitioners to make informed,
                data-driven decisions for climate resilience.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="border-l-4 border-eco-500 pl-4">
                  <div className="text-2xl font-bold text-gray-900">100%</div>
                  <div className="text-sm text-gray-500">Data Uptime</div>
                </div>
                <div className="border-l-4 border-ocean-500 pl-4">
                  <div className="text-2xl font-bold text-gray-900">24/7</div>
                  <div className="text-sm text-gray-500">Monitoring</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="bg-linear-to-br from-eco-50 to-ocean-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Project Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between pb-2 border-b border-gray-200">
                    <span className="text-gray-500">Institution:</span>
                    <span className="text-gray-900 font-medium">
                      University of Rwanda, College of Science and Technology
                    </span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-gray-200">
                    <span className="text-gray-500">School:</span>
                    <span className="text-gray-900 font-medium">
                      School of ICT
                    </span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-gray-200">
                    <span className="text-gray-500">Department:</span>
                    <span className="text-gray-900 font-medium">
                      Information Systems
                    </span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-gray-200">
                    <span className="text-gray-500">Supervisor:</span>
                    <span className="text-gray-900 font-medium">
                      Dr. Martin KURADUSENGE
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Year:</span>
                    <span className="text-gray-900 font-medium">2026</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Mission & Objectives */}
          <div className="grid lg:grid-cols-2 gap-12 mt-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
            >
              <Target className="h-12 w-12 text-eco-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Our Mission
              </h3>
              <p className="text-gray-600 leading-relaxed">
                To transform environmental monitoring for Ecosystem-Based
                Adaptation interventions through innovative IoT technology,
                providing real-time, accurate, and accessible data to support
                evidence-based decision-making for climate resilience in Rwanda.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
            >
              <Award className="h-12 w-12 text-ocean-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Key Objectives
              </h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle
                    size={18}
                    className="text-eco-600 mt-0.5 shrink-0"
                  />
                  <span>
                    Deploy IoT sensors for real-time environmental data
                    collection
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle
                    size={18}
                    className="text-eco-600 mt-0.5 shrink-0"
                  />
                  <span>
                    Develop cloud-based platform for data aggregation and
                    storage
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle
                    size={18}
                    className="text-eco-600 mt-0.5 shrink-0"
                  />
                  <span>
                    Create intuitive dashboard for data visualization and
                    analysis
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle
                    size={18}
                    className="text-eco-600 mt-0.5 shrink-0"
                  />
                  <span>
                    Support evidence-based decision-making for climate
                    adaptation
                  </span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              System Features
            </h2>
            <div className="w-20 h-1 bg-eco-600 mx-auto"></div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Database,
                title: "Real-Time Monitoring",
                description:
                  "Continuous data collection from IoT sensors deployed in EbA sites",
                color: "from-eco-500 to-eco-600",
              },
              {
                icon: BarChart3,
                title: "Advanced Analytics",
                description:
                  "Interactive dashboards with charts, graphs, and statistical analysis",
                color: "from-ocean-500 to-ocean-600",
              },
              {
                icon: Wifi,
                title: "Wireless Connectivity",
                description:
                  "Cellular and LPWAN technology for remote site connectivity",
                color: "from-teal-500 to-teal-600",
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all group"
              >
                <div
                  className={`w-14 h-14 rounded-xl bg-linear-to-br ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet the Team
            </h2>
            <div className="w-20 h-1 bg-eco-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">
              Group 8 - Dedicated to Environmental Innovation
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 text-center hover:shadow-lg transition-all"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-eco-200"
                />
                <h3 className="text-lg font-semibold text-gray-900">
                  {member.name}
                </h3>
                <p className="text-sm text-eco-600 mt-1">{member.role}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Reg: {member.regNumber}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Slider */}
      <section
        id="testimonials"
        className="py-20 bg-linear-to-br from-eco-50 to-ocean-50"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What People Say
            </h2>
            <div className="w-20 h-1 bg-eco-600 mx-auto"></div>
          </motion.div>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl p-8 shadow-xl"
              >
                <Quote className="h-12 w-12 text-eco-300 mb-6" />
                <p className="text-xl text-gray-600 italic mb-6">
                  "{testimonials[currentTestimonial].content}"
                </p>
                <div className="flex items-center gap-4">
                  <img
                    src={testimonials[currentTestimonial].image}
                    alt={testimonials[currentTestimonial].name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonials[currentTestimonial].name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {testimonials[currentTestimonial].role}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <button
              onClick={prevTestimonial}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-8 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-all"
            >
              <ChevronLeft size={24} className="text-gray-600" />
            </button>
            <button
              onClick={nextTestimonial}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-8 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-all"
            >
              <ChevronRight size={24} className="text-gray-600" />
            </button>
          </div>

          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentTestimonial(idx)}
                className={`w-2 h-2 rounded-full transition-all ${currentTestimonial === idx ? "w-8 bg-eco-600" : "bg-gray-300"}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
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
                  <a
                    href="/dashboard"
                    className="hover:text-eco-400 transition"
                  >
                    Dashboard
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="/docs" className="hover:text-eco-400 transition">
                    API Documentation
                  </a>
                </li>
                <li>
                  <a href="/blog" className="hover:text-eco-400 transition">
                    Technical Blog
                  </a>
                </li>
                <li>
                  <a href="/research" className="hover:text-eco-400 transition">
                    Research Papers
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com"
                    className="hover:text-eco-400 transition"
                  >
                    GitHub Repository
                  </a>
                </li>
                <li>
                  <a href="/support" className="hover:text-eco-400 transition">
                    Support Forum
                  </a>
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
    </div>
  );
};

export default LandingPage;
