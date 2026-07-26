import CrimeNetworkGraph from "./components/CrimeNetworkGraph";
import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import DashboardLayout from "./components/DashboardLayout";
import ChatInterface from "./components/ChatInterface";
import MyCases from "./components/pages/MyCases";
import Search from "./components/pages/Search";
import DistrictOverview from "./components/pages/DistrictOverview";
import Analytics from "./components/pages/Analytics";
import Forecast from "./components/pages/Forecast";
import MapView from "./components/pages/MapView";

function App() {
  const [auth, setAuth] = useState(null);
  // auth = { token, role, name, district }

  const handleLogin = (data) => {
    setAuth({
      token: data.token,
      role: data.role,
      name: data.name,
      district: data.district || "N/A",
    });
  };

  const handleLogout = () => {
    setAuth(null);
    // Force the URL back to a safe, universally-accessible page so a
    // leftover role-specific path (e.g. /map, /analytics) from the
    // previous officer's session can't be inherited by whoever logs in
    // next on this browser.
    window.location.href = "/chat";
  };

  if (!auth) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<DashboardLayout auth={auth} onLogout={handleLogout} />}
        >
          <Route index element={<Navigate to="/chat" replace />} />
          <Route path="chat" element={<ChatInterface auth={auth} />} />
          <Route path="my-cases" element={<MyCases auth={auth} />} />
          <Route path="search" element={<Search auth={auth} />} />
          <Route path="district-overview" element={<DistrictOverview auth={auth} />} />
          <Route path="analytics" element={<Analytics auth={auth} />} />
          <Route path="forecast" element={<Forecast auth={auth} />} />
          <Route path="map" element={<MapView auth={auth} />} />
          <Route path="*" element={<Navigate to="/chat" replace />} />
          <Route path="graph" element={<CrimeNetworkGraph auth={auth} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
