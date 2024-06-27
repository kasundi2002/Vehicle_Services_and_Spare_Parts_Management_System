// EmergencyIssue.js

import React from "react";
import backgroundImage from '../../assets/slider4.jpg';


function EmergencyIssue() {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.heading}>Emergency Vehicle Service</h1>
        <p style={styles.description}>
          If you have an emergency related to your vehicle, <br></br>please contact us <br></br>immediately at the following hotline number:
        </p>
        <p style={styles.hotline}>Hotline: +9477 527 5275</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundImage: `url(${backgroundImage})`, 
    backgroundSize: "cover",
    backgroundPosition: "center",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    textAlign: "center",
    color: "#fff",
  },
  heading: {
    fontSize: "3.4rem",
    marginBottom: "5.5rem",
    marginTop: '-2rem',
    color: '#0f0f3d',
  },
  description: {
    fontSize: "1.6rem",
    marginBottom: "3rem",
    color: '#000000'
  },
  hotline: {
    fontSize: "3.25rem",
    color: '#ff0000',
    marginTop: '7rem',

  },
};

export default EmergencyIssue;
