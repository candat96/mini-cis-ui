import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Card, Form, Input, Button, Typography, message, Divider } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import HttpClient from '../lib/axios';
import { setStoreData, getStoreData } from '../lib/localStorage';

interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    username: string;
    [key: string]: any;
  };
  [key: string]: any;
}

const { Title, Text } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const router = useRouter();
  
  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const token = await getStoreData('token');
      if (token) {
        // User is already logged in, redirect to reception
        router.replace('/reception');
      }
      setInitializing(false);
    };
    
    checkAuth();
  }, [router]);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const response = await HttpClient.post<any, LoginResponse>('/api/auth/login', {
        username: values.username,
        password: values.password
      });

      // HttpClient already returns response.data from the interceptor
      await setStoreData('token', response.accessToken);
      await setStoreData('user', response);
      
      message.success('Đăng nhập thành công');
      router.push('/dashboard');
    } catch (error) {
      message.error('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking authentication
  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div>Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">

      <Card className="w-full max-w-md shadow-lg">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <Image 
              src="/logo.png" 
              alt="Tâm Đức Logo" 
              width={120} 
              height={120} 
              priority 
            />
          </div>
          <Title level={3} className="mb-0">Tâm Đức</Title>
          <Text type="secondary">Hệ thống quản lý phòng khám</Text>
        </div>
        
        <Divider />
        
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
          >
            <Input
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder="Tên đăng nhập"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Mật khẩu"
            />
          </Form.Item>

          <Form.Item className="mb-2">
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              block
              className="h-12"
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
        
        <div className="text-center mt-4">
          <Text type="secondary" className="text-xs">
            © 2023 Tâm Đức - Hệ thống quản lý phòng khám
          </Text>
        </div>
      </Card>
    </div>
  );
}
