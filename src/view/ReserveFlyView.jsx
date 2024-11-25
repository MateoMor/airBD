import React, { useState, useEffect, useContext } from "react";
import { supabase } from "../db/supabaseClient"; // Importar configuración de Supabase
import { UserContext } from "../context/UserContext"; // Importa el contexto del usuario
import { useNavigate } from "react-router-dom";

function ReserveFlyView() {
  const { user } = useContext(UserContext); // Obtener información del usuario desde el contexto
  const [rutas, setRutas] = useState([]);
  const [vuelos, setVuelos] = useState([]);
  const [selectedRuta, setSelectedRuta] = useState(null);
  const [selectedVuelo, setSelectedVuelo] = useState(null);
  const [equipaje, setEquipaje] = useState({
    peso: "",
  });
  const [metodoPago, setMetodoPago] = useState(""); // Estado para el método de pago
  const [clase, setClase] = useState("Economy"); // Estado para la clase seleccionada
  const [precioFinal, setPrecioFinal] = useState(0); // Estado para el precio final

  useEffect(() => {
    fetchRutas();
  }, []);

  useEffect(() => {
    // Convertir selectedVuelo a un número entero
    const selectedVueloId = parseInt(selectedVuelo, 10);

    if (selectedVueloId && vuelos.length > 0) {
      // Buscar el vuelo seleccionado directamente en el arreglo de vuelos
      let vueloSeleccionado = null;

      for (let fecha of vuelos) {
        vueloSeleccionado = fecha.find(
          (vuelo) => vuelo.id_vuelo === selectedVueloId
        );
        if (vueloSeleccionado) break; // Salir del loop si encontramos el vuelo
      }

      if (vueloSeleccionado) {
        let precio = vueloSeleccionado.precio;

        // Ajuste del precio si es clase Business
        if (clase === "Business") {
          precio = precio * 1.5; // Aumentar el precio en un 50% para Business
        }

        setPrecioFinal(precio); // Establecer el precio final
      }
    }
  }, [selectedVuelo, clase, vuelos]);

  // Este useEffect actualiza el precio cuando cambia el peso del equipaje
  useEffect(() => {
    if (selectedVuelo && vuelos.length > 0) {
      const selectedVueloId = parseInt(selectedVuelo, 10);
      let vueloSeleccionado = null;
  
      for (let fecha of vuelos) {
        vueloSeleccionado = fecha.find((vuelo) => vuelo.id_vuelo === selectedVueloId);
        if (vueloSeleccionado) break;
      }
  
      if (vueloSeleccionado) {
        let precio = vueloSeleccionado.precio;
  
        // Ajuste del precio si es clase Business
        if (clase === "Business") {
          precio = precio * 1.5; // Aumentar el precio en un 50% para Business
        }
  
        // Si el campo de equipaje está vacío, lo tratamos como 0
        const peso = equipaje.peso ? parseFloat(equipaje.peso) : 0;
  
        // Calcular el precio adicional por el peso del equipaje (en caso de que haya peso)
        const costoEquipaje = peso * 0.06 * precio; // 6% del precio por cada kg
        setPrecioFinal(precio + costoEquipaje); // Establecer el nuevo precio final
      }
    }
  }, [equipaje.peso, selectedVuelo, vuelos, clase]);

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
        vuelosPorFecha[fecha].sort((a, b) =>
          a.hora_salida.localeCompare(b.hora_salida)
        );
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
    // Verificación de campos incompletos
    if (
      !selectedVuelo ||
      !metodoPago ||
      precioFinal <= 0 ||
      !equipaje.peso // No pedimos más datos de equipaje
    ) {
      // Mostrar una alerta si algún campo es incompleto
      alert("Por favor, completa todos los campos necesarios.");
      return; // No proceder con la reserva
    }

    try {
      // Verificar que el vuelo existe
      const { data: vuelo, error: vueloError } = await supabase
        .from("vuelos")
        .select("*")
        .eq("id_vuelo", selectedVuelo)
        .single();

      if (vueloError || !vuelo) {
        alert("Vuelo no encontrado. Por favor, selecciona un vuelo válido.");
        return;
      }

      // Generar un número de ticket único
      const numeroTicket = `TKT${selectedVuelo}-${Date.now()}`; // Ejemplo con ID de vuelo y timestamp

      // Insertar el ticket
      const { data: ticketData, error: ticketError } = await supabase
        .from("tickets")
        .insert([
          {
            id_vuelo: selectedVuelo,
            id_pasajero: user.id_pasajero, // ID del usuario como pasajero
            numero_ticket: numeroTicket,
            clase: clase,
            precio: precioFinal,
          },
        ])
        .select();

      if (ticketError) throw ticketError;

      console.log("Ticket creado exitosamente:", ticketData);

      // Obtener el valor más alto de id_pago ordenando los registros en orden descendente
      const { data: maxPagoData, error: maxPagoError } = await supabase
        .from("registro_de_pagos")
        .select("id_pago")
        .order("id_pago", { ascending: false })
        .limit(1)
        .single();

      if (maxPagoError) throw maxPagoError;

      // Si no hay pagos previos, comenzamos con el id 1
      const nuevoIdPago = maxPagoData ? maxPagoData.id_pago + 1 : 1;

      console.log("Insertando pago con los siguientes datos:", {
        id_pago: nuevoIdPago,
        id_ticket: ticketData[0].id_ticket,
        fecha_pago: new Date().toISOString(),
        monto: precioFinal,
        metodo_pago: metodoPago,
      });

      // Ahora insertar el pago con el nuevo id_pago generado manualmente
      const { data: pagoData, error: pagoError } = await supabase
        .from("registro_de_pagos")
        .insert([
          {
            id_pago: nuevoIdPago, // Usar el nuevo id_pago
            id_ticket: ticketData[0].id_ticket, // ID del ticket recién insertado
            fecha_pago: new Date().toISOString(), // Fecha actual
            monto: precioFinal,
            metodo_pago: metodoPago, // Método de pago seleccionado
          },
        ])
        .select();

      if (pagoError) throw pagoError;

      console.log("Pago registrado exitosamente:", pagoData);

      // Confirmar la reserva
      alert(
        "Reserva realizada con éxito. Tu número de ticket es: " + numeroTicket
      );

      // Limpiar estados
      setSelectedRuta(null);
      setSelectedVuelo(null);
      setEquipaje({ peso: "" }); // Limpiar solo el peso
      setMetodoPago("");
      setClase("Economy");
      setPrecioFinal(0);
    } catch (error) {
      console.error("Error al crear el ticket o el pago:", error.message);
      alert("Hubo un error al realizar la reserva. Intenta nuevamente.");
    }
  };

  const navigate = useNavigate();

  const handleVerTickets = () => {
    navigate("/misTickets");
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Reserva de Vuelo</h1>

      {/* Información del usuario */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Información del Usuario</h2>
        <p>
          <strong>Nombre:</strong> {user.nombre}
        </p>
        <p>
          <strong>Apellido:</strong> {user.apellido}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
      </div>

      {/* Selección de la ruta */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700">Ruta</label>
        <select
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          onChange={handleRutaChange}
        >
          <option value="">Selecciona una ruta</option>
          {rutas.map((ruta) => (
            <option key={ruta.id_ruta} value={ruta.id_ruta}>
              {ruta.origen} - {ruta.destino}
            </option>
          ))}
        </select>
      </div>

      {/* Selección del vuelo */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700">Vuelo</label>
        <select
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          onChange={handleVueloChange}
          value={selectedVuelo}
        >
          <option value="">Selecciona un vuelo</option>
          {vuelos.flat().map((vuelo) => (
            <option key={vuelo.id_vuelo} value={vuelo.id_vuelo}>
              {vuelo.fecha_salida} - {vuelo.hora_salida} | {vuelo.precio} $
            </option>
          ))}
        </select>
      </div>

      {/* Selección del peso del equipaje */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700">Peso del Equipaje</label>
        <input
          type="number"
          name="peso"
          value={equipaje.peso}
          onChange={handleEquipajeChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Selección de la clase */}
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

      {/* Selección del método de pago */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700">Método de Pago</label>
        <select
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          onChange={handleMetodoPagoChange}
          value={metodoPago}
        >
          <option value="">Selecciona un método de pago</option>
          <option value="Tarjeta">Tarjeta de Crédito</option>
          <option value="Paypal">PayPal</option>
        </select>
      </div>

      {/* Precio final */}
      <div className="mb-6">
        <p className="font-semibold">Precio Final: {precioFinal} $</p>
      </div>

      {/* Botón para realizar la reserva */}
      <button
        onClick={handleReserva}
        className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-md shadow-md hover:bg-blue-600"
      >
        Realizar Reserva
      </button>

      {/* Botón para ver los tickets */}
      <button
        onClick={handleVerTickets}
        className="w-full py-2 px-4 mt-4 bg-gray-300 text-black font-semibold rounded-md shadow-md hover:bg-gray-400"
      >
        Ver Mis Tickets
      </button>
    </div>
  );
}

export default ReserveFlyView;
