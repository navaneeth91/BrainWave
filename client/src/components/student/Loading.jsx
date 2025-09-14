import React from 'react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useParams } from 'react-router-dom'

const Loading = () => {
  const {path}=useParams()
  const navigate=useNavigate();
    useEffect(()=>{
    if(path){
      const timer=setTimeout(()=>{  
        navigate('/'+path);
      },3000)
      return ()=>clearTimeout(timer);
    }
    
  }, []);

  return (
    <div className='flex items-center justify-center min-h-screen'>
      <div className='w-16 sm:w-20 aspect-square border-4 border-gray-300 border-t-4 border-t-orange-400 rounded-full animate-spin'></div>
    </div>
  )
}

export default Loading
