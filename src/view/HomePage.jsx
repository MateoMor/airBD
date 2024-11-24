import React from 'react';
import { useNavigate } from 'react-router-dom';  // Usamos el hook useNavigate para redirigir

function HomePage() {
  const navigate = useNavigate();  // Inicializamos el hook useNavigate

  // Funciones para manejar la redirección
  const goToLogin = () => {
    navigate('/login');  // Redirige a la página de login
  };

  const goToSignUp = () => {
    navigate('/signup');  // Redirige a la página de sign up
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-8">Bienvenido a airDB</h1>
      <div className="flex flex-col gap-4">
        <button
          onClick={goToLogin}
          className="px-6 py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none"
        >
          Iniciar sesión
        </button>
        <button
          onClick={goToSignUp}
          className="px-6 py-3 text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none"
        >
          Crear cuenta
        </button>
      </div>
    </div>
  );
}

export default HomePage;
