import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./view/Login";
import ReserveFlyView from "./view/ReserveFlyView";
import SignUp from "./view/SignUp";
import HomePage from "./view/HomePage";
import Header from "./components/Header";
import { UserProvider } from "./context/UserContext";
import UserTicketsView from "./view/UserTicketsView";
import AvailableFlightsView from "./view/AvailableFlightsView";
import FlightDetailsView from "./view/FlightDetailsView";


function App() {
  return (
    <Router>
      <UserProvider>
        <div>
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/reserveFly" element={<ReserveFlyView />} />
            <Route path='/misTickets' element={<UserTicketsView />} />
            <Route path="/availableFlights" element={<AvailableFlightsView />} />
            <Route path="/vuelo/:id_vuelo" element={<FlightDetailsView />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
          </Routes>
        </div>
      </UserProvider>
    </Router>
  );
}

export default App;
