import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { Layout } from 'antd';
import Sidebar from './Sidebar';
import PrivateRoute from './PrivateRoute';

const { Content } = Layout;

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const handleCollapse = (isCollapsed: boolean) => {
    setCollapsed(isCollapsed);
  };

  return (
    <PrivateRoute>
      <Layout style={{ minHeight: '100vh' }}>
        <Sidebar collapsed={collapsed} onCollapse={handleCollapse} />
        <Layout style={{ 
          marginLeft: isMobile ? 0 : (collapsed ? 80 : 250), 
          transition: 'all 0.2s' 
        }}>
          <Content className={`p-6 ${isMobile ? 'pt-16' : ''}`}>
            {children}
          </Content>
        </Layout>
      </Layout>
    </PrivateRoute>
  );
};

export default AppLayout; 