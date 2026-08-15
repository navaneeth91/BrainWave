import React, { useEffect, useState } from "react";

const Rating = ({ initialrating = 0, onrate }) => {
  const [rating, setRating] = useState(initialrating);

  useEffect(() => {
    setRating(initialrating ?? 0);
  }, [initialrating]);

  const handleRating = (value) => {
    setRating(value);

    if (onrate) {
      onrate(value);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, index) => {
        const starValue = index + 1;
        const isActive = starValue <= rating;

        return (
          <button
            key={starValue}
            type="button"
            onClick={() => handleRating(starValue)}
            aria-label={`Rate ${starValue} out of 5`}
            className={`
              text-xl sm:text-2xl
              leading-none
              transition-all duration-200
              hover:scale-125
              focus:outline-none
              ${
                isActive
                  ? "text-orange-500 drop-shadow-sm"
                  : "text-gray-300 hover:text-orange-300"
              }
            `}
          >
            ★
          </button>
        );
      })}

      {rating > 0 && (
        <span className="ml-2 text-sm font-medium text-gray-500">
          {rating}/5
        </span>
      )}
    </div>
  );
};

export default Rating;