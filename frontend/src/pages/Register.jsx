import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { registerUser } from '../services/auth.api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const { confirmPassword, ...userData } = data;
      const res = await registerUser(userData);
      toast.success(res.message || 'Registration successful. Please log in.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div 
        className="w-full max-w-md p-8 rounded-2xl bg-white dark:bg-gray-900 shadow-xl border border-gray-100 dark:border-gray-800"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Create an Account</h1>
          <p className="text-gray-600 dark:text-gray-400">Join NoteFlow to organize your thoughts</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input 
            label="Name" 
            id="name" 
            type="text" 
            placeholder="John Doe"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input 
            label="Email" 
            id="email" 
            type="email" 
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input 
            label="Password" 
            id="password" 
            type="password" 
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          <Input 
            label="Confirm Password" 
            id="confirmPassword" 
            type="password" 
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <Button type="submit" className="w-full mt-6" isLoading={isLoading}>
            Register
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
            Log In
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
