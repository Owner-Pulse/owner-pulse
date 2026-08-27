import React, { useState } from 'react';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import logo from '../../../assets/Logo.png';
import { useNavigate } from 'react-router';

import toast from 'react-hot-toast';

const ForgetPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      toast.success("Password reset link sent!");
      setIsLoading(false);
      setEmailSent(true);
      navigate('/reset-password');
    }, 1500);
  };


  const handleBack = () => {
    window.history.back();
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
            {/* Logo */}
            <div className="flex justify-center">
              <img 
                src={logo} 
                alt="OwnerPulse Logo" 
                className="h-16 w-auto"
              />
            </div>

            {!emailSent ? (
              <>
                <CardTitle className="text-3xl font-bold text-gray-900">
                  Forgot Password?
                </CardTitle>
                <CardDescription className="text-gray-600 text-base">
                  Enter your email address and we'll send you a link to reset your password.
                </CardDescription>
              </>
            ) : (
              <>
                <div className="flex justify-center">
                  <CheckCircle className="w-16 h-16 text-green-500" />
                </div>
                <CardTitle className="text-3xl font-bold text-gray-900">
                  Check Your Email
                </CardTitle>
                <CardDescription className="text-gray-600">
                  We've sent a password reset link to <br />
                  <span className="font-medium text-gray-800">{email}</span>
                </CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent className="px-8 pb-8">
            {!emailSent ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="owner@school.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-14 text-base font-semibold bg-[#1E3A5F] hover:bg-[#15294A]"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending Reset Link..." : "Send Reset Link"}
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
              <div className="space-y-6 text-center">
                <p className="text-sm text-gray-600">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
                <Button 
                  onClick={() => {
                    setEmailSent(false);
                    setEmail('');
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Try Another Email
                </Button>
                <Button
                  onClick={handleBack}
                  variant="ghost"
                  className="w-full"
                >
                  Back to Login
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

export default ForgetPasswordPage;