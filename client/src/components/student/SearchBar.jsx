import React, { useState } from "react";
import { assets } from "../../assets/assets";
import { useNavigate } from "react-router-dom";

const SearchBar = ({ data }) => {
  const navigate = useNavigate();
  const [input, setInput] = useState(data || "");

  const onSearchHandler = (e) => {
    e.preventDefault();

    const searchValue = input.trim();

    if (!searchValue) {
      navigate("/course-list");
      return;
    }

    navigate(`/course-list/${encodeURIComponent(searchValue)}`);
  };

  return (
    <form
      onSubmit={onSearchHandler}
      className="
        w-full max-w-2xl
        flex items-center
        bg-white
        border border-gray-200
        rounded-2xl
        p-1.5
        shadow-sm
        hover:shadow-md
        focus-within:border-orange-400
        focus-within:ring-4
        focus-within:ring-orange-100
        transition-all duration-300
      "
    >
      {/* Search Icon */}
      <div className="flex items-center justify-center w-11 h-11 shrink-0">
        <img
          src={assets.search_icon}
          alt="Search"
          className="w-5 h-5 opacity-60"
        />
      </div>

      {/* Input */}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Search for courses..."
        className="
          flex-1
          min-w-0
          h-11
          px-2
          bg-transparent
          outline-none
          text-gray-800
          placeholder:text-gray-400
          text-sm sm:text-base
        "
      />

      {/* Search Button */}
      <button
        type="submit"
        className="
          shrink-0
          bg-orange-600
          hover:bg-orange-700
          active:scale-95
          text-white
          font-medium
          rounded-xl
          px-5 sm:px-8
          py-2.5
          transition-all duration-200
          shadow-sm
        "
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;