import React, { useState, useEffect, useContext } from "react";
import { supabase } from "../db/supabaseClient"; // Importar configuración de Supabase
import { UserContext } from "../context/UserContext"; // Importa el contexto del usuario

function ReserveFlyView() {
  const { user } = useContext(UserContext); // Obtener información del usuario desde el contexto
  const [rutas, setRutas] = useState([]);
  const [aeropuertos, setAeropuertos] = useState([]);
  const [selectedRuta, setSelectedRuta] = useState(null);
  const [equipaje, setEquipaje] = useState({
    peso: "",
    dimensiones: "",
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

  const handleEquipajeChange = (e) => {
    setEquipaje({ ...equipaje, [e.target.name]: e.target.value });
  };

  const handleReserva = async () => {
    // Verificar si el pasajero ya existe en la base de datos
    const { data: existingPasajero, error: checkError } = await supabase
      .from("pasajeros")
      .select("*")
      .eq("email", user.email)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking for existing passenger:", checkError);
      return;
    }

    let pasajeroId;
    if (existingPasajero) {
      // Si el pasajero ya existe, usar su ID
      pasajeroId = existingPasajero.id_pasajero;
    } else {
      // Si el pasajero no existe, crear uno nuevo
      const { data: newPasajero, error: insertError } = await supabase
        .from("pasajeros")
        .insert([
          {
            nombre: user.nombre,
            apellido: user.apellido,
            email: user.email,
            telefono: user.telefono,  // Usar teléfono del contexto
            documento_identidad: user.documento_identidad,  // Usar documento del contexto
          },
        ])
        .select()
        .single();

      if (insertError) {
        console.error("Error inserting new passenger:", insertError);
        return;
      }

      pasajeroId = newPasajero.id_pasajero;
    }

    // Crear la reserva (ticket) asociada al pasajero y vuelo
    try {
      const ticketInfo = {
        id_vuelo: selectedRuta, // Esto debería ser el id del vuelo seleccionado
        id_pasajero: pasajeroId,
        numero_ticket: "TKT-" + Math.random().toString(36).substr(2, 9), // Generar un número de ticket aleatorio
        clase: "Economía", // Esto puede variar dependiendo de lo que se elija
        precio: 100.0, // Esto debe ser calculado o asignado correctamente
      };

      const { data: reserva, error } = await supabase
        .from("tickets")
        .insert([ticketInfo])
        .select();

      if (error) throw error;

      // Si la reserva es exitosa, insertar el equipaje
      if (equipaje.peso && equipaje.dimensiones) {
        const { data: equipajeData, error: equipajeError } = await supabase
          .from("equipaje")
          .insert([
            {
              id_pasajero: pasajeroId,
              peso: equipaje.peso,
              dimensiones: equipaje.dimensiones,
            },
          ])
          .select()
          .single();

        if (equipajeError) {
          console.error("Error inserting luggage:", equipajeError);
        } else {
          console.log("Equipaje insertado:", equipajeData);
        }
      }

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
        <p><strong>Teléfono:</strong> {user.telefono}</p> {/* Mostrar teléfono */}
        <p><strong>Documento de Identidad:</strong> {user.documento_identidad}</p> {/* Mostrar documento */}
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

      {/* Información de equipaje */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Información de Equipaje</h2>
        <input
          type="number"
          name="peso"
          placeholder="Peso (kg)"
          value={equipaje.peso}
          onChange={handleEquipajeChange}
          className="block w-full mb-2 p-2 border border-gray-300 rounded-md"
        />
        <input
          type="text"
          name="dimensiones"
          placeholder="Dimensiones (cm)"
          value={equipaje.dimensiones}
          onChange={handleEquipajeChange}
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
    </div>
  );
}

export default ReserveFlyView;
