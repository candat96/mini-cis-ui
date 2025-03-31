import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/router';
import { getStoreData } from '../lib/localStorage';
import AuthNotification from './AuthNotification';

interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthNotification, setShowAuthNotification] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getStoreData('token');
      
      if (!token) {
        setShowAuthNotification(true);
      } else {
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    // Bạn có thể thay thế bằng component loading đẹp hơn
    return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;
  }

  if (showAuthNotification) {
    return <AuthNotification />;
  }

  return isAuthenticated ? <>{children}</> : null;
};

export default PrivateRoute; 