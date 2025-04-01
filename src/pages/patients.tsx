import { useState } from 'react';
import Head from 'next/head';
import { Typography, Card, Table, Input, Button, Space, Badge, Pagination, message } from 'antd';
import { SearchOutlined, PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import AppLayout from '../components/AppLayout';
import { usePatients } from '../hooks/usePatients';
import type { Patient } from '../services/patientService';

const { Title, Paragraph } = Typography;

export default function PatientsPage() {
  const [searchText, setSearchText] = useState('');
  const { 
    patients, 
    loading, 
    totalItems, 
    currentPage, 
    pageSize, 
    handlePageChange, 
    handleSearch, 
    resetSearch
  } = usePatients();

  // Chuyển đổi giá trị gender từ enum sang text hiển thị
  const renderGender = (gender?: string) => {
    if (gender === 'MALE') return 'Nam';
    if (gender === 'FEMALE') return 'Nữ';
    if (gender === 'OTHER') return 'Khác';
    return '';
  };

  // Hàm định dạng ngày tháng
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Hàm lấy năm từ ngày sinh
  const getBirthYear = (birthDate?: string) => {
    if (!birthDate) return '';
    return new Date(birthDate).getFullYear();
  };

  const columns = [
    {
      title: 'Mã BN',
      dataIndex: 'code',
      key: 'code',
      render: (_: any, record: Patient) => record.code || '-',
    },
    {
      title: 'Họ và tên',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Patient) => (
        <span>
          {text} {' '}
          {record.status === 'ACTIVE' ? 
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
      render: renderGender,
    },
    {
      title: 'Năm sinh',
      dataIndex: 'birthDate',
      key: 'birthDate',
      render: getBirthYear,
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
      render: formatDate,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: Patient) => (
        <Space>
          <Button 
            type="primary" 
            size="small" 
            icon={<EyeOutlined />}
          >
            Xem
          </Button>
          <Button 
            type="default" 
            size="small" 
            icon={<EditOutlined />}
          >
            Sửa
          </Button>
        </Space>
      ),
    },
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleSearchClick = () => {
    handleSearch(searchText, searchText);
  };

  const handleResetSearch = () => {
    setSearchText('');
    resetSearch();
  };

  return (
    <AppLayout>
      <Head>
        <title>Danh sách bệnh nhân - Tâm Đức</title>
      </Head>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2}>Danh sách bệnh nhân</Title>
        </div>
        <Button type="primary" icon={<PlusOutlined />}>
          Thêm bệnh nhân
        </Button>
      </div>
      
      <Card>
        <div className="mb-4 flex flex-wrap gap-4">
          <Input
            placeholder="Tìm kiếm theo tên hoặc SĐT"
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            value={searchText}
            onChange={handleSearchChange}
            onPressEnter={handleSearchClick}
            allowClear
          />
          <Button type="primary" onClick={handleSearchClick}>Tìm kiếm</Button>
          <Button onClick={handleResetSearch}>Đặt lại</Button>
        </div>
        
        <Table 
          dataSource={patients} 
          columns={columns} 
          loading={loading}
          rowKey="id"
          pagination={false}
        />
        
        <div className="mt-4 flex justify-end">
          <Pagination
            current={currentPage || 1}
            pageSize={pageSize || 10}
            total={totalItems || 0}
            onChange={handlePageChange}
            showSizeChanger
            showQuickJumper
            showTotal={(total) => `Tổng số ${total || 0} bệnh nhân`}
          />
        </div>
      </Card>
    </AppLayout>
  );
} 