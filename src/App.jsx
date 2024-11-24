import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import UserList from "./components/UserList";
import Login from "./view/Login";
import ReserveFlyView from "./view/ReserveFlyView";
import SignUp from "./view/SignUp";
import TestApi from "./view/TestApi";
import HomePage from './view/HomePage';

function App() {
  return (
    <Router>
      <div>
       
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/reserveFly" element={<ReserveFlyView />} /> 
          <Route path="/test" element={<TestApi />} /> 
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} /> 
          <Route path="/users" element={<UserList />} />  
        </Routes>
      </div>
    </Router> 
    
  );
}

export default App;
