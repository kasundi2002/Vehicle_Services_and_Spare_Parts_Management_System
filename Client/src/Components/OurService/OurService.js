import React from 'react'
import './OurService.css'
import Services from '../../assets/Service/Services'

function OurService() {
  return (
    <div>
        <section>
      <div className='container'>
        <h1>OUR SERVICES</h1>
        <div className='cards'>
        {Services.map((service) => (
            <div key={service}  className='card'>
                <img className="img" src={service.Image} alt="" />
                <h2>{service.Name}</h2>
                <p>{service.About}</p>
                <button className='btn'>Read More</button>
            </div>
        ))}
        </div>
      </div>
      </section>
    </div>
  );
}

export default OurService;
