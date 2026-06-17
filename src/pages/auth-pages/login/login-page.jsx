import React, { useState } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import logo from '../../../assets/Logo.png';
import { Link, useNavigate } from 'react-router';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      let role = 'owner';
      if (email.toLowerCase().includes('director')) {
        role = 'director';
      }
      
      const userData = {
        email,
        role,
        name: role === 'owner' ? 'School Owner' : 'School Director'
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('Login attempt with:', userData);
      
      setIsLoading(false);
      navigate(role === 'owner' ? '/owner/overview' : '/director/overview');
    }, 1000);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-[#1E3A5F]"
      style={{ background: 'rgb(10, 15, 30)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="bg-white/95 backdrop-blur-xl border border-white/10 shadow-2xl">
          <CardHeader className="space-y-6 text-center pb-8">
            {/* Logo */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex justify-center"
            >
              <img 
                src={logo} 
                alt="OwnerPulse Logo" 
                className="h-20 w-auto drop-shadow-lg"
              />
            </motion.div>

            <div>
              <CardTitle className="text-3xl font-bold text-gray-900">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2 text-base">
                Sign in to access your school dashboard
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="owner@school.com or director@school.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="remember" className="w-4 h-4 accent-blue-600" />
                  <Label htmlFor="remember" className="text-gray-600 cursor-pointer">Remember me</Label>
                </div>
                <Link to="/forget-password" className="hover:underline">
                  Forgot password?
                </Link>
              </div>

              {/* Login Button */}
              <Button 
                type="submit" 
                className="w-full h-14 text-base font-semibold bg-[#1E3A5F] hover:bg-[#15294A] transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Demo Credentials */}
            {/* <div className="mt-8 text-center text-xs text-gray-500 bg-gray-50 py-3 rounded-xl border">
              <p className="font-medium text-gray-700 mb-1">Demo Credentials</p>
              <p>Owner: <span className="font-mono">owner@school.com</span></p>
              <p>Director: <span className="font-mono">director@school.com</span></p>
            </div> */}
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-white/60 mt-8">
          © 2026 OwnerPulse • HCLC
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;