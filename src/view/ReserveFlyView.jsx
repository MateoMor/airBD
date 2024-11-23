import React, { useState, useEffect } from "react";
import {supabase} from "../db/supabaseClient"; // Importar configuración de Supabase

function ReserveFlyView() {
  const [rutas, setRutas] = useState([]);
  const [aeropuertos, setAeropuertos] = useState([]);
  const [selectedRuta, setSelectedRuta] = useState(null);
  const [passengerInfo, setPassengerInfo] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    documento_identidad: "",
  });

  useEffect(() => {
    // Cargar rutas y aeropuertos al montar el componente
    fetchRutas();
    fetchAeropuertos();
  }, []);

  const fetchRutas = async () => {
    const { data, error } = await supabase.from("rutas").select("*");
    if (error) console.error("Error fetching routes:", error);
    else setRutas(data);
  };

  const fetchAeropuertos = async () => {
    const { data, error } = await supabase.from("aeropuertos").select("*");
    if (error) console.error("Error fetching airports:", error);
    else setAeropuertos(data);
  };

  const handlePassengerChange = (e) => {
    setPassengerInfo({ ...passengerInfo, [e.target.name]: e.target.value });
  };

  const handleReserva = async () => {
    // Crear un nuevo pasajero y ticket en la base de datos
    try {
      const { data: pasajero, error: errorPasajero } = await supabase
        .from("pasajeros")
        .insert([passengerInfo])
        .select();

      if (errorPasajero) throw errorPasajero;

      // Aquí se podría añadir más lógica para el ticket y el pago.
      alert("Reserva realizada con éxito");
    } catch (error) {
      console.error("Error al crear la reserva:", error.message);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Reserva de Vuelo</h1>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700">Ruta</label>
        <select
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          onChange={(e) => setSelectedRuta(e.target.value)}
        >
          <option value="">Seleccione una ruta</option>
          {rutas.map((ruta) => (
            <option key={ruta.id_ruta} value={ruta.id_ruta}>
              {ruta.origen} → {ruta.destino}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Información del Pasajero</h2>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={passengerInfo.nombre}
          onChange={handlePassengerChange}
          className="block w-full mb-2 p-2 border border-gray-300 rounded-md"
        />
        <input
          type="text"
          name="apellido"
          placeholder="Apellido"
          value={passengerInfo.apellido}
          onChange={handlePassengerChange}
          className="block w-full mb-2 p-2 border border-gray-300 rounded-md"
        />
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={passengerInfo.email}
          onChange={handlePassengerChange}
          className="block w-full mb-2 p-2 border border-gray-300 rounded-md"
        />
        <input
          type="text"
          name="telefono"
          placeholder="Teléfono"
          value={passengerInfo.telefono}
          onChange={handlePassengerChange}
          className="block w-full mb-2 p-2 border border-gray-300 rounded-md"
        />
        <input
          type="text"
          name="documento_identidad"
          placeholder="Documento de Identidad"
          value={passengerInfo.documento_identidad}
          onChange={handlePassengerChange}
          className="block w-full mb-2 p-2 border border-gray-300 rounded-md"
        />
      </div>

      <button
        className="px-4 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700"
        onClick={handleReserva}
      >
        Confirmar Reserva
      </button>
    </div>
  );
}

export default ReserveFlyView;
