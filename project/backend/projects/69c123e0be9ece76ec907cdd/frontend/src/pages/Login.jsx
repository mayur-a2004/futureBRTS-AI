import React, { useState } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Authentication Module Triggered for ' + email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <form onSubmit={handleSubmit} className="bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700 w-96">
        <h2 className="text-3xl font-bold text-center mb-8 text-white">System Auth</h2>
        <input className="w-full bg-slate-950 p-4 rounded-xl mb-4 border border-slate-700" type="email" placeholder="Email Address" onChange={e => setEmail(e.target.value)} required />
        <input className="w-full bg-slate-950 p-4 rounded-xl mb-6 border border-slate-700" type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} required />
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-4 rounded-xl transition-colors">Access Logic Gate</button>
      </form>
    </div>
  );
}