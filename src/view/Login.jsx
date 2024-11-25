import React, { useState, useContext } from 'react';
import { supabase } from '../db/supabaseClient'; // Supabase client configured
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext'; // User context

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null); // To display errors
  const [loading, setLoading] = useState(false); // To show loading state

  const { setUser } = useContext(UserContext); // Access global user state
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null); // Reset error

    try {
      // Query the 'pasajeros' table to verify credentials
      const { data: user, error: queryError } = await supabase
        .from('pasajeros')
        .select('*')
        .eq('email', email)
        .single(); // Retrieves a single user matching the email

      if (queryError || !user) {
        setError('Incorrect email or password.');
      } else if (user.contraseña !== password) {
        setError('Incorrect email or password.');
      } else {
        console.log('Login successful:', user);

        // Store user in context
        setUser(user);

        // Save user state in localStorage to maintain session
        localStorage.setItem('user', JSON.stringify(user));

        // Redirect to the reservation page
        navigate('/reserveFly');
      }
    } catch (err) {
      setError('Error logging in: ' + err.message);
    } finally {
      setLoading(false); // End loading state
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Login</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
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
            {loading ? 'Loading...' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
