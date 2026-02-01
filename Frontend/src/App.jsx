import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard/Dashboard';
import DataSensor from './pages/DataSensor/DataSensor';
import ActionHistory from './pages/ActionHistory/ActionHistory';
import Profile from './pages/Profile/Profile';
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/datasensor" element={<DataSensor />} />
      <Route path="/actionhistory" element={<ActionHistory />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}
export default App;