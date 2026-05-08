import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          Vedaz<span>Expert</span>
        </Link>
        <div className="navbar-links">
          <Link to="/" className={isActive('/')}>Experts</Link>
          <Link to="/my-bookings" className={isActive('/my-bookings')}>My Bookings</Link>
        </div>
        <button className="navbar-hamburger" onClick={() => setOpen(!open)}>
          {open ? '✕' : '☰'}
        </button>
      </div>
      <div className={`navbar-mobile ${open ? 'open' : ''}`}>
        <Link to="/" onClick={() => setOpen(false)}>Experts</Link>
        <Link to="/my-bookings" onClick={() => setOpen(false)}>My Bookings</Link>
      </div>
    </nav>
  );
}
