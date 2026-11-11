import React, { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import logo from '../../../assets/Logo.png';
import { useLocation, useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { axiosPublic } from '@/lib/axios.public';
import { AuthService } from '@/services/auth/auth.service';

const errorMessage = (error) => {
  const data = error?.response?.data;
  const firstFieldError = data?.errors && Object.values(data.errors).flat()[0];
  return firstFieldError || data?.message || "Could not reset the password.";
};

const alreadyToasted = (error) => {
  const status = error?.response?.status;
  return !error?.response || [404, 500, 502, 503, 504].includes(status);
};

const ResetPasswordPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const token = location.state?.token;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await AuthService.resetPassword(
        {
          email,
          token,
          password,
          password_confirmation: confirmPassword,
        },
        axiosPublic()
      );
      toast.success(result?.message || "Password reset successful.");
      setSuccess(true);
    } catch (error) {
      if (!alreadyToasted(error)) toast.error(errorMessage(error));
    } finally {
      setIsLoading(false);
    }
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
              <img src={logo} alt="OwnerPulse Logo" className="h-16 w-auto" />
            </div>
            {!email || !token ? (
              <>
                <CardTitle className="text-3xl font-bold text-gray-900">Reset Password</CardTitle>
                <CardDescription className="text-gray-600">
                  Request a new code from the forgot-password page before choosing a password.
                </CardDescription>
              </>
            ) : success ? (
              <>
                <div className="flex justify-center">
                  <CheckCircle className="w-16 h-16 text-green-500" />
                </div>
                <CardTitle className="text-3xl font-bold text-gray-900">Password Reset Successful</CardTitle>
                <CardDescription className="text-gray-600">
                  Your password has been updated. Sign in with the new one.
                </CardDescription>
              </>
            ) : (
              <>
                <CardTitle className="text-3xl font-bold text-gray-900">Reset Password</CardTitle>
                <CardDescription className="text-gray-600">
                  Create a new password for {email}
                </CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent className="px-8 pb-8">
            {!email || !token ? (
              <div className="space-y-4">
                <Button
                  type="button"
                  onClick={() => navigate('/forget-password')}
                  className="w-full h-14 text-base font-semibold bg-[#1E3A5F] hover:bg-[#15294A]"
                >
                  Request a reset code
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/')}
                  className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft size={18} />
                  Back to Login
                </Button>
              </div>
            ) : success ? (
              <Button
                onClick={() => navigate('/')}
                className="w-full h-14 text-base font-semibold bg-[#1E3A5F] hover:bg-[#15294A]"
              >
                Go to Login
              </Button>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700">New Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
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
                      minLength={6}
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
                  onClick={() => navigate('/')}
                  className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft size={18} />
                  Back to Login
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
        <p className="text-center text-xs text-white/60 mt-8">© 2026 OwnerPulse • HCLC</p>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
