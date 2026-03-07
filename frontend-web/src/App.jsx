import { useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';

// Layout
import MainLayout from './components/MainLayout';

// Public Pages
import LandingPage from './components/LandingPage';
import Login from './pages/Login';

// Protected Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Emergency from './pages/Emergency';
import Hospitals from './pages/Hospitals';
import Reminders from './pages/Reminders';
<<<<<<< HEAD
import ChatAgent from './pages/ChatAgent';
import Profile from './pages/Profile';

// Auth guard: if no userId in localStorage, redirect to login
function RequireAuth({ children }) {
  const userId = localStorage.getItem('userId');
  const location = useLocation();
  if (!userId) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

// Redirect already-logged-in users away from login/landing
function RedirectIfLoggedIn({ children }) {
  const userId = localStorage.getItem('userId');
  if (userId) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

// Wrapper that passes required props to LandingPage (it uses RN TouchableOpacity with handlers)
function LandingPageWrapper() {
  const navigate = useNavigate();
  const [lang, setLang] = useState('en');

  const handleGetStarted = () => navigate('/login');
  const handleActivateSOS = () => navigate('/emergency');
  const toggleLang = () => setLang((l) => (l === 'en' ? 'ta' : 'en'));
=======
import ConfirmReminders from './pages/ConfirmReminders';
import EditReport from './pages/EditReport';
import Lifestyle from './pages/Lifestyle';
>>>>>>> e5788e615c75eae463b3b1553d6c2202668a334a

  return (
<<<<<<< HEAD
    <LandingPage
      onGetStarted={handleGetStarted}
      onActivateSOS={handleActivateSOS}
      lang={lang}
      toggleLang={toggleLang}
    />
=======
    <Router>
      <Routes>
        {/* PUBLIC ROUTES */}
        {/* 1. The Emergency Page is now the absolute first screen! */}
        <Route path="/" element={<Emergency />} />
        
        {/* 2. Login is moved to its own page */}
        <Route path="/login" element={<Login />} />
        
        {/* PROTECTED ROUTES: Wrapped inside the MainLayout frame */}
        <Route element={<MainLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/scan" element={<Scanner />} />
          <Route path="/profile" element={<Profile />} />
<Route path="/hospitals" element={<Hospitals />} />          {/* We also keep Emergency available inside the dashboard just in case */}
          <Route path="/emergency" element={<Emergency />} />
          <Route path="/chat" element={<ChatAgent />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/confirm-reminders" element={<ConfirmReminders />} />
          <Route path="/edit/:id" element={<EditReport />} />
          <Route path="/lifestyle" element={<Lifestyle />} />
        </Route>

        {/* Catch-all redirects back to the emergency home page */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
>>>>>>> e5788e615c75eae463b3b1553d6c2202668a334a
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<RedirectIfLoggedIn><LandingPageWrapper /></RedirectIfLoggedIn>} />
      <Route path="/login" element={<RedirectIfLoggedIn><Login /></RedirectIfLoggedIn>} />

      {/* Emergency - publicly accessible (no login required for SOS) */}
      <Route path="/emergency" element={<Emergency />} />

      {/* Protected routes - wrapped in RequireAuth + MainLayout */}
      <Route
        element={
          <RequireAuth>
            <MainLayout />
          </RequireAuth>
        }
      >
        <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/hospitals" element={<Hospitals />} />
        <Route path="/reminders" element={<Reminders />} />
        <Route path="/chat" element={<ChatAgent />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
