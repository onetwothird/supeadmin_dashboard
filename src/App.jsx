import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './pages/admin_dashboard';
import Login from './auth/login';
import Register from './auth/register';

// NOTE: Once you create the mswd_dashboard.jsx file, uncomment the line below:
// import MswdDashboard from './pages/mswd_dashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Authentication Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Dashboard Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        
        {/* NOTE: Commented this out so it stops crashing the app! 
            Uncomment it when you are ready to build the MSWD dashboard. */}
        {/* <Route path="/mswd" element={<MswdDashboard />} /> */}
      </Routes>
    </Router>
  );
}

export default App;