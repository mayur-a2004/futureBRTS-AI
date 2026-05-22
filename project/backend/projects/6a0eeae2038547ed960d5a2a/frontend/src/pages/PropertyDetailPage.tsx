import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useLocalStorage } from './hooks/useLocalStorage';
import mockData from './data/mockData';

const PropertyDetailPage = () => {
  const [property, setProperty] = useState({});
  const [gallery, setGallery] = useState([]);
  const [virtualTour, setVirtualTour] = useState({});
  const [agent, setAgent] = useState({});
  const [isDarkMode, setIsDarkMode] = useLocalStorage('isDarkMode', false);

  useEffect(() => {
    const propertyId = window.location.pathname.split('/').pop();
    const currentProperty = mockData.properties.find((prop) => prop.id === propertyId);
    setProperty(currentProperty);
    setGallery(currentProperty.gallery);
    setVirtualTour(currentProperty.virtualTour);
    setAgent(currentProperty.agent);
  }, []);

  const handleDarkModeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <AuthProvider>
      <div
        className="property-detail-page"
        style={{
          backgroundColor: '#0F172A',
          minHeight: '100vh',
          padding: '20px',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <nav
          className="glassmorphic-navbar"
          style={{
            position: 'sticky',
            top: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            padding: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Link to="/" style={{ textDecoration: 'none', color: '#fff' }}>
            MaiaHomes
          </Link>
          <button
            className="dark-mode-toggle"
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              padding: '10px',
              cursor: 'pointer',
            }}
            onClick={handleDarkModeToggle}
          >
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </nav>
        <div
          className="property-detail-container"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            padding: '20px',
          }}
        >
          <div
            className="property-detail-card"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              padding: '20px',
              borderRadius: '10px',
              boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)',
            }}
          >
            <h1
              style={{
                fontSize: '24px',
                fontWeight: '800',
                marginBottom: '10px',
              }}
            >
              {property.title}
            </h1>
            <p
              style={{
                fontSize: '16px',
                fontWeight: '400',
                marginBottom: '20px',
              }}
            >
              {property.description}
            </p>
            <div
              className="property-detail-gallery"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              {gallery.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt="Property Image"
                  style={{
                    width: '200px',
                    height: '150px',
                    margin: '10px',
                    borderRadius: '10px',
                  }}
                />
              ))}
            </div>
          </div>
          <div
            className="property-detail-virtual-tour"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              padding: '20px',
              borderRadius: '10px',
              boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)',
            }}
          >
            <h2
              style={{
                fontSize: '20px',
                fontWeight: '600',
                marginBottom: '10px',
              }}
            >
              Virtual Tour
            </h2>
            <iframe
              src={virtualTour.url}
              frameBorder="0"
              allowFullScreen
              style={{
                width: '100%',
                height: '300px',
                borderRadius: '10px',
              }}
            />
          </div>
        </div>
        <div
          className="property-detail-agent"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)',
            marginTop: '20px',
          }}
        >
          <h2
            style={{
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '10px',
            }}
          >
            Contact Agent
          </h2>
          <p
            style={{
              fontSize: '16px',
              fontWeight: '400',
              marginBottom: '20px',
            }}
          >
            {agent.name}
          </p>
          <p
            style={{
              fontSize: '16px',
              fontWeight: '400',
              marginBottom: '20px',
            }}
          >
            {agent.email}
          </p>
          <p
            style={{
              fontSize: '16px',
              fontWeight: '400',
              marginBottom: '20px',
            }}
          >
            {agent.phone}
          </p>
        </div>
      </div>
    </AuthProvider>
  );
};

export default PropertyDetailPage;