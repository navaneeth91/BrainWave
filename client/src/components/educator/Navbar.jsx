import React from 'react'
import { assets } from '../../assets/assets'
import { UserButton, useUser } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { useContext } from 'react'
import { AppContext } from '../../context/AppContext'

const Navbar = () => {
  const { user } = useUser();

  return (
    <div className='flex items-center justify-between px-4 md:px-10 border-b border-gray-500 py-4'>
      <Link to='/'>
        <img
          src={assets.logo}
          alt="Logo"
          className='w-40 md:w-52 lg:w-64 h-auto cursor-pointer'
        />
      </Link>
      <div className='flex items-center gap-4 text-gray-600 relative'>
        <p>Hi | {user ? user.fullName : "Developers"}</p>
        {user ? <UserButton /> : (
          <img className='w-8 h-8 rounded-full' src={assets.profile_img} alt="User Icon" />
        )}
      </div>
    </div>
  )
}

export default Navbar
