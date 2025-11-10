import React from 'react';
import { motion } from 'motion/react';
import { UserRound, Stethoscope, Users, Heart } from 'lucide-react';
import { Button } from './ui/button';
import { UserType } from '../App';

interface WelcomeScreenProps {
  onPortalSelect: (portal: UserType) => void;
}

export default function WelcomeScreen({ onPortalSelect }: WelcomeScreenProps) {
  const portals = [
    { 
      id: 'receptionist' as UserType, 
      label: 'Receptionist', 
      icon: UserRound,
      color: 'from-blue-500 to-blue-600',
      description: 'Manage patient registration and billing'
    },
    { 
      id: 'doctor' as UserType, 
      label: 'Doctor', 
      icon: Stethoscope,
      color: 'from-green-500 to-green-600',
      description: 'Access patient records and prescriptions'
    },
    { 
      id: 'others' as UserType, 
      label: 'Others', 
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      description: 'Test departments and nursing staff'
    },
    { 
      id: 'patient' as UserType, 
      label: 'Patient', 
      icon: Heart,
      color: 'from-pink-500 to-pink-600',
      description: 'View your medical records'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="inline-block mb-6"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-green-600 rounded-full flex items-center justify-center shadow-2xl">
            <Heart className="w-12 h-12 text-white" />
          </div>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-6xl mb-4 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent"
        >
          Welcome to Medixa
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-xl text-gray-600"
        >
          Your Complete Healthcare Management System
        </motion.p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl w-full">
        {portals.map((portal, index) => (
          <motion.div
            key={portal.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.05, y: -10 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => onPortalSelect(portal.id)}
              className={`w-full h-auto p-8 bg-gradient-to-br ${portal.color} hover:shadow-2xl transition-all duration-300 flex flex-col items-center gap-4 rounded-2xl border-0`}
            >
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <portal.icon className="w-8 h-8 text-white" />
              </div>
              <div className="text-center">
                <div className="text-2xl text-white mb-2">{portal.label}</div>
                <div className="text-sm text-white/80">{portal.description}</div>
              </div>
            </Button>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="mt-16 text-center text-gray-500 text-sm"
      >
        <p>Powered by Advanced Healthcare Technology</p>
        <p className="mt-2">© 2025 Medixa Healthcare Solutions</p>
      </motion.div>
    </div>
  );
}
