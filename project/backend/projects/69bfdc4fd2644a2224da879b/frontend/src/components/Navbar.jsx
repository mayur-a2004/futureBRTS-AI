import { Link } from 'react-router-dom';
export default function Navbar() {
  return (
    <nav className="bg-slate-800 border-b border-slate-700 py-4 px-8 flex justify-between items-center shadow-lg">
      <Link to="/" className="text-2xl font-black tracking-tighter text-blue-500">ECOMMERCE WEBSITE...</Link>
      <div className="space-x-8 font-medium text-slate-300">
        <Link to="/" className="hover:text-white transition">Home</Link>
        <Link to="/products" className="hover:text-white transition">Inventory</Link>
        <Link to="/cart" className="hover:text-white transition">Cart</Link>
        <Link to="/login" className="bg-blue-600 px-4 py-2 rounded-lg text-white">Login</Link>
      </div>
    </nav>
  );
}