import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";  // Importar Link para la navegación
import { supabase } from "../db/supabaseClient";

function AvailableFlightsView() {
  const [vuelos, setVuelos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVuelos();
  }, []);

  const fetchVuelos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("vuelos")
        .select(`
          id_vuelo,
          numero_vuelo,
          fecha_salida,
          hora_salida,
          precio,
          rutas (
            origen,
            destino
          )
        `);

      if (error) throw error;

      setVuelos(data || []);
    } catch (error) {
      console.error("Error al obtener los vuelos:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Vuelos Disponibles</h1>

      {loading ? (
        <p className="text-gray-700">Cargando vuelos...</p>
      ) : vuelos.length === 0 ? (
        <p className="text-gray-700">No hay vuelos disponibles en este momento.</p>
      ) : (
        <table className="min-w-full bg-white border border-gray-300 rounded-lg">
          <thead>
            <tr className="bg-gray-200">
              <th className="text-left px-4 py-2 border-b"># Vuelo</th>
              <th className="text-left px-4 py-2 border-b">Origen</th>
              <th className="text-left px-4 py-2 border-b">Destino</th>
              <th className="text-left px-4 py-2 border-b">Fecha</th>
              <th className="text-left px-4 py-2 border-b">Hora</th>
              <th className="text-left px-4 py-2 border-b">Precio</th>
              <th className="text-left px-4 py-2 border-b">Acciones</th> {/* Nueva columna para el botón */}
            </tr>
          </thead>
          <tbody>
            {vuelos.map((vuelo) => (
              <tr key={vuelo.id_vuelo} className="hover:bg-gray-100">
                <td className="px-4 py-2 border-b">{vuelo.numero_vuelo}</td>
                <td className="px-4 py-2 border-b">{vuelo.rutas.origen}</td>
                <td className="px-4 py-2 border-b">{vuelo.rutas.destino}</td>
                <td className="px-4 py-2 border-b">{vuelo.fecha_salida}</td>
                <td className="px-4 py-2 border-b">{vuelo.hora_salida}</td>
                <td className="px-4 py-2 border-b">${vuelo.precio}</td>
                <td className="px-4 py-2 border-b">
                  <Link
                    to={`/vuelo/${vuelo.id_vuelo}`}  // Enlace para la vista de detalles del vuelo
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Ver detalles
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AvailableFlightsView;
