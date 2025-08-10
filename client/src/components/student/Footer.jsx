import React from 'react';
import { assets } from '../../assets/assets';

const Footer = () => {
  return (
    <footer className='bg-gradient-to-r from-orange-100 via-orange-200 to-orange-100 md:px-36 text-left w-full mt-10'>
      <div className='flex flex-col md:flex-row items-start px-8 md:px-0 justify-center gap-10 md:gap-32 py-10 border-b border-orange-300'>
        {/* Logo and Description */}
        <div className='flex flex-col md:items-start items-center w-full'>
          <img src={assets.logo} alt="Logo" className="w-40 h-auto lg:w-44 cursor-pointer" />
          <p className='mt-6 text-center md:text-left text-sm text-gray-800'>
            Learn anything, anytime, anywhere with Brainwave. Empower your learning journey with expert content and flexible access.
          </p>
        </div>

        {/* Company Links */}
        <div className='flex flex-col md:items-start items-center w-full'>
          <h2 className='font-semibold text-gray-900 mb-5'>Company</h2>
          <ul className='flex md:flex-col w-full justify-between text-sm text-gray-700 md:space-y-2'>
            <li><a href='#'>Home</a></li>
            <li><a href='#'>About Us</a></li>
            <li><a href='#'>Contact Us</a></li>
            <li><a href='#'>Privacy Policy</a></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className='hidden md:flex flex-col items-start w-full'>
          <h2 className='font-semibold text-gray-900 mb-5'>Subscribe to our newsletter</h2>
          <p className='text-sm text-gray-700'>
            The latest news, articles, and resources, sent to your inbox weekly.
          </p>
          <div className='flex items-center gap-2 pt-4'>
            <input
              type="email"
              placeholder='Enter your email'
              className='border border-orange-300 bg-orange-100 text-gray-800 placeholder-gray-500 outline-none w-64 h-9 rounded px-2 text-sm'
            />
            <button className='bg-orange-500 w-24 h-9 text-white rounded-md hover:bg-orange-600 transition duration-300'>
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <p className='py-4 text-center text-xs md:text-sm text-gray-600'>
        Copyright &copy; {new Date().getFullYear()} Brainwave. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
