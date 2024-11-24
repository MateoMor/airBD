import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./view/Login";
import ReserveFlyView from "./view/ReserveFlyView";
import SignUp from "./view/SignUp";
import HomePage from "./view/HomePage";
import Header from "./components/Header";
import { UserProvider } from "./context/UserContext";

function App() {
  return (
    <Router>
      <UserProvider>
        <div>
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/reserveFly" element={<ReserveFlyView />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
          </Routes>
        </div>
      </UserProvider>
    </Router>
  );
}

export default App;
