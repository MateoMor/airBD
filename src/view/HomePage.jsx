import React from 'react';
import { useNavigate } from 'react-router-dom';  // Using the useNavigate hook for redirection

function HomePage() {
  const navigate = useNavigate();  // Initialize the useNavigate hook

  // Functions to handle redirection
  const goToLogin = () => {
    navigate('/login');  // Redirects to the login page
  };

  const goToSignUp = () => {
    navigate('/signup');  // Redirects to the sign-up page
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-8">Welcome to AirDB</h1>
      <div className="flex flex-col gap-4">
        <button
          onClick={goToLogin}
          className="px-6 py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none"
        >
          Login
        </button>
        <button
          onClick={goToSignUp}
          className="px-6 py-3 text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}

export default HomePage;
