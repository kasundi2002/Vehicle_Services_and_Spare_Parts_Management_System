import React from 'react'
import './Home.css';

const Home = () => {
  return (
    <div>
      <iframe className='home'
        src="http://localhost:3000/"
        title="Home Component"
        width="100%"
        height="500px"
        frameBorder="0"
      />
    </div>
  )
}

export default Home