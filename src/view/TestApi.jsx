import React, { useEffect, useState } from 'react';
import {supabase} from '/src/db/supabaseClient.js'; // Asegúrate de que la ruta sea correcta

function TestApi() {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase.from('aeropuertos').select('*');
        if (error) throw error;
        setData(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchData();
  }, []);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold mb-4">Prueba de Conexión a la API</h1>
      {data.length === 0 ? (
        <div>Cargando datos...</div>
      ) : (
        <ul className="list-disc pl-6">
          {data.map((aeropuerto) => (
            <li key={aeropuerto.id_aeropuerto}>
              {aeropuerto.nombre} ({aeropuerto.codigo_IATA}) - {aeropuerto.ciudad}, {aeropuerto.pais}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TestApi;
