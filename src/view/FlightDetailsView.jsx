import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";  // Para obtener el ID del vuelo
import { supabase } from "../db/supabaseClient";

function FlightDetailsView() {
  const { id_vuelo } = useParams();  // Obtener el ID del vuelo de la URL
  const [vuelo, setVuelo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVueloDetails();
  }, [id_vuelo]);

  const fetchVueloDetails = async () => {
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
          ),
          tripulacion (
            nombre,
            apellido,
            rol,
            licencia
          )
        `)
        .eq("id_vuelo", id_vuelo)  // Filtrar por el ID del vuelo
        .single();

      if (error) throw error;

      setVuelo(data || null);
    } catch (error) {
      console.error("Error al obtener los detalles del vuelo:", error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-gray-700">Cargando detalles...</p>;

  if (!vuelo) return <p className="text-gray-700">Vuelo no encontrado.</p>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Detalles del Vuelo {vuelo.numero_vuelo}</h1>
      
      <div className="mb-4">
        <p><strong>Origen:</strong> {vuelo.rutas.origen}</p>
        <p><strong>Destino:</strong> {vuelo.rutas.destino}</p>
        <p><strong>Fecha de salida:</strong> {vuelo.fecha_salida}</p>
        <p><strong>Hora de salida:</strong> {vuelo.hora_salida}</p>
        <p><strong>Precio:</strong> ${vuelo.precio}</p>
      </div>

      <h2 className="text-xl font-bold mb-2">Tripulación:</h2>
      <ul>
        {vuelo.tripulacion.map((tripulante, index) => (
          <li key={index}>
            <p><strong>{tripulante.rol}:</strong> {tripulante.nombre} {tripulante.apellido} ({tripulante.licencia})</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FlightDetailsView;
