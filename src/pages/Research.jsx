// src/pages/Research.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/common/Footer";
import Logo from "../components/common/Logo";
import { FileText, ExternalLink, BookOpen } from "lucide-react";

const Research = () => {
  const navigate = useNavigate();

  // Mock data for Literature Review (Papers read for the project)
  const papers = [
    {
      id: 1,
      title: "IoT for Environmental Monitoring in Developing Regions",
      authors: "Dr. Jane Doe, John Smith",
      journal: "Journal of Environmental Informatics",
      year: "2023",
      summary: "This paper explores the challenges and opportunities of deploying low-cost IoT sensors in developing regions, providing a framework for sustainable environmental monitoring.",
      link: "#",
    },
    {
      id: 2,
      title: "Impact of Real-time Data on Conservation Policy",
      authors: "Dr. Alice Johnson, Robert Williams",
      journal: "Conservation Science Journal",
      year: "2023",
      summary: "An analysis of how real-time data streams influence policy-making decisions regarding biodiversity conservation and climate adaptation strategies.",
      link: "#",
    },
    {
      id: 3,
      title: "Low-Power Wide-Area Networks for Rural Sensing",
      authors: "Eng. Eric Kamanzi, Sarah Lee",
      journal: "IEEE Sensors Journal",
      year: "2022",
      summary: "Technical evaluation of LPWAN technologies (LoRaWAN, Sigfox) specifically for rural environmental sensing applications, focusing on energy efficiency and range.",
      link: "#",
    },
    {
      id: 4,
      title: "Ecosystem-Based Adaptation: A Review of Concepts and Practices",
      authors: "Prof. Robert Mugabo",
      journal: "Global Ecology and Conservation",
      year: "2021",
      summary: "A comprehensive review of Ecosystem-based Adaptation (EbA) definitions, methodologies, and case studies, serving as the theoretical foundation for our project.",
      link: "#",
    },
    {
      id: 5,
      title: "Data Visualization Techniques for Environmental Dashboards",
      authors: "Emily Chen, Mark Davis",
      journal: "UX for Science",
      year: "2022",
      summary: "Best practices for designing user-friendly dashboards that communicate complex environmental data effectively to non-technical stakeholders.",
      link: "#",
    },
  ];

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
              Literature Review
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              A collection of research papers, articles, and technical documents
              reviewed to inform the development of the EBA Monitoring System.
            </p>
          </div>

          {/* Publications / Papers List */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-eco-100 rounded-xl">
                  <BookOpen className="text-eco-600" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Reference Papers</h2>
                  <p className="text-sm text-gray-500">Key sources utilized for project research</p>
                </div>
              </div>
            </div>
            
            <div className="divide-y divide-gray-100">
              {papers.map((paper) => (
                <div
                  key={paper.id}
                  className="p-8 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Paper Icon/Number */}
                    <div className="shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-eco-50 text-eco-600 flex items-center justify-center font-bold text-lg border border-eco-100">
                        {paper.id}
                      </div>
                    </div>

                    {/* Paper Content */}
                    <div className="grow">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-3">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-eco-600 transition-colors leading-snug">
                          {paper.title}
                        </h3>
                        <a
                          href={paper.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-eco-600 hover:text-eco-700 font-semibold text-sm px-4 py-2 rounded-lg border border-eco-200 hover:bg-eco-50 transition-colors whitespace-nowrap h-fit"
                        >
                          Read Paper <ExternalLink size={16} />
                        </a>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <span className="font-medium text-gray-700">{paper.authors}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span>{paper.journal}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span>{paper.year}</span>
                      </div>

                      <p className="text-gray-600 leading-relaxed">
                        {paper.summary}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Footer Component */}
      <Footer />
    </div>
  );
};

export default Research;
