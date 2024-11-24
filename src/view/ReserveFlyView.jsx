import React, { useState, useEffect, useContext } from "react";
import { supabase } from "../db/supabaseClient"; // Importar configuración de Supabase
import LogoutButton from "../components/LogoutButton";
import { UserContext } from "../context/UserContext"; // Importa el contexto del usuario

function ReserveFlyView() {
  const { user } = useContext(UserContext); // Obtener información del usuario desde el contexto
  const [rutas, setRutas] = useState([]);
  const [aeropuertos, setAeropuertos] = useState([]);
  const [selectedRuta, setSelectedRuta] = useState(null);
  const [additionalInfo, setAdditionalInfo] = useState({
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

  const handleAdditionalChange = (e) => {
    setAdditionalInfo({ ...additionalInfo, [e.target.name]: e.target.value });
  };

  const handleReserva = async () => {
    // Crear un nuevo ticket en la base de datos
    try {
      const reservationInfo = {
        ...user, // Datos del contexto del usuario
        ...additionalInfo, // Información adicional proporcionada
        ruta_id: selectedRuta,
      };

      const { data: reserva, error } = await supabase
        .from("reservas")
        .insert([reservationInfo])
        .select();

      if (error) throw error;

      alert("Reserva realizada con éxito");
    } catch (error) {
      console.error("Error al crear la reserva:", error.message);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Reserva de Vuelo</h1>

      {/* Mostrar información del usuario desde el contexto */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Información del Usuario</h2>
        <p><strong>Nombre:</strong> {user.nombre}</p>
        <p><strong>Apellido:</strong> {user.apellido}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>

      {/* Selección de la ruta */}
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

      {/* Campos adicionales */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Información Adicional</h2>
        <input
          type="text"
          name="telefono"
          placeholder="Teléfono"
          value={additionalInfo.telefono}
          onChange={handleAdditionalChange}
          className="block w-full mb-2 p-2 border border-gray-300 rounded-md"
        />
        <input
          type="text"
          name="documento_identidad"
          placeholder="Documento de Identidad"
          value={additionalInfo.documento_identidad}
          onChange={handleAdditionalChange}
          className="block w-full mb-2 p-2 border border-gray-300 rounded-md"
        />
      </div>

      <button
        className="px-4 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700"
        onClick={handleReserva}
        disabled={!selectedRuta}
      >
        Confirmar Reserva
      </button>
      <LogoutButton />
    </div>
  );
}

export default ReserveFlyView;
