import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import UserList from "./components/UserList";
import Login from "./view/Login";
import ReserveFlyView from "./view/ReserveFlyView";
import SignUp from "./view/SignUp";
import TestApi from "./view/TestApi";

function App() {
  return (
    <Router>
      <div>
        {/* Puedes agregar aquí un Navbar o un componente de menú */}
        
        {/* Definir las rutas con el componente Routes */}
        <Routes>
          <Route path="/reserveFly" element={<ReserveFlyView />} />  {/* Página principal o vista de reserva */}
          <Route path="/test" element={<TestApi />} />  {/* Página de prueba de API */}
          <Route path="/login" element={<Login />} />  {/* Página de Login */}
          <Route path="/signup" element={<SignUp />} />  {/* Página de Registro */}
          <Route path="/users" element={<UserList />} />  {/* Página de listado de usuarios */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
