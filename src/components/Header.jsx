import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../context/UserContext"; // Importa el contexto de usuario

function Header() {
  const { user, logout } = useContext(UserContext); // Accede al contexto de usuario

  return (
    <header className="flex justify-between items-center p-4 bg-gray-800 text-white">
      {/* Logo a la izquierda */}
      <div className="text-3xl font-bold">
        <span className="text-white">Air</span>
        <span className="text-blue-600">DB</span>
      </div>

      {/* Botones de Login, SignUp o Logout */}
      <div>
        {user ? (
          // Si el usuario está logueado, mostrar el botón de Cerrar sesión
          <button
            onClick={logout}
            className="text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md"
          >
            Cerrar sesión
          </button>
        ) : (
          // Si no está logueado, mostrar los botones de Login y SignUp
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