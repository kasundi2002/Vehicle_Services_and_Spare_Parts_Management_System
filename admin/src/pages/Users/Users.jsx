import React from 'react'
import SignUp from '../Login/SignUp'
import UserList from './UserList'
import './Users.css'

const Users = () => {
  return (
    <div className='Users'>
      <UserList/>
      <SignUp/>
    </div>
  )
}

export default Users