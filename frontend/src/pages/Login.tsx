import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import http from "../services/httpService";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await http.post("/login", { email, password });
      await login(data.token); 
      
      navigate("/");
    } catch (err) {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-6 text-2xl font-bold text-gray-800">Login</h2>
        <input 
          type="email" placeholder="Email" className="mb-4 w-full border p-2 rounded" 
          onChange={(e) => setEmail(e.target.value)} required 
        />
        <input 
          type="password" placeholder="Password" className="mb-6 w-full border p-2 rounded" 
          onChange={(e) => setPassword(e.target.value)} required 
        />
        <button className="w-full bg-blue-600 py-2 text-white rounded hover:bg-blue-700">Sign In</button>
        <p className="mt-4 text-sm text-center">
          No account? <Link to="/register" className="text-blue-600">Register</Link>
        </p>
      </form>
    </div>
  );
}