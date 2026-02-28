import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Scanner from './pages/Scanner';

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route goes to Login */}
        <Route path="/" element={<Login />} />
        
        {/* Protected routes (we'll secure these later) */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/scan" element={<Scanner />} />
        
        {/* Catch-all redirects back to login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;