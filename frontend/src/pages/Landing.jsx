import React from 'react';
import { motion } from 'framer-motion';
import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, Lock, Search, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

const Landing = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const features = [
    {
      icon: <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
      title: 'Private & Secure',
      description: 'Your notes are protected with industry-standard JWT authentication.'
    },
    {
      icon: <Search className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
      title: 'Fast Search',
      description: 'Find exactly what you need with instant, debounced search.'
    },
    {
      icon: <Smartphone className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
      title: 'Responsive Design',
      description: 'Access your notes anywhere, on any device.'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-6 px-4 md:px-8 max-w-7xl mx-auto w-full flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">NoteFlow</h1>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Log In</Link>
          <Link to="/register">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-8 max-w-7xl mx-auto py-16">
        <motion.div 
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            Organize your thoughts with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">clarity.</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10">
            A modern, fast, and secure notes application to help you capture ideas, organize your work, and stay productive.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto text-base">
                Start Writing Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-base">
                Explore Demo
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div 
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 w-full"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index} 
              variants={itemVariants}
              className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800"
            >
              <div className="mb-4 inline-flex items-center justify-center p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
};

export default Landing;
