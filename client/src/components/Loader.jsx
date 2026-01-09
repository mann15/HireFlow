import React from "react";

const Loader = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div
        className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2"
        style={{ borderColor: "var(--primary-color)" }}
      ></div>
    </div>
  );
};

export default Loader;
