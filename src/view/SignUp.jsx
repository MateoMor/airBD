import React, { useState } from 'react';
import { supabase } from '../db/supabaseClient';  // Asegúrate de tener configurado el cliente de Supabase
import { useNavigate } from 'react-router-dom';  // Importamos useNavigate para la redirección

function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [documentoIdentidad, setDocumentoIdentidad] = useState('');
  const [error, setError] = useState(null); // Para mostrar errores
  const [loading, setLoading] = useState(false); // Para mostrar el estado de carga

  const navigate = useNavigate();  // Inicializamos el hook useNavigate

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);  // Reseteamos el error

    // Verificar si las contraseñas coinciden
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }

    try {
      // Primero crear el usuario en Supabase
      const { user, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message); // Mostrar mensaje de error
      } else {
        // Si el usuario se ha creado exitosamente, registrar sus datos adicionales en la tabla Pasajeros
        const { data, error: insertError } = await supabase
          .from('pasajeros')
          .insert([
            {
              nombre,
              apellido,
              email,
              telefono,
              documento_identidad: documentoIdentidad,
              contraseña: password,  // Nota: En un entorno real, no debes almacenar contraseñas en texto plano
            }
          ]);

        if (insertError) {
          setError('Error al guardar los datos del pasajero: ' + insertError.message);
        } else {
          console.log('Registro exitoso y datos guardados:', data);
          // Redirigimos al login después de un registro exitoso
          navigate('/login');  // Redirige a la ruta de login
        }
      }
    } catch (err) {
      setError('Error al registrar: ' + err.message);
    } finally {
      setLoading(false); // Termina el estado de carga
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Crear Cuenta</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
              Nombre
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="apellido" className="block text-sm font-medium text-gray-700">
              Apellido
            </label>
            <input
              type="text"
              id="apellido"
              name="apellido"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">
              Teléfono
            </label>
            <input
              type="text"
              id="telefono"
              name="telefono"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="documentoIdentidad" className="block text-sm font-medium text-gray-700">
              Documento de Identidad
            </label>
            <input
              type="text"
              id="documentoIdentidad"
              name="documentoIdentidad"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={documentoIdentidad}
              onChange={(e) => setDocumentoIdentidad(e.target.value)}
              required
            />
          </div>

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

          <div className="mb-4">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirmar Contraseña
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="********"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Crear Cuenta'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SignUp;
