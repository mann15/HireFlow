import React from "react";

const Home = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-gray-50 p-8">
      <h1 className="text-4xl md:text-5xl font-bold text-[var(--secondary-color)] mb-4 text-center">
        Welcome to <span className="text-[var(--primary-color)]">HireFlow</span>
      </h1>
      <p className="text-lg md:text-xl text-gray-600 max-w-2xl text-center mb-8">
        Streamline your recruitment process with our intuitive platform designed
        to connect talented candidates with great opportunities.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <a
          href="/login"
          className="px-8 py-3 rounded-lg bg-[var(--primary-color)] text-white font-medium hover:opacity-90 transition duration-200"
        >
          Get Started
        </a>
        <a
          href="#learn-more"
          className="px-8 py-3 rounded-lg border border-[var(--primary-color)] text-[var(--primary-color)] font-medium hover:bg-[var(--primary-color)] hover:bg-opacity-10 transition duration-200"
        >
          Learn More
        </a>
      </div>
    </div>
  );
};

export default Home;
