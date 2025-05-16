import { UserButton } from '@clerk/nextjs'
import React from 'react'

function Header() {
  return (
    <div className='flex justify-end p-4 shadow-md'>
      <UserButton />
    </div>
  )
}

export default Header