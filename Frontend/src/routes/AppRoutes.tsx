import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import VisitorHome from '../pages/public/VisitHome';

interface AppRoutesProps {
  view: string;
  setView: (view: string) => void;
}

export const AppRoutes: React.FC<AppRoutesProps> = ({ view, setView }) => {
  const { user } = useAuth();

  switch (view) {
    case 'login':
      return (
        <Login 
          onSwitchToRegister={() => setView('register')} 
          onBack={() => setView('landing')} 
          onSuccess={() => setView('landing')}
        />
      );
    
    case 'register':
      return (
        <Register 
          onSwitchToLogin={() => setView('login')} 
          onBack={() => setView('landing')} 
          onSuccess={() => setView('landing')}
        />
      );
    
    default:
      return <VisitorHome />;
  }
};
