import React, { useState } from 'react';
import './SettingsPage.css';
import { Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useLocalStorage } from './hooks/useLocalStorage';
import { mockData } from './data/mockData';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('Profile');
  const [profileData, setProfileData] = useLocalStorage('profileData', mockData.profileData);
  const [securityData, setSecurityData] = useLocalStorage('securityData', mockData.securityData);
  const [preferencesData, setPreferencesData] = useLocalStorage('preferencesData', mockData.preferencesData);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleProfileUpdate = (e) => {
    const updatedProfileData = { ...profileData, [e.target.name]: e.target.value };
    setProfileData(updatedProfileData);
  };

  const handleSecurityUpdate = (e) => {
    const updatedSecurityData = { ...securityData, [e.target.name]: e.target.value };
    setSecurityData(updatedSecurityData);
  };

  const handlePreferencesUpdate = (e) => {
    const updatedPreferencesData = { ...preferencesData, [e.target.name]: e.target.value };
    setPreferencesData(updatedPreferencesData);
  };

  return (
    <div className="settings-page">
      <div className="glass-card settings-card">
        <div className="settings-tabs">
          <button
            className={activeTab === 'Profile' ? 'active-tab' : ''}
            onClick={() => handleTabChange('Profile')}
          >
            Profile
          </button>
          <button
            className={activeTab === 'Security' ? 'active-tab' : ''}
            onClick={() => handleTabChange('Security')}
          >
            Security
          </button>
          <button
            className={activeTab === 'Preferences' ? 'active-tab' : ''}
            onClick={() => handleTabChange('Preferences')}
          >
            Preferences
          </button>
        </div>
        {activeTab === 'Profile' && (
          <div className="settings-content">
            <h2>Profile Settings</h2>
            <form>
              <div className="form-group">
                <label>Username:</label>
                <input
                  type="text"
                  name="username"
                  value={profileData.username}
                  onChange={handleProfileUpdate}
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileUpdate}
                />
              </div>
              <div className="form-group">
                <label>Password:</label>
                <input
                  type="password"
                  name="password"
                  value={profileData.password}
                  onChange={handleProfileUpdate}
                />
              </div>
            </form>
          </div>
        )}
        {activeTab === 'Security' && (
          <div className="settings-content">
            <h2>Security Settings</h2>
            <form>
              <div className="form-group">
                <label>Two-Factor Authentication:</label>
                <input
                  type="checkbox"
                  name="twoFactorAuth"
                  checked={securityData.twoFactorAuth}
                  onChange={handleSecurityUpdate}
                />
              </div>
              <div className="form-group">
                <label>Account Lockout:</label>
                <input
                  type="checkbox"
                  name="accountLockout"
                  checked={securityData.accountLockout}
                  onChange={handleSecurityUpdate}
                />
              </div>
            </form>
          </div>
        )}
        {activeTab === 'Preferences' && (
          <div className="settings-content">
            <h2>Preferences Settings</h2>
            <form>
              <div className="form-group">
                <label>Language:</label>
                <select
                  name="language"
                  value={preferencesData.language}
                  onChange={handlePreferencesUpdate}
                >
                  <option value="en">English</option>
                  <option value="fr">French</option>
                  <option value="es">Spanish</option>
                </select>
              </div>
              <div className="form-group">
                <label>Time Zone:</label>
                <select
                  name="timeZone"
                  value={preferencesData.timeZone}
                  onChange={handlePreferencesUpdate}
                >
                  <option value="UTC-5">UTC-5</option>
                  <option value="UTC-4">UTC-4</option>
                  <option value="UTC-3">UTC-3</option>
                </select>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;