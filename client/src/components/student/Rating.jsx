import React, { useState, useEffect } from 'react';

const Rating = ({ initialrating, onrate }) => {
  const [rating, setRating] = useState(initialrating || 0);

  const handleRating = (value) => {
    setRating(value);
    if (onrate) {
      onrate(value);
    }
  };

  useEffect(() => {
    if (initialrating !== undefined) {
      setRating(initialrating);
    }
  }, [initialrating]);

  return (
    <div>
      {Array.from({ length: 5 }, (_, index) => {
        const starValue = index + 1;
        return (
          <span
            key={index}
            className={`text-xl sm:text-2xl cursor-pointer transition-colors ${
              starValue <= rating ? 'text-yellow-500' : 'text-gray-400'
            }`}
            onClick={() => handleRating(starValue)}
          >
            &#9733;
          </span>
        );
      })}
    </div>
  );
};

export default Rating;
