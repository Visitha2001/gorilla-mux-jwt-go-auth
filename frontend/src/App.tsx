import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Home from "./pages/Home";
import type { JSX } from "react";
import Register from "./pages/Register";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Tasks from "./pages/Tasks";
import Navbar from "./components/Navbar";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  return user ? children : null;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="py-4">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route path="/" element={
                <ProtectedRoute>
                  <Tasks />
                </ProtectedRoute>
              } />

              <Route path="/profile" element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}