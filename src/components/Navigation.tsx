import { useRouter } from 'next/router';
import Link from 'next/link';
import { Menu } from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  LogoutOutlined
} from '@ant-design/icons';

const Navigation = () => {
  const router = useRouter();
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const items: MenuProps['items'] = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: <Link href="/dashboard">Dashboard</Link>
    },
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: <Link href="/profile">Thông tin cá nhân</Link>
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: handleLogout
    }
  ];

  return (
    <Menu
      mode="horizontal"
      selectedKeys={[router.pathname]}
      style={{ display: 'flex', justifyContent: 'flex-end' }}
      items={items}
    />
  );
};

export default Navigation; 