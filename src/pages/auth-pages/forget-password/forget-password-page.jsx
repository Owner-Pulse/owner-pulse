import React, { useState } from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import logo from '../../../assets/Logo.png';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { axiosPublic } from '@/lib/axios.public';
import { AuthService } from '@/services/auth/auth.service';

const errorMessage = (error) => {
  const data = error?.response?.data;
  const firstFieldError = data?.errors && Object.values(data.errors).flat()[0];
  return firstFieldError || data?.message || "Could not send the reset code.";
};

const alreadyToasted = (error) => {
  const status = error?.response?.status;
  return !error?.response || [404, 500, 502, 503, 504].includes(status);
};

const ForgetPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('email');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await AuthService.forgotPassword(email.trim(), axiosPublic());
      toast.success(result?.message || "Reset code sent. Check your email.");
      setStep('otp');
    } catch (error) {
      if (!alreadyToasted(error)) toast.error(errorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await AuthService.verifyResetOtp(
        { email: email.trim(), otp: otp.trim() },
        axiosPublic()
      );
      if (!result?.token) {
        toast.error("The reset code was accepted, but no reset token came back.");
        return;
      }
      navigate('/reset-password', { state: { email: email.trim(), token: result.token } });
    } catch (error) {
      if (!alreadyToasted(error)) toast.error(errorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    try {
      const result = await AuthService.resendResetOtp(email.trim(), axiosPublic());
      toast.success(result?.message || "A new code was sent.");
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
            {step === 'email' ? (
              <>
                <CardTitle className="text-3xl font-bold text-gray-900">Forgot Password?</CardTitle>
                <CardDescription className="text-gray-600 text-base">
                  Enter your email address and we will send a 4-digit code to reset your password.
                </CardDescription>
              </>
            ) : (
              <>
                <div className="flex justify-center">
                  <CheckCircle className="w-16 h-16 text-green-500" />
                </div>
                <CardTitle className="text-3xl font-bold text-gray-900">Check Your Email</CardTitle>
                <CardDescription className="text-gray-600">
                  Enter the 4-digit code sent to <br />
                  <span className="font-medium text-gray-800">{email}</span>
                </CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent className="px-8 pb-8">
            {step === 'email' ? (
              <form onSubmit={handleEmailSubmit} className="space-y-6">
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
                  {isLoading ? "Sending code..." : "Send reset code"}
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
            ) : (
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-gray-700">Reset code</Label>
                  <Input
                    id="otp"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="4-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    required
                    minLength={4}
                    className="h-12 tracking-[0.4em] text-center"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-14 text-base font-semibold bg-[#1E3A5F] hover:bg-[#15294A]"
                  disabled={isLoading || otp.length !== 4}
                >
                  {isLoading ? "Checking code..." : "Continue"}
                </Button>
                <Button type="button" variant="outline" className="w-full" onClick={handleResend} disabled={isLoading}>
                  Resend code
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

export default ForgetPasswordPage;
