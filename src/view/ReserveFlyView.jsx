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
  const [metodoPago, setMetodoPago] = useState(""); // Estado para el método de pago
  const [clase, setClase] = useState("Economy"); // Estado para la clase seleccionada
  const [precioFinal, setPrecioFinal] = useState(0); // Estado para el precio final

  useEffect(() => {
    fetchRutas();
  }, []);

  useEffect(() => {
    console.log("vuelos:", vuelos);
    console.log("selectedVuelo:", selectedVuelo);
  
    // Convertir selectedVuelo a un número entero
    const selectedVueloId = parseInt(selectedVuelo, 10);
  
    if (selectedVueloId && vuelos.length > 0) {
      // Buscar el vuelo seleccionado directamente en el arreglo de vuelos
      let vueloSeleccionado = null;
  
      for (let fecha of vuelos) {
        vueloSeleccionado = fecha.find((vuelo) => vuelo.id_vuelo === selectedVueloId);
        if (vueloSeleccionado) break; // Salir del loop si encontramos el vuelo
      }
  
      console.log("Vuelo seleccionado:", vueloSeleccionado);
  
      if (vueloSeleccionado) {
        let precio = vueloSeleccionado.precio;
        console.log("Precio:", precio);
  
        // Ajuste del precio si es clase Business
        if (clase === "Business") {
          precio = precio * 1.5; // Aumentar el precio en un 50% para Business
        }
  
        setPrecioFinal(precio); // Establecer el precio final
      }
    }
  }, [selectedVuelo, clase, vuelos]); 


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
      .select("*") // Solo seleccionamos todos los campos, sin necesidad de agregar precio
      .eq("id_ruta", rutaId);
  
    if (error) {
      console.error("Error fetching flights:", error);
    } else {
      const vuelosPorFecha = data.reduce((acc, vuelo) => {
        const fecha = vuelo.fecha_salida;
        if (!acc[fecha]) {
          acc[fecha] = [];
        }
        acc[fecha].push(vuelo);
        return acc;
      }, {});
  
      
      for (const fecha in vuelosPorFecha) {
        vuelosPorFecha[fecha].sort((a, b) => a.hora_salida.localeCompare(b.hora_salida));
      }
  
      setVuelos(Object.values(vuelosPorFecha)); // Guardar los vuelos agrupados
    }
  };
  

  const handleRutaChange = (e) => {
    const rutaId = e.target.value;
    setSelectedRuta(rutaId);
    fetchVuelos(rutaId);
  };

  const handleVueloChange = (e) => {
    setSelectedVuelo(e.target.value);
    console.log("vS:", e.target.value);
  };

  const handleEquipajeChange = (e) => {
    setEquipaje({ ...equipaje, [e.target.name]: e.target.value });
  };

  const handleMetodoPagoChange = (e) => {
    setMetodoPago(e.target.value);
  };

  const handleClaseChange = (e) => {
    setClase(e.target.value); // Cambiar la clase seleccionada
  };

  const handleReserva = async () => {
    // Lógica de reserva aquí, utilizando selectedVuelo, metodoPago, equipaje, clase y precioFinal
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
            {vuelos.map((fecha) => (
              <optgroup key={fecha} label={fecha}>
                {fecha.map((vuelo) => (
                  <option key={vuelo.id_vuelo} value={vuelo.id_vuelo}>
                    {vuelo.numero_vuelo} - {vuelo.hora_salida} - {vuelo.destino} - ${vuelo.precio}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      )}

      {/* Selección de clase */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700">Clase</label>
        <select
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          onChange={handleClaseChange}
          value={clase}
        >
          <option value="Economy">Economy</option>
          <option value="Business">Business</option>
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

      {/* Mostrar precio final */}
      <div className="mb-6">
        <p className="text-lg font-semibold">Precio: ${precioFinal}</p>
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
