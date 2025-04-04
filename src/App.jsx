import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Achievements from './pages/Achievements'
import Friends from './pages/Friend'
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/friends" element={<Friends />} />
      </Routes>
    </Router>
  );
}

export default App;
