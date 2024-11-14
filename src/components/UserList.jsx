// src/components/UserList.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../db/supabaseClient';

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      // Hacemos la consulta a Supabase
      const { data, error } = await supabase
        .from('users')
        .select('*');

      if (error) {
        console.error('Error al obtener usuarios:', error);
      } else {
        setUsers(data);
        console.log('Usuarios obtenidos:', data);
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);

  if (loading) return <p>Cargando usuarios...</p>;

  return (
    <div>
      <h1>Lista de Usuarios</h1>    
      <ul>  
        {users.map((user) => (
          <li key={user.id}>{user.nombre}</li>
        ))}
      </ul>
    </div>
  );
}

export default UserList;
