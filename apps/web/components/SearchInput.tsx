"use client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import apiClient from "@/lib/api";
import { sanitize } from "@/lib/sanitize";

const SearchInput = () => {
  const [searchInput, setSearchInput] = useState<string>("");
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const router = useRouter();

  // Function to fetch search suggestions from API
  useEffect(() => {
    if (searchInput.length >= 2) {
      setLoadingSuggestions(true);
      // Fetch suggestions from API
      apiClient.get(`/api/search/suggest?query=${encodeURIComponent(searchInput)}`)
        .then(response => response.json())
        .then(data => {
          setSuggestions(data.suggestions || []);
          setLoadingSuggestions(false);
        })
        .catch(error => {
          console.error('Error fetching search suggestions:', error);
          setSuggestions([]);
          setLoadingSuggestions(false);
        });
    } else {
      setSuggestions([]);
      setLoadingSuggestions(false);
    }
  }, [searchInput]);

  // Function to handle search submission
  const searchProducts = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Sanitize the search input before using it in URL
    const sanitizedSearch = sanitize(searchInput);
    if (sanitizedSearch.trim()) {
      router.push(`/search?q=${encodeURIComponent(sanitizedSearch)}`);
    }
    setSearchInput("");
    setSuggestions([]);
  };

  // Function to handle selecting a suggestion
  const handleSelectSuggestion = (suggestion: string) => {
    setSearchInput(suggestion);
    setSuggestions([]);
    // Submit the search when a suggestion is selected
    searchProducts(new FormEvent(new FormData()));
  };

  return (
    <>
      <div className="relative w-full">
        <label
          htmlFor="search-input"
          className="sr-only"
        >
          Search fishnets
        </label>
        <form className="flex w-full" onSubmit={searchProducts}>
          <input
            id="search-input"
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search fishnets, mesh sizes, materials..."
            className={`flex-1 min-w-0 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 px-4 py-3 text-sm ${isFocused ? "focus:border-blue-500" : ""} transition-all duration-200`}
          />
          <button
            type="submit"
            className="ml-2 px-4 py-3 bg-blue-600 text-white font-medium rounded-l-none rounded-r-xl hover:bg-blue-700 transition-colors hover:text-white shadow-md"
          >
            Search
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M10.5 10.5a6 6 0 100-12 6 6 0 000 12z"></path>
            </svg>
          </button>
        </form>

        {/* Search Suggestions Dropdown */}
        {isFocused && (suggestions.length > 0 || loadingSuggestions) && (
          <div className="absolute left-0 right-0 mt-1 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 overflow-hidden z-20">
            <div className="py-1">
              {loadingSuggestions ? (
                <div className="flex flex-col items-center py-2">
                  <div className="h-3 w-3 animate-spin border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  <span className="mt-1 text-sm text-gray-500">Searching...</span>
                </div>
              ) : (
                <div>
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                    >
                      {suggestion}
                    </div>
                  ))}
                  {suggestions.length === 0 && (
                    <div className="px-4 py-2 text-sm text-gray-500">
                      No suggestions found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SearchInput;
