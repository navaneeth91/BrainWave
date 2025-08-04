import React from 'react'
import { assets } from '../../assets/assets'

const CallToAction = () => {
  return (
    <div className='flex flex-col items-center gap-4 pt-10 pb-24 px-8 md:px-0'>
      <h1 className='text-xl md:text-4xl text-gray-800 font-semibold'>Your learning journey. On your time, on your terms.</h1>
      <p className='text-gray-500 sm:text-sm'>
        Brainwave is an online learning platform that lets you explore courses anytime, anywhere.
Whether you're at home or on the go, access learning materials that suit your schedule.
Gain new skills, track your progress, and grow at your own pace.
      </p>
      <div className='flex items-center  font-medium gap-6 mt-4'>
        <button className='px-10 py-3 rounded-md text-white bg-orange-600'> Get Started</button>
        <button className='flex item-center gap-2'>Learn more <img src={assets.arrow_icon} alt='arrow_icon'/> </button>
      </div>
    </div>
  )
}

export default CallToAction
