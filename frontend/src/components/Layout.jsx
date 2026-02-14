import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMenu, FiX, FiLogOut, FiUser } from 'react-icons/fi';

export const Layout = ({ children }) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="text-2xl">🍽️</div>
              <span className="font-bold text-xl text-primary">Foodoscope</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              {isAuthenticated ? (
                <>
                  <Link to="/recipes" className="text-gray-600 hover:text-primary transition">
                    Recipes
                  </Link>
                  <Link to="/profile" className="text-gray-600 hover:text-primary transition">
                    Profile
                  </Link>
                  <Link to="/favorites" className="text-gray-600 hover:text-primary transition">
                    Favorites
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-gray-600 hover:text-danger transition"
                  >
                    <FiLogOut />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-primary transition"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-600"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <div className="md:hidden pb-4 space-y-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/recipes"
                    className="block px-4 py-2 text-gray-600 hover:bg-slate-100 rounded"
                  >
                    Recipes
                  </Link>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-gray-600 hover:bg-slate-100 rounded"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/favorites"
                    className="block px-4 py-2 text-gray-600 hover:bg-slate-100 rounded"
                  >
                    Favorites
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-danger hover:bg-slate-100 rounded"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-4 py-2 text-gray-600 hover:bg-slate-100 rounded"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-4 py-2 bg-primary text-white rounded"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-600">
            © 2026 Foodoscope. Personalized nutrition for a healthier you.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
