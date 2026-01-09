import React, { useState, useEffect, useRef } from "react";

/**
 * Reusable Searchable Dropdown Component
 * @param {Array} options - Array of options with { value, label } structure
 * @param {String|Number} value - Current selected value
 * @param {Function} onChange - Callback when selection changes
 * @param {String} placeholder - Placeholder text
 * @param {String} label - Label for the dropdown
 * @param {Boolean} required - Whether field is required
 * @param {String} className - Additional CSS classes
 * @param {Boolean} loading - Whether data is loading
 * @param {String} noOptionsText - Text to show when no options available
 */
const SearchableDropdown = ({
  options = [],
  value,
  onChange,
  placeholder = "Select...",
  label,
  required = false,
  className = "",
  loading = false,
  noOptionsText = "No options available",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [displayText, setDisplayText] = useState("");
  const dropdownRef = useRef(null);

  // Update display text when value changes
  useEffect(() => {
    if (value) {
      const selected = options.find((opt) => opt.value == value);
      setDisplayText(selected ? selected.label : value.toString());
    } else {
      setDisplayText("");
    }
  }, [value, options]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option) => {
    onChange(option.value);
    setDisplayText(option.label);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("");
    setDisplayText("");
    setSearchTerm("");
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <div
          className="w-full border border-gray-300 rounded-md px-3 py-2 cursor-pointer bg-white hover:border-gray-400 transition-colors flex items-center justify-between"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className={displayText ? "text-gray-900" : "text-gray-400"}>
            {loading ? "Loading..." : displayText || placeholder}
          </span>
          <div className="flex items-center gap-2">
            {value && !loading && (
              <button
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600"
                type="button"
              >
                ✕
              </button>
            )}
            <svg
              className={`w-4 h-4 transition-transform ${
                isOpen ? "transform rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {isOpen && !loading && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
            <div className="p-2 border-b border-gray-200">
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                style={{ "--tw-ring-color": "var(--primary-color)" }}
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            </div>

            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-gray-500 text-sm">
                  {searchTerm ? "No results found" : noOptionsText}
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`px-3 py-2 cursor-pointer transition-colors ${
                      option.value == value ? "" : ""
                    }`}
                    style={{
                      backgroundColor:
                        option.value == value
                          ? "var(--primary-50)"
                          : "transparent",
                      ":hover": { backgroundColor: "var(--primary-50)" },
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        "var(--primary-50)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        option.value == value
                          ? "var(--primary-50)"
                          : "transparent")
                    }
                    onClick={() => handleSelect(option)}
                  >
                    <div className="font-medium text-gray-900">
                      {option.label}
                    </div>
                    {option.subtitle && (
                      <div className="text-xs text-gray-500">
                        {option.subtitle}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchableDropdown;
