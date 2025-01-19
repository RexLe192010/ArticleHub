// src/components/App/App.js
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Main from '../Main/Main';
import Auth from '../Auth/Auth';  // Ensure correct path and casing
import Profile from '../Profile/Profile';

function App() {

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/Main" element={<Main />} />
          <Route path="/Profile" element={<Profile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;


