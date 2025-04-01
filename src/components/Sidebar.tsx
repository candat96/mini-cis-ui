import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { Layout, Menu, Button, Drawer } from 'antd';
import type { MenuProps } from 'antd';
import {
  UserOutlined,
  MedicineBoxOutlined,
  ShoppingOutlined,
  TeamOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  HomeOutlined,
  MenuOutlined,
  AppstoreOutlined
} from '@ant-design/icons';

const { Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

interface SidebarProps {
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

const Sidebar = ({ collapsed = false, onCollapse }: SidebarProps) => {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);

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

  const toggleCollapsed = () => {
    if (onCollapse) {
      onCollapse(!collapsed);
    }
  };

  const handleMobileMenuClick = () => {
    setMobileDrawerVisible(true);
  };

  const onDrawerClose = () => {
    setMobileDrawerVisible(false);
  };

  const items: MenuItem[] = [
    getItem(<Link href="/reception">Tiếp đón</Link>, '/reception', <HomeOutlined />),
    getItem('Quản lý dịch vụ', 'service-management', <MedicineBoxOutlined />, [
      getItem(<Link href="/service-categories">Danh mục loại dịch vụ</Link>, '/service-categories'),
      getItem(<Link href="/services">Danh mục dịch vụ</Link>, '/services'),
    ]),
    getItem('Quản lý thuốc', 'medicine-management', <ShoppingOutlined />, [
      getItem(<Link href="/medicine-categories">Danh mục loại thuốc</Link>, '/medicine-categories'),
      getItem(<Link href="/medicines">Danh mục thuốc</Link>, '/medicines'),
      getItem(<Link href="/stock-ins">Phiếu nhập kho</Link>, '/stock-ins'),
      getItem(<Link href="/inventory">Tồn kho thuốc</Link>, '/inventory'),
      getItem(<Link href="/prescriptions">Danh sách đơn thuốc</Link>, '/prescriptions'),
    ]),
    getItem(<Link href="/patients">Danh sách bệnh nhân</Link>, '/patients', <TeamOutlined />),
    getItem(<Link href="/profile">Thông tin cá nhân</Link>, '/profile', <UserOutlined />),
  ];

  // Menu component cho cả desktop và mobile
  const menuComponent = (
    <Menu
      mode="inline"
      selectedKeys={[router.pathname]}
      defaultOpenKeys={['service-management', 'medicine-management']}
      items={items}
      className="border-r-0"
      onClick={isMobile ? onDrawerClose : undefined}
    />
  );

  // Mobile menu button
  const mobileMenuButton = isMobile && (
    <Button
      type="text"
      icon={<MenuOutlined />}
      onClick={handleMobileMenuClick}
      className="fixed top-4 left-4 z-20"
    />
  );

  // Mobile drawer
  const mobileDrawer = isMobile && (
    <Drawer
      title={
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="Tâm Đức Logo" width={30} height={30} />
          <span>Tâm Đức</span>
        </div>
      }
      placement="left"
      closable={true}
      onClose={onDrawerClose}
      open={mobileDrawerVisible}
      width={250}
      bodyStyle={{ padding: 0 }}
    >
      {menuComponent}
    </Drawer>
  );

  // Desktop sidebar
  const desktopSidebar = !isMobile && (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      width={250}
      theme="light"
      className="min-h-screen shadow-md"
      style={{ 
        position: 'fixed', 
        left: 0, 
        top: 0, 
        bottom: 0,
        zIndex: 10
      }}
      trigger={null}
    >
      <div className="flex justify-center items-center p-4">
        {!collapsed && <Image src="/logo.png" alt="Tâm Đức Logo" width={30} height={30} className="mr-2" />}
        <h2 className={`text-primary text-xl font-bold transition-opacity ${collapsed ? 'opacity-0' : 'opacity-100'}`}>
          Tâm Đức
        </h2>
      </div>
      
      {menuComponent}
      
      <div className="absolute bottom-4 w-full flex justify-center">
        <Button 
          type="text"
          onClick={toggleCollapsed}
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        />
      </div>
    </Sider>
  );

  return (
    <>
      {mobileMenuButton}
      {mobileDrawer}
      {desktopSidebar}
    </>
  );
};

export default Sidebar; 