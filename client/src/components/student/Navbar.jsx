import React, { useContext } from 'react'
import {assets} from '../../assets/assets'
import { Link } from 'react-router-dom'
import { useClerk ,UserButton,useUser} from '@clerk/clerk-react'
import { AppContext } from '../../context/AppContext'


const Navbar = () => {

  const isCourseListpage=location.pathname.includes('/course-list');

  const {openSignIn} = useClerk();
  const {user} = useUser();

  const {navigate,isEducator} = useContext(AppContext);

  return (
    <div className={`flex items-center justify-between px-4 sm:px-10 md:px-14 lg:px-36 border-b border-gray-500 py-4 ${isCourseListpage ? 'bg-white' : 'bg-orange-200/70'}`}>
       <img onClick={()=>navigate('/')} src={assets.logo
       } alt="Logo" className='w-48 h-auto  lg:w-56 cursor-pointer' />
       <div className='hidden md:flex items-center gap-5 text-gray-600'> 
          <div className='flex items-center gap-3'>
           {   user &&<>
               <button onClick={()=>{navigate('/educator')}}>{isEducator?'Educator Dashboard':'Become Educator'}</button>|
            <Link to='/my-enrollments'>My Enrollments</Link>
            </>
            }
          </div>
          { user?<UserButton/>:
            <button onClick={()=>openSignIn()} className='bg-orange-500 text-white px-4 py-2 
          rounded-md hover:bg-blue-600 transition duration-300'>Create Account</button>}
       </div>
       {/* Mobile view */}
       <div className='md:hidden flex items-center gap-3'>
        <div className='flex items-center gap-3'>
          {user && 
          <>
           <button onClick={()=>{navigate('/educator')}}>{isEducator?'Educator Dashboard':'Become Educator'}</button>|
            <Link to='/my-enrollments'>My Enrollments</Link>
          </>
          }
           
          </div>
          { user ?
          <UserButton/>:
          <button onClick={()=>openSignIn()}><img src={assets.user_icon} alt="" /></button>
          }
       </div>
    </div>
  )
}

export default Navbar
