import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';  // Importa useNavigate de react-router-dom

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate(); // Inicializa useNavigate

  // Cargar el usuario desde localStorage al inicializar la aplicación
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/'); // Redirige al inicio cuando se cierra sesión
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};
