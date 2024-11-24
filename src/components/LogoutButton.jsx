import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate
import { UserContext } from '../context/UserContext';

function LogoutButton() {
  const { logout } = useContext(UserContext);
  const navigate = useNavigate(); // Inicializar useNavigate

  const handleLogout = () => {
    logout(); // Cierra la sesión (limpia el contexto y localStorage)
    navigate('/'); // Redirige a la página de inicio
  };

  return (
    <button onClick={handleLogout} className="btn-logout">
      Cerrar Sesión
    </button>
  );
}

export default LogoutButton;
