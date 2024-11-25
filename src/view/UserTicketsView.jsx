import React, { useState, useEffect, useContext } from "react";
import { supabase } from "../db/supabaseClient";
import { UserContext } from "../context/UserContext";

function UserTicketsView() {
  const { user } = useContext(UserContext); // Obtener información del usuario desde el contexto
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true); // Estado para indicar la carga de datos

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);

      // Consulta para obtener los tickets del usuario actual, incluyendo los datos de pago
      const { data, error } = await supabase
        .from("tickets")
        .select(`
          id_ticket,
          numero_ticket,
          clase,
          precio,
          vuelos (
            numero_vuelo,
            fecha_salida,
            hora_salida,
            hora_llegada,
            origen,
            destino
          ),
          registro_de_pagos (
            fecha_pago,
            metodo_pago
          )
        `)
        .eq("id_pasajero", user.id_pasajero); // Filtrar por el ID del pasajero

      if (error) throw error;

      setTickets(data || []); // Guardar los tickets en el estado
    } catch (error) {
      console.error("Error al obtener los tickets:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Mis Tickets</h1>

      {loading ? (
        <p className="text-gray-700">Cargando tickets...</p>
      ) : tickets.length === 0 ? (
        <p className="text-gray-700">No tienes tickets registrados.</p>
      ) : (
        <table className="min-w-full bg-white border border-gray-300 rounded-lg">
          <thead>
            <tr className="bg-gray-200">
              <th className="text-left px-4 py-2 border-b"># Ticket</th>
              <th className="text-left px-4 py-2 border-b">Vuelo</th>
              <th className="text-left px-4 py-2 border-b">Fecha</th>
              <th className="text-left px-4 py-2 border-b">Hora Salida</th>
              <th className="text-left px-4 py-2 border-b">Hora Llegada</th>
              <th className="text-left px-4 py-2 border-b">Origen</th>
              <th className="text-left px-4 py-2 border-b">Destino</th>
              <th className="text-left px-4 py-2 border-b">Clase</th>
              <th className="text-left px-4 py-2 border-b">Precio</th>
              <th className="text-left px-4 py-2 border-b">Fecha Pago</th>
              <th className="text-left px-4 py-2 border-b">Método de Pago</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id_ticket} className="hover:bg-gray-100">
                <td className="px-4 py-2 border-b">{ticket.numero_ticket}</td>
                <td className="px-4 py-2 border-b">{ticket.vuelos.numero_vuelo}</td>
                <td className="px-4 py-2 border-b">{ticket.vuelos.fecha_salida}</td>
                <td className="px-4 py-2 border-b">{ticket.vuelos.hora_salida}</td>
                <td className="px-4 py-2 border-b">{ticket.vuelos.hora_llegada}</td>
                <td className="px-4 py-2 border-b">{ticket.vuelos.origen}</td>
                <td className="px-4 py-2 border-b">{ticket.vuelos.destino}</td>
                <td className="px-4 py-2 border-b">{ticket.clase}</td>
                <td className="px-4 py-2 border-b">${ticket.precio}</td>
                {/* Información del pago */}
                <td className="px-4 py-2 border-b">
                  {ticket.registro_de_pagos?.fecha_pago || "No disponible"}
                </td>
                <td className="px-4 py-2 border-b">
                  {ticket.registro_de_pagos?.metodo_pago || "No disponible"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default UserTicketsView;
