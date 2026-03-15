import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import http from "../services/httpService";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      // Send registration data to Go backend
      await http.post("/register", formData);
      
      // Redirect to login after successful registration
      alert("Registration successful! Please login.");
      navigate("/login");
    } catch (err: any) {
      const msg = err.response?.data?.error || "Registration failed. Try again.";
      setError(msg);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-6 text-2xl font-bold text-gray-800 text-center">Create Account</h2>
        
        {error && (
          <div className="mb-4 p-2 text-sm text-red-600 bg-red-100 rounded border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input 
              name="name" type="text" placeholder="John Doe" 
              className="mt-1 w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
              onChange={handleChange} required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input 
              name="email" type="email" placeholder="john@example.com" 
              className="mt-1 w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
              onChange={handleChange} required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input 
              name="password" type="password" placeholder="••••••••" 
              className="mt-1 w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
              onChange={handleChange} required 
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 py-2 text-white font-semibold rounded hover:bg-blue-700 transition duration-200"
          >
            Register
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}