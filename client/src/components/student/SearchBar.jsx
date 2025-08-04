import React from 'react'
import { assets } from '../../assets/assets'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
const SearchBar = ({data}) => {
  const navigate= useNavigate();
  const [input,setInput]=useState(data?data: '');
  const onSearchhandler=(e)=>{
    e.preventDefault();
    navigate('/course-list/'+ input);
  }
  return (
    <div>
      <form   onSubmit={onSearchhandler} className='max-w-xl w-full flex items-center bg-white  border border-gray-500/20 rounded '>
        <img src={assets.search_icon} alt="search-icon" className='md:w-auto w-10px-3'/>
        <input type="text" onChange={e=>setInput(e.target.value)}  value={input} placeholder='Serach for Courses' className='w-full h-full outline-none text-gray-500/80 ' />
        <button type='submit' className='bg-orange-600 rounded text-white md:px-10 px-7 md:py-3 py-2 mx-1'>Search</button>
      </form>
    </div>
  )
}

export default SearchBar;
