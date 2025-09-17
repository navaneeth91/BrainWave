import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const Loading = () => {
  const { path } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (path) {
      const timer = setTimeout(() => {
        navigate('/' + path);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [path, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <div className="relative w-20 h-20">
        {/* Outer ring */}
        <div className="absolute inset-0 border-4 border-orange-400 rounded-full animate-spin border-t-transparent"></div>
        {/* Inner ring */}
        <div className="absolute inset-3 border-4 border-gray-300 rounded-full animate-spin border-b-transparent" style={{ animationDuration: '1.5s' }}></div>
        {/* Center dot */}
        <div className="absolute inset-8 bg-orange-500 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};

export default Loading;
