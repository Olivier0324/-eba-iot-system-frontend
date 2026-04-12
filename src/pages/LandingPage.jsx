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
  Facebook,
  Youtube,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { useGetLatestDataQuery } from "../services/api";

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

// Calculate average from historical data (you can connect to your stats API for real averages)
const calculateAverage = (data, key) => {
  if (!data || data.length === 0) return "--";
  const values = data
    .map((item) => item[key])
    .filter((v) => v !== undefined && v !== null);
  if (values.length === 0) return "--";
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return avg.toFixed(1);
};

const LandingPage = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const { data: latestData, isLoading, refetch } = useGetLatestDataQuery();
  const [liveData, setLiveData] = useState({
    temperature: "--",
    humidity: "--",
    co2_ppm: "--",
    soil_moisture: "--",
    water_level: "--",
    interval_seconds: 60,
    last_updated: new Date(),
  });

  useEffect(() => {
    if (latestData) {
      if (latestData.data && latestData.data.temperature !== undefined) {
        const intervalSeconds = latestData.data.interval_ms
          ? Math.round(latestData.data.interval_ms / 1000)
          : 60;
        setLiveData({
          temperature:
            latestData.data.temperature !== undefined
              ? latestData.data.temperature
              : "--",
          humidity:
            latestData.data.humidity !== undefined
              ? latestData.data.humidity
              : "--",
          co2_ppm:
            latestData.data.co2_ppm !== undefined
              ? latestData.data.co2_ppm
              : "--",
          soil_moisture:
            latestData.data.soil_moisture_percent !== undefined
              ? latestData.data.soil_moisture_percent
              : "--",
          water_level:
            latestData.data.water_level_percent !== undefined
              ? latestData.data.water_level_percent
              : "--",
          interval_seconds: intervalSeconds,
          last_updated: new Date(),
        });
      } else if (latestData.temperature !== undefined) {
        const intervalSeconds = latestData.interval_ms
          ? Math.round(latestData.interval_ms / 1000)
          : 60;
        setLiveData({
          temperature:
            latestData.temperature !== undefined
              ? latestData.temperature
              : "--",
          humidity:
            latestData.humidity !== undefined ? latestData.humidity : "--",
          co2_ppm: latestData.co2_ppm !== undefined ? latestData.co2_ppm : "--",
          soil_moisture:
            latestData.soil_moisture_percent !== undefined
              ? latestData.soil_moisture_percent
              : "--",
          water_level:
            latestData.water_level_percent !== undefined
              ? latestData.water_level_percent
              : "--",
          interval_seconds: intervalSeconds,
          last_updated: new Date(),
        });
      }
    }
  }, [latestData]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 60000); // Refresh every 60 seconds

    return () => clearInterval(interval);
  }, [refetch]);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length,
    );
  };

  // For average values - you can connect to a stats endpoint
  // For now using placeholder values that will be replaced with actual API data
  const avgValues = {
    temperature: "--",
    humidity: "--",
    co2_ppm: "--",
    soil_moisture: "--",
    water_level: "--",
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Navbar />

      {/* Hero Section */}
      <section
        id="home"
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-linear-to-br from-eco-50 via-white to-ocean-50 dark:from-eco-950/50 dark:via-gray-950 dark:to-ocean-950/50 pt-16"
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
              <div className="inline-flex items-center gap-2 bg-eco-100 dark:bg-eco-900/45 text-eco-700 dark:text-eco-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Eye size={16} />
                IoT-Based Environmental Monitoring
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Monitoring Ecosystem-Based
                <span className="bg-linear-to-r from-eco-600 to-ocean-600 bg-clip-text text-transparent block mt-2">
                  Adaptation
                </span>
                in Real-Time
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
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
                  onClick={() =>
                    document
                      .getElementById("about")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="px-8 py-3 border-2 border-eco-600 text-eco-600 dark:border-eco-500 dark:text-eco-400 rounded-xl font-medium hover:bg-eco-50 dark:hover:bg-eco-950/40 transition-all"
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
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 border border-gray-100 dark:border-gray-800">
                {/* 5 Parameter Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                  {/* Temperature */}
                  <div className="bg-eco-50 dark:bg-eco-950/35 rounded-xl p-3 text-center">
                    <Thermometer className="h-6 w-6 text-eco-600 mx-auto mb-1" />
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {liveData.temperature !== "--"
                        ? `${liveData.temperature}°C`
                        : "--"}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Temperature</div>
                  </div>

                  {/* Humidity */}
                  <div className="bg-ocean-50 dark:bg-ocean-950/35 rounded-xl p-3 text-center">
                    <Droplets className="h-6 w-6 text-ocean-600 mx-auto mb-1" />
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {liveData.humidity !== "--"
                        ? `${liveData.humidity}%`
                        : "--"}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Humidity</div>
                  </div>

                  {/* CO₂ */}
                  <div className="bg-teal-50 dark:bg-teal-950/30 rounded-xl p-3 text-center">
                    <Wind className="h-6 w-6 text-teal-600 mx-auto mb-1" />
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {liveData.co2_ppm !== "--"
                        ? `${liveData.co2_ppm} ppm`
                        : "--"}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      CO<sub>2</sub>
                    </div>
                  </div>

                  {/* Soil Moisture */}
                  <div className="bg-yellow-50 dark:bg-yellow-950/25 rounded-xl p-3 text-center">
                    <Droplets className="h-6 w-6 text-yellow-600 mx-auto mb-1" />
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {liveData.soil_moisture !== "--"
                        ? `${liveData.soil_moisture}%`
                        : "--"}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Soil Moisture</div>
                  </div>

                  {/* Water Level */}
                  <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-3 text-center">
                    <Droplets className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {liveData.water_level !== "--"
                        ? `${liveData.water_level}%`
                        : "--"}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Water Level</div>
                  </div>
                </div>

                {/* Live Data Stream Bar */}
                <div className="h-28 bg-linear-to-r from-eco-500 to-ocean-500 rounded-xl flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-sm font-medium">Live Data Stream</div>
                    <div className="text-xs opacity-80 mt-1">
                      Updated every {liveData.interval_seconds} seconds
                    </div>
                    <div className="text-xs opacity-60 mt-1">
                      Last update:{" "}
                      {liveData.last_updated.toLocaleString(undefined, {
                        dateStyle: "short",
                        timeStyle: "medium",
                      })}
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  Real-time data from Nyabugogo wetland
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800">
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
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-50 dark:bg-gray-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
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
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                This IoT-based monitoring system is designed to address the
                critical gap in Monitoring and Evaluation (M&E) of
                Ecosystem-Based Adaptation interventions in Rwanda. By
                leveraging sensor technology and cloud computing, we provide
                continuous, real-time data on key environmental indicators.
              </p>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                The system supports adaptive management of wetland restoration,
                reforestation, and radical terracing projects, enabling
                policymakers and conservation practitioners to make informed,
                data-driven decisions for climate resilience.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="border-l-4 border-eco-500 pl-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">100%</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Data Uptime</div>
                </div>
                <div className="border-l-4 border-ocean-500 pl-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">24/7</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Monitoring</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              {/* Same surface tone in light and dark so label/value colors stay readable (no light panel + light text). */}
              <div className="rounded-xl p-6 bg-gray-50 dark:bg-gray-900/80 border border-gray-100 dark:border-gray-600">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Project Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-start sm:gap-4 pb-2 border-b border-gray-200 dark:border-gray-600">
                    <span className="shrink-0 text-gray-600 dark:text-gray-300 font-medium">
                      Institution:
                    </span>
                    <span className="text-gray-900 dark:text-gray-100 sm:text-right font-medium">
                      University of Rwanda, College of Science and Technology
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-start sm:gap-4 pb-2 border-b border-gray-200 dark:border-gray-600">
                    <span className="shrink-0 text-gray-600 dark:text-gray-300 font-medium">
                      School:
                    </span>
                    <span className="text-gray-900 dark:text-gray-100 sm:text-right font-medium">
                      School of ICT
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-start sm:gap-4 pb-2 border-b border-gray-200 dark:border-gray-600">
                    <span className="shrink-0 text-gray-600 dark:text-gray-300 font-medium">
                      Department:
                    </span>
                    <span className="text-gray-900 dark:text-gray-100 sm:text-right font-medium">
                      Information Systems
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-start sm:gap-4 pb-2 border-b border-gray-200 dark:border-gray-600">
                    <span className="shrink-0 text-gray-600 dark:text-gray-300 font-medium">
                      Supervisor:
                    </span>
                    <span className="text-gray-900 dark:text-gray-100 sm:text-right font-medium">
                      Dr. Martin KURADUSENGE
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-start sm:gap-4">
                    <span className="shrink-0 text-gray-600 dark:text-gray-300 font-medium">
                      Year:
                    </span>
                    <span className="text-gray-900 dark:text-gray-100 sm:text-right font-medium">
                      2026
                    </span>
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
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <Target className="h-12 w-12 text-eco-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Our Mission
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
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
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <Award className="h-12 w-12 text-ocean-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Key Objectives
              </h3>
              <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle
                    size={18}
                    className="text-eco-600 mt-0.5 shrink-0"
                  />
                  <span>
                    To identify and select critical, IoT-measurable
                    environmental indicators for monitoring the effectiveness of
                    wetland restoration and reforestation.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle
                    size={18}
                    className="text-eco-600 mt-0.5 shrink-0"
                  />
                  <span>
                    To develop an IoT device for the continuous collection
                    of real-time data on the selected indicators (e.g., soil
                    moisture, water level, water quality) from the target EbA
                    sites.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle
                    size={18}
                    className="text-eco-600 mt-0.5 shrink-0"
                  />
                  <span>
                    To integrate a cloud-based data management platform for
                    the seamless aggregation, storage, and processing of
                    transmitted sensor data.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle
                    size={18}
                    className="text-eco-600 mt-0.5 shrink-0"
                  />
                  <span>
                  To design and prototype a web-based application
                    dashboard for the visualization of real-time and historical
                    environmental data to support decision-making.
                  </span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
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
                className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all group"
              >
                <div
                  className={`w-14 h-14 rounded-xl bg-linear-to-br ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-20 bg-gray-50 dark:bg-gray-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Meet the Team
            </h2>
            <div className="w-20 h-1 bg-eco-600 mx-auto"></div>
            <p className="text-gray-500 dark:text-gray-400 mt-4">
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
                className="bg-white dark:bg-gray-900 rounded-2xl p-6 text-center hover:shadow-lg transition-all border border-transparent dark:border-gray-800"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-eco-200"
                />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {member.name}
                </h3>
                <p className="text-sm text-eco-600 mt-1">{member.role}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
        className="py-20 bg-linear-to-br from-eco-50 to-ocean-50 dark:from-eco-950/40 dark:to-ocean-950/40"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
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
                className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-gray-800"
              >
                <Quote className="h-12 w-12 text-eco-300 mb-6" />
                <p className="text-xl text-gray-600 dark:text-gray-300 italic mb-6">
                  "{testimonials[currentTestimonial].content}"
                </p>
                <div className="flex items-center gap-4">
                  <img
                    src={testimonials[currentTestimonial].image}
                    alt={testimonials[currentTestimonial].name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                      {testimonials[currentTestimonial].name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {testimonials[currentTestimonial].role}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <button
              onClick={prevTestimonial}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-8 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-gray-800 dark:text-gray-200"
            >
              <ChevronLeft size={24} className="text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={nextTestimonial}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-8 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-gray-800 dark:text-gray-200"
            >
              <ChevronRight size={24} className="text-gray-600 dark:text-gray-300" />
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
      <Footer />
    </div>
  );
};

export default LandingPage;
