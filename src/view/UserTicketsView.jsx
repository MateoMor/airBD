import React, { useState, useEffect, useContext } from "react";
import { supabase } from "../db/supabaseClient";
import { UserContext } from "../context/UserContext";

function UserTicketsView() {
  const { user } = useContext(UserContext); // Get user information from context
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true); // State to indicate data loading

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);

      // Query to get the user's tickets, including payment details
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
        .eq("id_pasajero", user.id_pasajero); // Filter by passenger ID

      if (error) throw error;

      setTickets(data || []); // Store tickets in state
    } catch (error) {
      console.error("Error fetching tickets:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">My Tickets</h1>

      {loading ? (
        <p className="text-gray-700">Loading tickets...</p>
      ) : tickets.length === 0 ? (
        <p className="text-gray-700">You have no tickets registered.</p>
      ) : (
        <table className="min-w-full bg-white border border-gray-300 rounded-lg">
          <thead>
            <tr className="bg-gray-200">
              <th className="text-left px-4 py-2 border-b"># Ticket</th>
              <th className="text-left px-4 py-2 border-b">Flight</th>
              <th className="text-left px-4 py-2 border-b">Date</th>
              <th className="text-left px-4 py-2 border-b">Departure Time</th>
              <th className="text-left px-4 py-2 border-b">Arrival Time</th>
              <th className="text-left px-4 py-2 border-b">Origin</th>
              <th className="text-left px-4 py-2 border-b">Destination</th>
              <th className="text-left px-4 py-2 border-b">Class</th>
              <th className="text-left px-4 py-2 border-b">Price</th>
              <th className="text-left px-4 py-2 border-b">Payment Date</th>
              <th className="text-left px-4 py-2 border-b">Payment Method</th>
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
                {/* Payment information */}
                <td className="px-4 py-2 border-b">
                  {ticket.registro_de_pagos?.fecha_pago || "Not available"}
                </td>
                <td className="px-4 py-2 border-b">
                  {ticket.registro_de_pagos?.metodo_pago || "Not available"}
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
