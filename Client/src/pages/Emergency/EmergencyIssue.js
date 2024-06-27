import React from "react";
import { Link } from "react-router-dom";
import backgroundImage from "../../assets/iss1.jpg"; // Import the background image

function EmergencyIssue() {
  return (
    <div style={{ ...styles.container, backgroundImage: `url(${backgroundImage})` }}>
      <div style={styles.overlay}>
        <h1 style={styles.title}> Issues</h1>
        <div style={styles.navbar}>
          <Link to="/issues/create" style={styles.navLink} className="nav-link">General Issues</Link>
          <Link to="/eme" style={styles.navLink} className="nav-link">Emergency Issues</Link>
          {/* Add more links as needed */}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: '8rem 5rem',
    borderRadius: '20px',
    textAlign: 'center',
    color: 'white',
  },
  title: {
    fontSize: '4rem',
    marginBottom: '4rem',
    marginTop: '-2rem',

  },
  navbar: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '2rem',
  },
  navLink: {
    margin: '0 40px',
    padding: '30px 50px',
    backgroundColor: '#4299e1',
    color: 'white',
    marginTop:'2rem',
    marginBottom: '1rem',
    textDecoration: 'none',
    borderRadius: '5px',
    fontSize: '1.8rem',
    transition: 'background-color 0.3s ease',
  },
  navLinkHover: {
    backgroundColor: '#3182ce',
  },
};

export default EmergencyIssue;
