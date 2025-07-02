// 📁 src/App.tsx
import { Routes, Route } from 'react-router-dom';
import ThemeToggle from './components/ThemeToggle';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import { useContext } from 'react';
import { ThemeContext } from './context/ThemeContext';
import './App.css';

function App() {
  const { theme } = useContext(ThemeContext);

  return (
    <div style={{ minHeight: '100vh' }}>
      <ThemeToggle />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        pauseOnHover={false}
        theme={theme === 'dark' ? 'dark' : 'light'}
      />
    </div>
  );
}

export default App;
