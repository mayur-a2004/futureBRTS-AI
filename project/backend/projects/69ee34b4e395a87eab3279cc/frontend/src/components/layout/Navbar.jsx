import React, { useState, useEffect, useContext } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import logo from '../assets/logo.svg';
import userIcon from '../assets/user-icon.svg';
import dropdownIcon from '../assets/dropdown-icon.svg';
import glassmorphicBackground from '../assets/glassmorphic-background.svg';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const history = useHistory();

  const handleLogout = () => {
    logout();
    history.push('/');
  };

  const handleDropdownToggle = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo-link">
          <img src={logo} alt="Logo" className="logo" />
        </Link>
        <nav className="nav">
          <ul className="nav-links">
            <li>
              <Link to="/" className="nav-link">
                Home
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="nav-link">
                Dashboard
              </Link>
            </li>
            {user && user.role === 'admin' && (
              <li>
                <Link to="/admin" className="nav-link">
                  Admin
                </Link>
              </li>
            )}
          </ul>
        </nav>
        <div className="user-profile">
          <img src={userIcon} alt="User Icon" className="user-icon" />
          <span className="username">{user && user.username}</span>
          <img
            src={dropdownIcon}
            alt="Dropdown Icon"
            className="dropdown-icon"
            onClick={handleDropdownToggle}
          />
          {dropdownOpen && (
            <ul className="dropdown-menu">
              <li>
                <Link to="/profile" className="dropdown-link">
                  Profile
                </Link>
              </li>
              <li>
                <button className="dropdown-link" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>
      <div className="glassmorphic-background">
        <img src={glassmorphicBackground} alt="Glassmorphic Background" />
      </div>
    </header>
  );
};

export default Header;