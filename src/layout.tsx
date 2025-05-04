// src/components/Layout.tsx
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Brain, ChevronDown, LogOut, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';

export default function Layout() {
  const { userRole, currentUserName, handleSignOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Copy the header JSX from your existing App.tsx
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
        {/* Keep your existing header code here */}
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 pt-16">
        <Outlet /> {/* This renders nested routes */}
      </main>
    </div>
  );
}