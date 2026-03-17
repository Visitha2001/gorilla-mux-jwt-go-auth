import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CheckSquare, User, LogOut, LayoutDashboard } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Left Side: Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-blue-600 font-bold text-xl">
              <CheckSquare size={28} />
              <span>Taskly</span>
            </Link>
          </div>

          {/* Right Side: Links */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link 
                  to="/" 
                  className="flex items-center gap-1 text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  <LayoutDashboard size={18} />
                  Tasks
                </Link>
                
                <Link 
                  to="/profile" 
                  className="flex items-center gap-1 text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  <User size={18} />
                  Profile
                </Link>

                <div className="h-6 bg-gray-200 mx-2"></div>

                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-red-500 hover:bg-red-50 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-blue-600 text-sm font-medium">
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}