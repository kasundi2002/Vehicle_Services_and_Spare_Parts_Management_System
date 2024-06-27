import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Import jwtDecode to decode JWT tokens

const PrivateRoute = ({ allowedRoles }) => {
  // Check if user is authenticated
  const isAuthenticated = sessionStorage.getItem('authToken') !== null;

  // Retrieve user roles from the decoded JWT token
  let userRoles = [];

  if (isAuthenticated) {
    try {
      const token = sessionStorage.getItem('authToken');
      const decodedToken = jwtDecode(token);
      if (decodedToken && decodedToken.Admin && decodedToken.Admin.role) {
        // Ensure `userRoles` is always an array (even if single role string)
        userRoles = Array.isArray(decodedToken.Admin.role)
          ? decodedToken.Admin.role
          : [decodedToken.Admin.role];
      }
    } catch (error) {
      console.error('Error decoding JWT token:', error);
    }
  }

  // Function to check if user has any allowed role
  const hasAllowedRole = () => {
    // Convert `allowedRoles` to a Set for efficient lookup
    const allowedRolesSet = new Set(allowedRoles);
    // Check if any of the user's roles match any allowed role
    return userRoles.some(role => allowedRolesSet.has(role));
  };

  // Function to handle navigation to home page
  const navigateToHome = () => {
    // Display alert before navigating to home page
    window.alert('You are not authorized to access this page.');
    return <Navigate to="/home" />;
  };

  // Render based on authentication and role
  return isAuthenticated && hasAllowedRole() ? (
    <Outlet /> // Render nested routes if user is authenticated and has allowed role
  ) : (
    navigateToHome()
  );
};

export default PrivateRoute;

