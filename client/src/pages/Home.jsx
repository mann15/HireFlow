import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-gray-50 p-8">
      <h1 className="text-4xl md:text-5xl font-bold text-[var(--secondary-color)] mb-4 text-center">
        Welcome to <span className="text-[var(--primary-color)]">HireFlow</span>
      </h1>
    </div>
  );
};

export default Home;
