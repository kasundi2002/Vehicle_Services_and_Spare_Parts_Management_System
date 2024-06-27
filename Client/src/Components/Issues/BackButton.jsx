import React from 'react';
import { Link } from 'react-router-dom';
import { BsArrowLeft } from 'react-icons/bs';

const BackButton = ({ destination = '/emergency' }) => {
  const styles = {
    backButton: {
      backgroundColor: '#4299e1', // Sky color
      color: '#FFFFFF', // White color for text
      padding: '8px 16px', // Padding for better spacing
      borderRadius: '8px', // Rounded corners
      display: 'inline-flex', // Display as inline-flex to fit content
      alignItems: 'center', // Align items to center vertically
      textDecoration: 'none', // Remove underline
      transition: 'background-color 0.3s ease', // Smooth transition for background color
    },
    backButtonHover: {
      backgroundColor: '#2c5282', // Lighter sky color on hover
    },
    arrowIcon: {
      fontSize: '24px', // Icon size
      marginRight: '8px', // Margin right for spacing between icon and text
    },
  };

  return (
    <div>
      <Link 
        to={destination} 
        style={styles.backButton}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2C7A7B'} // Change background color on hover
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4299e1'} // Reset background color on mouse out
      >
        <BsArrowLeft style={styles.arrowIcon} />
        Back
      </Link>
    </div>
  );
};

export default BackButton;
