import React, { useState, useEffect, useContext } from "react";
import { supabase } from "../db/supabaseClient"; // Importar configuración de Supabase
import { UserContext } from "../context/UserContext"; // Importa el contexto del usuario

function ReserveFlyView() {
  const { user } = useContext(UserContext); // Obtener información del usuario desde el contexto
  const [rutas, setRutas] = useState([]);
  const [vuelos, setVuelos] = useState([]);
  const [selectedRuta, setSelectedRuta] = useState(null);
  const [selectedVuelo, setSelectedVuelo] = useState(null);
  const [equipaje, setEquipaje] = useState({
    peso: "",
    dimensiones: "",
  });
  const [metodoPago, setMetodoPago] = useState(""); // Nuevo estado para el método de pago

  useEffect(() => {
    // Cargar rutas y aeropuertos al montar el componente
    fetchRutas();
  }, []);

  const fetchRutas = async () => {
    const { data, error } = await supabase.from("rutas").select("*");
    if (error) {
      console.error("Error fetching routes:", error);
    } else {
      setRutas(data);
    }
  };

  const fetchVuelos = async (rutaId) => {
    const { data, error } = await supabase
      .from("vuelos")
      .select("*, precio") // Asegúrate de incluir la columna 'precio'
      .eq("id_ruta", rutaId);
    if (error) {
      console.error("Error fetching flights:", error);
    } else {
      // Agrupar los vuelos por fecha de salida
      const vuelosPorFecha = data.reduce((acc, vuelo) => {
        const fecha = vuelo.fecha_salida;
        if (!acc[fecha]) {
          acc[fecha] = [];
        }
        acc[fecha].push(vuelo);
        return acc;
      }, {});

      // Ordenar los vuelos por hora dentro de cada fecha
      for (const fecha in vuelosPorFecha) {
        vuelosPorFecha[fecha].sort((a, b) => {
          return a.hora_salida.localeCompare(b.hora_salida);
        });
      }

      setVuelos(vuelosPorFecha); // Guardamos los vuelos agrupados
    }
  };

  const handleRutaChange = (e) => {
    const rutaId = e.target.value;
    setSelectedRuta(rutaId);
    fetchVuelos(rutaId); // Cargar los vuelos disponibles para esta ruta
  };

  const handleVueloChange = (e) => {
    setSelectedVuelo(e.target.value);
  };

  const handleEquipajeChange = (e) => {
    setEquipaje({ ...equipaje, [e.target.name]: e.target.value });
  };

  const handleMetodoPagoChange = (e) => {
    setMetodoPago(e.target.value); // Actualizar el método de pago
  };

  const handleReserva = async () => {
    // Aquí debes agregar la lógica para crear la reserva
    // Lo mismo que ya tenías en tu código pero ahora con selectedVuelo y metodoPago
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Reserva de Vuelo</h1>

      {/* Información del usuario */}
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
          onChange={handleRutaChange}
        >
          <option value="">Seleccione una ruta</option>
          {rutas.map((ruta) => (
            <option key={ruta.id_ruta} value={ruta.id_ruta}>
              {ruta.origen} → {ruta.destino}
            </option>
          ))}
        </select>
      </div>

      {/* Selección del vuelo por fecha y hora */}
      {Object.keys(vuelos).length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700">Vuelo</label>
          <select
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            onChange={handleVueloChange}
          >
            <option value="">Seleccione un vuelo</option>
            {Object.keys(vuelos).map((fecha) => (
              <optgroup key={fecha} label={fecha}>
                {vuelos[fecha].map((vuelo) => (
                  <option key={vuelo.id_vuelo} value={vuelo.id_vuelo}>
                    {vuelo.numero_vuelo} - {vuelo.hora_salida} - {vuelo.destino} - ${vuelo.precio} {/* Mostrar el precio aquí */}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      )}

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

      {/* Selección de método de pago */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700">Método de Pago</label>
        <select
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          onChange={handleMetodoPagoChange}
          value={metodoPago}
        >
          <option value="">Seleccione un método de pago</option>
          <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
          <option value="Paypal">Paypal</option>
          <option value="Tarjeta de Débito">Tarjeta de Débito</option>
        </select>
      </div>

      <button
        className="px-4 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700"
        onClick={handleReserva}
        disabled={!selectedVuelo || !metodoPago} // Deshabilitar si no se selecciona vuelo o método de pago
      >
        Confirmar Reserva
      </button>
    </div>
  );
}

export default ReserveFlyView;
