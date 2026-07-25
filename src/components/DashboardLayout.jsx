import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import KSPLogo from "./KSPLogo";

const ROLE_NAV = {
  Constable: [
    { label: "Chat",     path: "/chat",     icon: "💬" },
    { label: "My Cases", path: "/my-cases", icon: "📁" },
    { label: "Search",   path: "/search",   icon: "🔍" },
  ],
  IO: [
    { label: "Chat",     path: "/chat",     icon: "💬" },
    { label: "My Cases", path: "/my-cases", icon: "📁" },
    { label: "Search",   path: "/search",   icon: "🔍" },
  ],
  SP: [
    { label: "Chat",              path: "/chat",             icon: "💬" },
    { label: "District Overview", path: "/district-overview",icon: "🗺️" },
    { label: "Analytics",         path: "/analytics",        icon: "📊" },
    { label: "Forecast",          path: "/forecast",         icon: "🔮" },
    { label: "Map",               path: "/map",              icon: "🗾" },
    { label: "Crime Graph",       path: "/graph",            icon: "🕸️" },
    { label: "Search",            path: "/search",           icon: "🔍" },
  ],
  Analyst: [
    { label: "Chat",      path: "/chat",      icon: "💬" },
    { label: "Analytics", path: "/analytics", icon: "📊" },
    { label: "Forecast",  path: "/forecast",  icon: "🔮" },
    { label: "Search",    path: "/search",    icon: "🔍" },
  ],
  Director: [
    { label: "Chat",              path: "/chat",             icon: "💬" },
    { label: "District Overview", path: "/district-overview",icon: "🗺️" },
    { label: "Analytics",         path: "/analytics",        icon: "📊" },
    { label: "Forecast",          path: "/forecast",         icon: "🔮" },
    { label: "Map",               path: "/map",              icon: "🗾" },
    { label: "Crime Graph",       path: "/graph",            icon: "🕸️" },
    { label: "Search",            path: "/search",           icon: "🔍" },
  ],
};

export default function DashboardLayout({ auth, onLogout }) {
  const [open, setOpen] = useState(false);
  const navItems = ROLE_NAV[auth.role] || ROLE_NAV["Constable"];

  const close = () => setOpen(false);

  return (
    <div className="app-shell">

      {/* Backdrop — mobile only */}
      <div
        className={`sidebar-backdrop ${open ? "visible" : ""}`}
        onClick={close}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-logo">
          <KSPLogo size={64} />
          <div className="ksp-org-name">Karnataka State Police</div>
          <div className="ksp-motto">"ಸೇವೆಯೇ ಸಾಧನ" · Satyameva Jayate </div>
          <div className="sidebar-user">
            <div className="sidebar-user-name">{auth.name}</div>
            <div className="sidebar-user-role">{auth.role}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-label">Navigation</div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={close}
              className={({ isActive }) =>
                `nav-item${isActive ? " active" : ""}`
              }
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={onLogout}>
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="main-content">

        {/* Mobile top bar */}
        <div className="mobile-topbar">
          <div className="mobile-logo-row">
            <KSPLogo size={26} />
            <span className="mobile-logo-text">KSP Platform</span>
          </div>
          <button
            className="hamburger"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? "✕" : "☰"}
          </button>
        </div>

        {/* Scrollable page content */}
        <div className="page-scroll">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
