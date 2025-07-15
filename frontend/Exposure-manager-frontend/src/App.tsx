import { Routes, Route, Navigate } from 'react-router-dom';
import ThemeToggle from './components/ThemeToggle';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import TablePage from './pages/TablePage';
import ProtectedRoute from './components/ProtectedRoute';
import AppWrapper from './components/AppWrapper';
import DatabasePage from './pages/DatabasePage'; 
import PortfolioPage from './pages/PortfolioPage'; 
import AccountPage from './pages/AccountPage';
import LocationsAndPoliciesPage from './pages/LocationsAndPoliciesPage';
import LocationPage from './pages/LocationPage';
import PolicyPage from './pages/PolicyPage';
import SettingsAppearancePage from './pages/SettingsAppearancePage';
import SettingsAccountPage from './pages/SettingsAccountPage';
import { ToastContainer } from 'react-toastify';
import { useContext } from 'react';
import { ThemeContext } from './context/ThemeContext';
import './App.css';

function App() {
  const { theme } = useContext(ThemeContext);

  return (
    <div
      style={{
        height: 'fit-content',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Routes>
        <Route path="/" element={<DatabasePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/table" element={<TablePage />} />
        <Route path="/settings" element={<Navigate to="/settings/account" replace />} />
        <Route path="/settings/appearance" element={<SettingsAppearancePage />} />
        <Route path="/settings/account" element={<SettingsAccountPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/databases/:databaseId" element={<PortfolioPage />} />
        <Route path="/databases/:databaseId/portfolios/:portfolioId" element={<AccountPage />} />
        <Route path="/databases/:databaseId/portfolios/:portfolioId/accounts/:accountId" element={<LocationsAndPoliciesPage />} />
        <Route path="/databases/:databaseId/portfolios/:portfolioId/accounts/:accountId/locations/:locationId" element={<LocationPage />} />
        <Route path="/databases/:databaseId/portfolios/:portfolioId/accounts/:accountId/policies/:policyId" element={<PolicyPage />} />
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
