import React, { useState, useContext } from 'react';
import { supabase } from '../db/supabaseClient'; // Cliente de Supabase configurado
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext'; // Contexto del usuario

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null); // Para mostrar errores
  const [loading, setLoading] = useState(false); // Para mostrar el estado de carga

  const { setUser } = useContext(UserContext); // Acceder al estado global del usuario
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null); // Reseteamos el error

    try {
      // Consulta en la tabla 'pasajeros' para verificar las credenciales
      const { data: user, error: queryError } = await supabase
        .from('pasajeros')
        .select('*')
        .eq('email', email)
        .single(); // Recupera un único usuario que coincida con el correo

      if (queryError || !user) {
        setError('Correo o contraseña incorrectos.');
      } else if (user.contraseña !== password) {
        setError('Correo o contraseña incorrectos.');
      } else {
        console.log('Inicio de sesión exitoso:', user);

        // Almacenar el usuario en el contexto
        setUser(user);

        // Guardar el estado del usuario en localStorage para mantener la sesión
        localStorage.setItem('user', JSON.stringify(user));

        // Redirigir a la página de reservas
        navigate('/reserveFly');
      }
    } catch (err) {
      setError('Error al iniciar sesión: ' + err.message);
    } finally {
      setLoading(false); // Termina el estado de carga
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Iniciar Sesión</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
