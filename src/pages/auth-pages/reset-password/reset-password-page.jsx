import React, { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import logo from '../../../assets/Logo.png';
import { useNavigate } from 'react-router';

const ResetPasswordPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setIsLoading(true);

    //TODO Simulate API call
    setTimeout(() => {
      console.log('Password reset successful');
      setIsLoading(false);
      setSuccess(true);
      navigate('/')
    }, 1800);
  };

  const handleBack = () => {
   navigate('/')
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-[#1E3A5F]"
      style={{ background: 'rgb(10, 15, 30)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="bg-white/95 backdrop-blur-xl border border-white/10 shadow-2xl">
          <CardHeader className="space-y-6 text-center">
            <div className="flex justify-center">
              <img 
                src={logo} 
                alt="OwnerPulse Logo" 
                className="h-16 w-auto"
              />
            </div>

            {!success ? (
              <>
                <CardTitle className="text-3xl font-bold text-gray-900">
                  Reset Password
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Create a new strong password for your account
                </CardDescription>
              </>
            ) : (
              <>
                <div className="flex justify-center">
                  <CheckCircle className="w-16 h-16 text-green-500" />
                </div>
                <CardTitle className="text-3xl font-bold text-gray-900">
                  Password Reset Successful
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Your password has been successfully updated.
                </CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent className="px-8 pb-8">
            {!success ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* New Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700">New Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-700">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="h-12 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-14 text-base font-semibold bg-[#1E3A5F] hover:bg-[#15294A] transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? "Resetting Password..." : "Reset Password"}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBack}
                  className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft size={18} />
                  Back to Login
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-6">
                <p className="text-gray-600">
                  You can now sign in with your new password.
                </p>
                <Button 
                  onClick={handleBack}
                  className="w-full h-14 text-base font-semibold bg-[#1E3A5F] hover:bg-[#15294A]"
                >
                  Go to Login
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-white/60 mt-8">
          © 2026 OwnerPulse • HCLC
        </p>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;