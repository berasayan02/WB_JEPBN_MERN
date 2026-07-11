import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <nav className="navbar">
      <Link
        to="/"
        className="brand"
        onClick={() => setMenuOpen(false)}
      >
        🩺 WB JEPBN
      </Link>

      <div className="navbar-menu" ref={menuRef}>
        <button
          className="menu-toggle"
          aria-label="Toggle navigation menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <div className={`navbar-links ${menuOpen ? "active" : ""}`}>
          {user ? (
            <>
              {/* User Profile */}
              <div className="user-info">
                {user.avatar && (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="avatar"
                  />
                )}
                <span>{user.name}</span>
              </div>

              <hr className="menu-divider" />

              {/* Menu */}
              <Link to="/" onClick={() => setMenuOpen(false)}>
                Dashboard
              </Link>

              <Link to="/history" onClick={() => setMenuOpen(false)}>
                My History
              </Link>

              {user.role === "admin" && (
                <Link
                  to="/admin"
                  onClick={() => setMenuOpen(false)}
                >
                  Admin
                </Link>
              )}

              <button
                className="theme-toggle-btn"
                onClick={() => {
                  toggleTheme();
                  setMenuOpen(false);
                }}
              >
                {dark ? "☀️ Light Mode" : "🌙 Dark Mode"}
              </button>

              <hr className="menu-divider" />

              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>

              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}