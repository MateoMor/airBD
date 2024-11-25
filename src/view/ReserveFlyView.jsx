import React, { useState, useEffect, useContext } from "react";
import { supabase } from "../db/supabaseClient"; // Import Supabase configuration
import { UserContext } from "../context/UserContext"; // Import user context
import { useNavigate } from "react-router-dom";

function ReserveFlyView() {
  const { user } = useContext(UserContext); // Get user info from context
  const [rutas, setRutas] = useState([]);
  const [vuelos, setVuelos] = useState([]);
  const [selectedRuta, setSelectedRuta] = useState(null);
  const [selectedVuelo, setSelectedVuelo] = useState(null);
  const [equipaje, setEquipaje] = useState({
    peso: "",
  });
  const [metodoPago, setMetodoPago] = useState(""); // State for payment method
  const [clase, setClase] = useState("Economy"); // State for selected class
  const [precioFinal, setPrecioFinal] = useState(0); // State for final price

  useEffect(() => {
    fetchRutas();
  }, []);

  useEffect(() => {
    // Convert selectedVuelo to an integer
    const selectedVueloId = parseInt(selectedVuelo, 10);

    if (selectedVueloId && vuelos.length > 0) {
      // Find selected flight directly in the flights array
      let vueloSeleccionado = null;

      for (let fecha of vuelos) {
        vueloSeleccionado = fecha.find(
          (vuelo) => vuelo.id_vuelo === selectedVueloId
        );
        if (vueloSeleccionado) break; // Exit loop if flight is found
      }

      if (vueloSeleccionado) {
        let precio = vueloSeleccionado.precio;

        // Adjust price if class is Business
        if (clase === "Business") {
          precio = precio * 1.5; // Increase price by 50% for Business
        }

        setPrecioFinal(precio); // Set final price
      }
    }
  }, [selectedVuelo, clase, vuelos]);

  // This useEffect updates the price when luggage weight changes
  useEffect(() => {
    if (selectedVuelo && vuelos.length > 0) {
      const selectedVueloId = parseInt(selectedVuelo, 10);
      let vueloSeleccionado = null;

      for (let fecha of vuelos) {
        vueloSeleccionado = fecha.find(
          (vuelo) => vuelo.id_vuelo === selectedVueloId
        );
        if (vueloSeleccionado) break;
      }

      if (vueloSeleccionado) {
        let precio = vueloSeleccionado.precio;

        // Adjust price if class is Business
        if (clase === "Business") {
          precio = precio * 1.5; // Increase price by 50% for Business
        }

        // If luggage field is empty, treat it as 0
        const peso = equipaje.peso ? parseFloat(equipaje.peso) : 0;

        // Calculate additional cost for luggage weight (if any)
        const costoEquipaje = peso * 0.06 * precio; // 6% of price per kg
        setPrecioFinal(precio + costoEquipaje); // Set new final price
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
      .select("*") // Select all fields, no need to add price here
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

      setVuelos(Object.values(vuelosPorFecha)); // Store grouped flights
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
    let peso = e.target.value;

    // If weight is greater than 12, adjust it to 12
    if (peso > 12) {
      peso = 12;
    }

    setEquipaje({ ...equipaje, peso: peso });
  };

  const handleMetodoPagoChange = (e) => {
    setMetodoPago(e.target.value);
  };

  const handleClaseChange = (e) => {
    setClase(e.target.value); // Change selected class
  };

  const handleReserva = async () => {
    // Check for incomplete fields
    if (
      !selectedVuelo ||
      !metodoPago ||
      precioFinal <= 0 ||
      !equipaje.peso // No need for more luggage data
    ) {
      // Show alert if any field is incomplete
      alert("Please fill out all required fields.");
      return; // Do not proceed with reservation
    }

    try {
      // Verify flight exists
      const { data: vuelo, error: vueloError } = await supabase
        .from("vuelos")
        .select("*")
        .eq("id_vuelo", selectedVuelo)
        .single();

      if (vueloError || !vuelo) {
        alert("Flight not found. Please select a valid flight.");
        return;
      }

      // Generate unique ticket number
      const numeroTicket = `TKT${selectedVuelo}-${Date.now()}`; // Example with flight ID and timestamp

      // Insert ticket
      const { data: ticketData, error: ticketError } = await supabase
        .from("tickets")
        .insert([
          {
            id_vuelo: selectedVuelo,
            id_pasajero: user.id_pasajero, // User ID as passenger
            numero_ticket: numeroTicket,
            clase: clase,
            precio: precioFinal,
          },
        ])
        .select();

      if (ticketError) throw ticketError;

      console.log("Ticket created successfully:", ticketData);

      // Get highest id_pago value by ordering in descending order
      const { data: maxPagoData, error: maxPagoError } = await supabase
        .from("registro_de_pagos")
        .select("id_pago")
        .order("id_pago", { ascending: false })
        .limit(1)
        .single();

      if (maxPagoError) throw maxPagoError;

      // If no previous payments, start with id 1
      const nuevoIdPago = maxPagoData ? maxPagoData.id_pago + 1 : 1;

      console.log("Inserting payment with the following data:", {
        id_pago: nuevoIdPago,
        id_ticket: ticketData[0].id_ticket,
        fecha_pago: new Date().toISOString(),
        monto: precioFinal,
        metodo_pago: metodoPago,
      });

      // Insert payment with new manually generated id_pago
      const { data: pagoData, error: pagoError } = await supabase
        .from("registro_de_pagos")
        .insert([
          {
            id_pago: nuevoIdPago, // Use new id_pago
            id_ticket: ticketData[0].id_ticket, // Newly inserted ticket ID
            fecha_pago: new Date().toISOString(), // Current date
            monto: precioFinal,
            metodo_pago: metodoPago, // Selected payment method
          },
        ])
        .select();

      if (pagoError) throw pagoError;

      console.log("Payment recorded successfully:", pagoData);

      // Confirm reservation
      alert(
        "Reservation successful. Your ticket number is: " + numeroTicket
      );

      // Clear states
      setSelectedRuta(null);
      setSelectedVuelo(null);
      setEquipaje({ peso: "" }); // Clear only the weight
      setMetodoPago("");
      setClase("Economy");
      setPrecioFinal(0);
    } catch (error) {
      console.error("Error creating ticket or payment:", error.message);
      alert("There was an error processing the reservation. Please try again.");
    }
  };

  const navigate = useNavigate();

  const handleVerTickets = () => {
    navigate("/myTickets");
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Flight Reservation</h1>

      {/* User information */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">User Information</h2>
        <p>
          <strong>First Name:</strong> {user.nombre}
        </p>
        <p>
          <strong>Last Name:</strong> {user.apellido}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
      </div>

      {/* Route selection */}
      <div className="mb-4">
        <label
          htmlFor="ruta"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Select Route
        </label>
        <select
          id="ruta"
          value={selectedRuta}
          onChange={handleRutaChange}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="">-- Select a route --</option>
          {rutas.map((ruta) => (
            <option key={ruta.id_ruta} value={ruta.id_ruta}>
              {ruta.origen} to {ruta.destino}
            </option>
          ))}
        </select>
      </div>

      {/* Flight selection */}
      {selectedRuta && (
        <div className="mb-4">
          <label
            htmlFor="vuelo"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Select Flight
          </label>
          <select
            id="vuelo"
            value={selectedVuelo}
            onChange={handleVueloChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">-- Select a flight --</option>
            {vuelos.map((fecha) =>
              fecha.map((vuelo) => (
                <option key={vuelo.id_vuelo} value={vuelo.id_vuelo}>
                  {`${vuelo.fecha_salida} at ${vuelo.hora_salida} - Price: $${vuelo.precio}`}
                </option>
              ))
            )}
          </select>
        </div>
      )}

      {/* Baggage input */}
      <div className="mb-4">
        <label
          htmlFor="equipaje"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Luggage Weight (kg)
        </label>
        <input
          type="number"
          id="equipaje"
          value={equipaje.peso}
          onChange={handleEquipajeChange}
          className="w-full p-2 border border-gray-300 rounded-md"
          min="0"
          max="12"
        />
      </div>

      {/* Class selection */}
      <div className="mb-4">
        <label
          htmlFor="clase"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Select Class
        </label>
        <select
          id="clase"
          value={clase}
          onChange={handleClaseChange}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="Economy">Economy</option>
          <option value="Business">Business</option>
        </select>
      </div>

      {/* Payment method */}
      <div className="mb-4">
        <label
          htmlFor="metodoPago"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Payment Method
        </label>
        <select
          id="metodoPago"
          value={metodoPago}
          onChange={handleMetodoPagoChange}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="">-- Select a payment method --</option>
          <option value="creditCard">Credit Card</option>
          <option value="paypal">PayPal</option>
          <option value="bankTransfer">Bank Transfer</option>
        </select>
      </div>

      {/* Final Price */}
      <div className="mb-4">
        <p>
          <strong>Final Price:</strong> ${precioFinal}
        </p>
      </div>

      {/* Reservation button */}
      <div className="mb-4">
        <button
          onClick={handleReserva}
          className="w-full p-3 bg-blue-600 text-white rounded-md"
        >
          Reserve Flight
        </button>
      </div>

      {/* My Tickets button */}
      <div className="mb-4">
        <button
          onClick={handleVerTickets}
          className="w-full p-3 bg-green-600 text-white rounded-md"
        >
          View My Tickets
        </button>
      </div>
    </div>
  );
}

export default ReserveFlyView;
