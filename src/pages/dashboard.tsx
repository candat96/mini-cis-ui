import { useEffect, useState } from 'react';
import Head from 'next/head';
import { Card, Typography, Space } from 'antd';
import { getStoreData } from '../lib/localStorage';
import AppLayout from '../components/AppLayout';

const { Title, Text } = Typography;

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getStoreData('user');
        if (userData) {
          setUser(userData.user || userData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return (
    <AppLayout>
      <Head>
        <title>Dashboard - Mini CIS</title>
      </Head>
      
      <div className="mb-6">
        <Title level={2}>Dashboard</Title>
      </div>

      {loading ? (
        <div className="flex justify-center">Đang tải...</div>
      ) : (
        <Card title="Thông tin người dùng" className="max-w-2xl">
          {user && (
            <Space direction="vertical" size="middle">
              <div>
                <Text strong>Tên đăng nhập:</Text> {user.username}
              </div>
              <div>
                <Text strong>Email:</Text> {user.email}
              </div>
              <div>
                <Text strong>Số điện thoại:</Text> {user.phone}
              </div>
              <div>
                <Text strong>Vai trò:</Text> {user.role}
              </div>
            </Space>
          )}
        </Card>
      )}
    </AppLayout>
  );
}
