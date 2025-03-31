import { useEffect, useState } from 'react';
import Head from 'next/head';
import { Card, Typography, Form, Input, Button, message } from 'antd';
import { getStoreData } from '../lib/localStorage';
import HttpClient from '../lib/axios';
import AppLayout from '../components/AppLayout';

const { Title } = Typography;

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getStoreData('user');
        if (userData) {
          const userInfo = userData.user || userData;
          setUser(userInfo);
          form.setFieldsValue({
            username: userInfo.username,
            email: userInfo.email,
            phone: userInfo.phone,
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [form]);

  const onFinish = async (values: any) => {
    setSaving(true);
    try {
      // Simulated API call to update profile
      // In a real application, replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local storage with new data
      const userData = await getStoreData('user');
      if (userData) {
        const updatedUser = { ...userData.user || userData, ...values };
        await localStorage.setItem('user', JSON.stringify({ ...userData, user: updatedUser }));
        setUser(updatedUser);
      }
      
      message.success('Cập nhật thông tin thành công');
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Cập nhật thông tin thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <Head>
        <title>Thông tin cá nhân - Tâm Đức</title>
      </Head>
      
      <div className="mb-6">
        <Title level={2}>Thông tin cá nhân</Title>
      </div>

      {loading ? (
        <div className="flex justify-center">Đang tải...</div>
      ) : (
        <Card className="max-w-2xl">
          {user && (
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
            >
              <Form.Item
                name="username"
                label="Tên đăng nhập"
                rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
              >
                <Input disabled />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email!' },
                  { type: 'email', message: 'Email không hợp lệ!' }
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="phone"
                label="Số điện thoại"
              >
                <Input />
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  loading={saving}
                >
                  Cập nhật
                </Button>
              </Form.Item>
            </Form>
          )}
        </Card>
      )}
    </AppLayout>
  );
} 