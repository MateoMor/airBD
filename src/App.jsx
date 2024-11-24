import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from "./view/Login";
import ReserveFlyView from "./view/ReserveFlyView";
import SignUp from "./view/SignUp";
import HomePage from './view/HomePage';

function App() {
  return (
    <Router>
      <div>
       
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/reserveFly" element={<ReserveFlyView />} /> 
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} /> 
        </Routes>
      </div>
    </Router> 
    
  );
}

export default App;
