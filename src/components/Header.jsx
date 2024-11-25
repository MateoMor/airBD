import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../context/UserContext"; // Import the user context

function Header() {
  const { user, logout } = useContext(UserContext); // Access the user context

  return (
    <header className="flex justify-between items-center p-4 bg-gray-800 text-white">
      {/* Logo on the left */}
      <div className="text-3xl font-bold">
        <Link to="/" className="text-white hover:text-blue-400">
          <span>Air</span>
          <span className="text-blue-600">DB</span>
        </Link>
      </div>

      {/* Navigation */}
      {user && (
        <nav className="flex gap-4">
          <Link
            to="/reserveFly"
            className="text-white hover:text-blue-400 px-4 py-2"
          >
            Book Flight
          </Link>
          <Link
            to="/misTickets"
            className="text-white hover:text-blue-400 px-4 py-2"
          >
            My Tickets
          </Link>
          <Link
              to="/availableFlights"
              className="text-white hover:text-blue-400 px-4 py-2"
            >
              Available Flights
            </Link>
        </nav>
      )}

      {/* Login, SignUp or Logout buttons */}
      <div>
        {user ? (
          // If the user is logged in, show the Logout button
          <button
            onClick={logout}
            className="text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md"
          >
            Logout
          </button>
        ) : (
          // If not logged in, show the Login and Sign Up buttons
          <div>
            <Link
              to="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white mx-2 px-4 py-2 rounded-md"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-green-600 hover:bg-green-700 text-white mx-2 px-4 py-2 rounded-md"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
