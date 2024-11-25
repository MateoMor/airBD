import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";  // To get the flight ID from the URL
import { supabase } from "../db/supabaseClient";

function FlightDetailsView() {
  const { id_vuelo } = useParams();  // Get the flight ID from the URL
  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlightDetails();
  }, [id_vuelo]);

  const fetchFlightDetails = async () => {
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
        .eq("id_vuelo", id_vuelo)  // Filter by flight ID
        .single();

      if (error) throw error;

      setFlight(data || null);
    } catch (error) {
      console.error("Error fetching flight details:", error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-gray-700">Loading details...</p>;

  if (!flight) return <p className="text-gray-700">Flight not found.</p>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Flight Details {flight.numero_vuelo}</h1>
      
      <div className="mb-4">
        <p><strong>Origin:</strong> {flight.rutas.origen}</p>
        <p><strong>Destination:</strong> {flight.rutas.destino}</p>
        <p><strong>Departure Date:</strong> {flight.fecha_salida}</p>
        <p><strong>Departure Time:</strong> {flight.hora_salida}</p>
        <p><strong>Price:</strong> ${flight.precio}</p>
      </div>

      <h2 className="text-xl font-bold mb-2">Crew:</h2>
      <ul>
        {flight.tripulacion.map((crewMember, index) => (
          <li key={index}>
            <p><strong>{crewMember.rol}:</strong> {crewMember.nombre} {crewMember.apellido} ({crewMember.licencia})</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FlightDetailsView;
