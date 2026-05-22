// frontend/src/data/mockData.tsx
import React from 'react';

export const propertyListings = [
  {
    id: 1,
    title: "Modern Apartment",
    location: "New York, NY",
    price: "$1,200,000",
    imgUrl: "https://via.placeholder.com/300",
    description: "A beautiful modern apartment in the heart of the city.",
  },
  {
    id: 2,
    title: "Luxury Villa",
    location: "Malibu, CA",
    price: "$3,500,000",
    imgUrl: "https://via.placeholder.com/300",
    description: "An exquisite villa with ocean views and private pool.",
  },
  {
    id: 3,
    title: "Downtown Loft",
    location: "Chicago, IL",
    price: "$800,000",
    imgUrl: "https://via.placeholder.com/300",
    description: "A stylish loft with industrial features and spacious layout.",
  },
];

const App = () => {
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 to-cyan-400 min-h-screen">
      <Navbar />
      <main className="p-5 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {propertyListings.map(property => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </main>
    </div>
  );
};

const Navbar = () => {
  return (
    <nav className="sticky top-0 backdrop-blur-lg border-b border-white/10 p-4">
      <h1 className="text-white text-2xl">MaiaHomes</h1>
      <div className="flex space-x-4">
        <a href="#" className="text-white">Home</a>
        <a href="#" className="text-white">Listings</a>
        <a href="#" className="text-white">Contact</a>
      </div>
    </nav>
  );
};

const PropertyCard = ({ property }) => {
  return (
    <div className="bg-white/20 backdrop-blur-md border border-white/10 shadow-lg rounded-lg p-5 transition-transform duration-300 hover:scale-105 animate-fadeInUp">
      <img src={property.imgUrl} alt={property.title} className="rounded-lg"/>
      <h2 className="text-xl font-semibold text-white">{property.title}</h2>
      <p className="text-sm text-gray-200">{property.location}</p>
      <p className="text-lg font-bold text-white">{property.price}</p>
      <p className="text-gray-300">{property.description}</p>
    </div>
  );
};

export default App;

// frontend/src/context/AuthContext.tsx
import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

// frontend/src/hooks/useLocalStorage.ts
import { useState, useEffect } from 'react';

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === key) {
        setStoredValue(event.newValue ? JSON.parse(event.newValue) : initialValue);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, [key, initialValue]);

  return [storedValue, setValue];
};

export default useLocalStorage;

// frontend/src/hooks/useDebounce.ts
import { useEffect, useState } from 'react';

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;

// frontend/src/hooks/useMediaQuery.ts
import { useEffect, useState } from 'react';

const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);

    media.addListener(listener);
    return () => {
      media.removeListener(listener);
    };
  }, [query]);

  return matches;
};

export default useMediaQuery;

// frontend/src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import App from './data/mockData';
import { AuthProvider } from './context/AuthContext';
import './styles.css';

ReactDOM.render(
  <AuthProvider>
    <App />
  </AuthProvider>,
  document.getElementById('root')
);

// frontend/src/styles.css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;800&display=swap');

body {
  font-family: 'Inter', sans-serif;
  background-color: #0F172A;
  color: white;
  margin: 0;
  padding: 0;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse-glow {
  0% {
    box-shadow: 0 0 15px rgba(255,255,255,0.2);
  }
  50% {
    box-shadow: 0 0 30px rgba(255,255,255,0.5);
  }
  100% {
    box-shadow: 0 0 15px rgba(255,255,255,0.2);
  }
}

.animate-fadeInUp {
  animation: fadeInUp 0.5s ease forwards;
}

.hover\:scale-105:hover {
  transform: scale(1.05);
}

.bg-gradient-to-r {
  background: linear-gradient(to right, var(--tw-gradient-stops));
}