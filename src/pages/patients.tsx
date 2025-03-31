import Head from 'next/head';
import { Typography, Card, Table, Input, Button, Space, Badge } from 'antd';
import { SearchOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons';
import AppLayout from '../components/AppLayout';

const { Title, Paragraph } = Typography;

export default function PatientsPage() {
  // Dữ liệu mẫu
  const dataSource = [
    {
      key: '1',
      patientId: 'BN001',
      name: 'Nguyễn Văn A',
      gender: 'Nam',
      birthYear: 1985,
      phone: '0901234567',
      address: 'Quận 1, TP.HCM',
      lastVisit: '2023-05-15',
      status: 'active',
    },
    {
      key: '2',
      patientId: 'BN002',
      name: 'Trần Thị B',
      gender: 'Nữ',
      birthYear: 1990,
      phone: '0912345678',
      address: 'Quận 2, TP.HCM',
      lastVisit: '2023-06-20',
      status: 'active',
    },
    {
      key: '3',
      patientId: 'BN003',
      name: 'Lê Văn C',
      gender: 'Nam',
      birthYear: 1978,
      phone: '0923456789',
      address: 'Quận 3, TP.HCM', 
      lastVisit: '2023-01-10',
      status: 'inactive',
    },
  ];

  const columns = [
    {
      title: 'Mã BN',
      dataIndex: 'patientId',
      key: 'patientId',
    },
    {
      title: 'Họ và tên',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <span>
          {text} {' '}
          {record.status === 'active' ? 
            <Badge status="success" /> : 
            <Badge status="default" />
          }
        </span>
      ),
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
    },
    {
      title: 'Năm sinh',
      dataIndex: 'birthYear',
      key: 'birthYear',
    },
    {
      title: 'SĐT',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
    },
    {
      title: 'Lần khám cuối',
      dataIndex: 'lastVisit',
      key: 'lastVisit',
      render: (date: string) => {
        const formattedDate = new Date(date).toLocaleDateString('vi-VN');
        return formattedDate;
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: () => (
        <Button 
          type="primary" 
          size="small" 
          icon={<EyeOutlined />}
        >
          Xem
        </Button>
      ),
    },
  ];

  return (
    <AppLayout>
      <Head>
        <title>Danh sách bệnh nhân - Mini CIS</title>
      </Head>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2}>Danh sách bệnh nhân</Title>
          <Paragraph>Quản lý thông tin bệnh nhân</Paragraph>
        </div>
        <Button type="primary" icon={<PlusOutlined />}>
          Thêm bệnh nhân
        </Button>
      </div>
      
      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder="Tìm kiếm theo tên hoặc mã BN"
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
          />
        </Space>
        <Table dataSource={dataSource} columns={columns} />
      </Card>
    </AppLayout>
  );
} 