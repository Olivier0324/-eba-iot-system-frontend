// src/components/layout/MainLayout.jsx
import React from "react";
import Navbar from "../common/Navbar";
import Footer from "../common/Footer";

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="grow pt-16">{children}</main>
      <Footer />
    </div>
  );
};

export default MainLayout;
