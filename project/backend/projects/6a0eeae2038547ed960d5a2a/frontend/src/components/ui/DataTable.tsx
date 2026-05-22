import React, { useState, useEffect } from 'react';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import { useLocalStorage } from './hooks/useLocalStorage';
import { mockData } from './data/mockData';

function App() {
  const [properties, setProperties] = useState(mockData.properties);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('price');
  const [order, setOrder] = useState('asc');
  const [pageNumber, setPageNumber] = useState(0);
  const [propertiesPerPage] = useState(10);

  const { saveItem, getItem } = useLocalStorage();

  useEffect(() => {
    const storedProperties = getItem('properties');
    if (storedProperties) {
      setProperties(storedProperties);
    }
  }, []);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleSort = (e) => {
    setSort(e.target.value);
  };

  const handleOrder = (e) => {
    setOrder(e.target.value);
  };

  const handlePageChange = (pageNumber) => {
    setPageNumber(pageNumber);
  };

  const sortedProperties = properties.sort((a, b) => {
    if (sort === 'price') {
      return order === 'asc' ? a.price - b.price : b.price - a.price;
    } else if (sort === 'name') {
      return order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    }
  });

  const filteredProperties = sortedProperties.filter((property) => {
    return property.name.toLowerCase().includes(search.toLowerCase());
  });

  const paginatedProperties = filteredProperties.slice(
    pageNumber * propertiesPerPage,
    (pageNumber + 1) * propertiesPerPage
  );

  return (
    <AuthProvider>
      <div className="app">
        <nav className="navbar">
          <h1>MaiaHomes Real Estate Portal</h1>
          <input
            type="search"
            placeholder="Search properties"
            value={search}
            onChange={handleSearch}
          />
          <select value={sort} onChange={handleSort}>
            <option value="price">Price</option>
            <option value="name">Name</option>
          </select>
          <select value={order} onChange={handleOrder}>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </nav>
        <div className="properties-container">
          {paginatedProperties.map((property) => (
            <div key={property.id} className="property-card">
              <h2>{property.name}</h2>
              <p>Price: ${property.price}</p>
              <p>Location: {property.location}</p>
            </div>
          ))}
        </div>
        <div className="pagination">
          {Array(Math.ceil(filteredProperties.length / propertiesPerPage))
            .fill(0)
            .map((_, index) => (
              <button
                key={index}
                onClick={() => handlePageChange(index)}
                className={pageNumber === index ? 'active' : ''}
              >
                {index + 1}
              </button>
            ))}
        </div>
      </div>
    </AuthProvider>
  );
}

export default App;