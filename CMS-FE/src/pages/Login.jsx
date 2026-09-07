import React, { useState } from 'react';
import AuthLayout from '../components/AuthLayout';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    
    // Validate inputs
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const result = await login(email, password);
      
      if (result && result.success) {
        // Small delay to ensure state is updated
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 100);
      } else {
        setError(result?.error || 'Login failed. Please check your credentials.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err?.message || 'Something went wrong! Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div>
        <img src="/jhamtani-logo.webp" alt="Jhamtani" className="h-10 mx-auto mb-4 object-contain lg:hidden" />
        <h2 className="text-3xl font-bold mb-2 text-center text-gray-800">Jhamtani CMS</h2>
        <p className="text-center text-gray-600 mb-6">Sign in to manage jhamtani.netlify.app</p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#C5A880] focus:border-transparent"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#C5A880] focus:border-transparent"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#C5A880] hover:bg-[#A0725B] disabled:bg-[#C5A880]/50 text-[#191f26] p-3 rounded-lg font-semibold transition-colors duration-200"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>

          <div className="text-center mt-4">
            <span className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#A0725B] hover:text-[#C5A880] font-semibold">
                Register now
              </Link>
            </span>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default Login;
