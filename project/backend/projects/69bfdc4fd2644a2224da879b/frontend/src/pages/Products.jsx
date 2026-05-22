import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import axios from 'axios';

export default function Products() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    const fetch = async () => {
      try { const res = await axios.get('/api/products'); setItems(res.data); } catch (e) { /* Placeholder */ }
    };
    fetch();
  }, []);
  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">Industrial Catalog</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {(items.length > 0 ? items : [{id:1, name:'Titan Alpha'}, {id:2, name:'Titan Beta'}]).map(i => <ProductCard key={i.id} item={i} />)}
      </div>
    </div>
  );
}