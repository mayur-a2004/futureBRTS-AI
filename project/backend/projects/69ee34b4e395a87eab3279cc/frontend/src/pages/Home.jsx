import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AuthProvider } from '../context/AuthContext';
import { Header } from '../components/layout/Navbar';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Carousel } from 'react-bootstrap';
import PredictiveAnalyticsHUD from '../components/PredictiveAnalyticsHUD';
import AISearchMock from '../components/AISearchMock';
import RecommendationCarousel from '../components/RecommendationCarousel';

ChartJS.register(...registerables);

const HomePage = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProperties, setFilteredProperties] = useState([]);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await axios.get('/api/properties');
        setProperties(response.data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    const filteredProperties = properties.filter((property) =>
      property.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProperties(filteredProperties);
  };

  const chartData = {
    labels: properties.map((property) => property.title),
    datasets: [
      {
        label: 'Property Prices',
        data: properties.map((property) => property.price),
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <AuthProvider>
      <Header />
      <div className="container">
        <h1 className="text-center mt-5">Welcome to Real Estes</h1>
        <div className="row justify-content-center">
          <div className="col-md-6">
            <AISearchMock
              searchQuery={searchQuery}
              handleSearch={handleSearch}
            />
          </div>
        </div>
        {loading ? (
          <div className="text-center mt-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : error ? (
          <div className="text-center mt-5">
            <p>Error: {error}</p>
          </div>
        ) : (
          <div className="row justify-content-center">
            {filteredProperties.length > 0
              ? filteredProperties.map((property) => (
                  <div key={property._id} className="col-md-4 mb-4">
                    <div className="card">
                      <img
                        src={property.image}
                        className="card-img-top"
                        alt={property.title}
                      />
                      <div className="card-body">
                        <h5 className="card-title">{property.title}</h5>
                        <p className="card-text">{property.description}</p>
                        <p className="card-text">
                          Price: ${property.price.toLocaleString()}
                        </p>
                        <Link to={`/properties/${property._id}`} className="btn btn-primary">
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              : properties.map((property) => (
                  <div key={property._id} className="col-md-4 mb-4">
                    <div className="card">
                      <img
                        src={property.image}
                        className="card-img-top"
                        alt={property.title}
                      />
                      <div className="card-body">
                        <h5 className="card-title">{property.title}</h5>
                        <p className="card-text">{property.description}</p>
                        <p className="card-text">
                          Price: ${property.price.toLocaleString()}
                        </p>
                        <Link to={`/properties/${property._id}`} className="btn btn-primary">
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
          </div>
        )}
        <div className="row justify-content-center">
          <div className="col-md-6">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
        <div className="row justify-content-center">
          <div className="col-md-6">
            <PredictiveAnalyticsHUD properties={properties} />
          </div>
        </div>
        <div className="row justify-content-center">
          <div className="col-md-6">
            <RecommendationCarousel properties={properties} />
          </div>
        </div>
      </div>
    </AuthProvider>
  );
};

export default HomePage;