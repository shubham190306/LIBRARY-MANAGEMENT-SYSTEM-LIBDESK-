import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/HomePage';
import BooksPage from './components/BooksPage';
import MembersPage from './components/MembersPage';
import IssuedBooksPage from './components/IssuedBooksPage';
import DuesPage from './components/DuesPage';
import AdminPanel from './components/AdminPanel';
import LoginPage from './components/LoginPage';
import RequireAuth from './components/RequireAuth';
import { ToastProvider } from './components/ToastContext';
import './App.css';

function App() {
  return (
    <ToastProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/home" element={<RequireAuth><HomePage /></RequireAuth>} />
            <Route path="/books" element={<RequireAuth><BooksPage /></RequireAuth>} />
            <Route path="/members" element={<RequireAuth><MembersPage /></RequireAuth>} />
            <Route path="/issued" element={<RequireAuth><IssuedBooksPage /></RequireAuth>} />
            <Route path="/dues" element={<RequireAuth><DuesPage /></RequireAuth>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={<RequireAuth><AdminPanel /></RequireAuth>} />
          </Routes>
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;
