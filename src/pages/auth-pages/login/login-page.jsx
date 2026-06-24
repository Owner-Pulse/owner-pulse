import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import logo from '../../../assets/Logo.png';
import { Link, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { useSignin } from '@/hooks/auth/signin.hook';
import { setToken } from '@/lib/setToken';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { signin, isPending } = useSignin();

  const handleLogin = (data) => {
    signin(data, {
      onSuccess: (response) => {
        
      },
      onError: (error) => {
        
      }
    });
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
            <form onSubmit={handleSubmit(handleLogin)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="owner@school.com or director@school.com"
                  {...register("email", { required: "Email is required" })}
                  className="h-12"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    {...register("password", { required: "Password is required" })}
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
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
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

              <Button
                type="submit"
                className="w-full h-14 text-base font-semibold bg-[#1E3A5F] hover:bg-[#15294A] transition-all"
                disabled={isPending}
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-white/60 mt-8">
          © 2026 OwnerPulse • HCLC
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;