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
            <Route path="/" element={<HomePage />} />
            <Route path="/books" element={<BooksPage />} />
            <Route path="/members" element={<MembersPage />} />
            <Route path="/issued" element={<IssuedBooksPage />} />
            <Route path="/dues" element={<DuesPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={<RequireAuth><AdminPanel /></RequireAuth>} />
          </Routes>
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;
