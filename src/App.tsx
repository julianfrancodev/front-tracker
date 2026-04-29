import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import ProtectedRoute from './routes/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div style={dashboardContainerStyle}>
                <h1 style={titleStyle}>Dashboard (Próximamente)</h1>
                <p>Bienvenido al panel de logística.</p>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

// Simple styles for the placeholder dashboard
const dashboardContainerStyle: React.CSSProperties = {
  padding: '2rem',
  fontFamily: 'system-ui, sans-serif'
};

const titleStyle: React.CSSProperties = {
  fontSize: '2rem',
  color: '#1f2937',
  marginBottom: '1rem'
};

export default App;
