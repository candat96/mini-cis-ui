import { useState } from 'react';
import Head from 'next/head';
import { Typography, Card, Table, Input, Button, Space, Form, Tag } from 'antd';
import { SearchOutlined, DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import AppLayout from '../components/AppLayout';
import { useInventories } from '../hooks/useInventories';

const { Title, Paragraph } = Typography;
const { Search } = Input;

// Hàm định dạng tiền VND
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

export default function InventoryPage() {
  const [form] = Form.useForm();
  const [medicineName, setMedicineName] = useState('');
  const [medicineCode, setMedicineCode] = useState('');
  
  const { 
    inventories, 
    loading, 
    totalItems, 
    currentPage, 
    pageSize, 
    handlePageChange, 
    handleSearch, 
    resetSearch 
  } = useInventories();

  const handleSearchClick = () => {
    handleSearch(medicineName, medicineCode);
  };

  const handleResetSearch = () => {
    setMedicineName('');
    setMedicineCode('');
    resetSearch();
  };

  // Định nghĩa các cột cho bảng
  const columns = [
    {
      title: 'Mã thuốc',
      dataIndex: ['medicine', 'code'],
      key: 'code',
    },
    {
      title: 'Tên thuốc',
      dataIndex: ['medicine', 'name'],
      key: 'name',
    },
    {
      title: 'SL tồn',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity: number) => {
        let color = 'green';
        if (quantity === 0) {
          color = 'red';
        } else if (quantity < 50) {
          color = 'orange';
        }
        return <span style={{ color }}>{quantity}</span>;
      },
    },
    {
      title: 'Đơn vị',
      dataIndex: ['medicine', 'unit'],
      key: 'unit',
    },
    {
      title: 'Giá bán',
      dataIndex: ['medicine', 'sellPrice'],
      key: 'sellPrice',
      render: (price: number) => formatCurrency(price),
    },
    {
      title: 'Giá trị tồn',
      key: 'totalValue',
      render: (record: any) => formatCurrency(record.quantity * record.medicine.sellPrice),
    },
    {
      title: 'Số lô',
      dataIndex: 'batchNumber',
      key: 'batchNumber',
    },
    {
      title: 'Hạn sử dụng',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (record: any) => {
        let color = 'success';
        let text = 'Đủ';
        
        if (record.quantity === 0) {
          color = 'error';
          text = 'Hết';
        } else if (record.quantity < 50) {
          color = 'warning';
          text = 'Thấp';
        }
        
        const isExpired = dayjs(record.expiryDate).isBefore(dayjs());
        if (isExpired) {
          color = 'error';
          text = 'Hết hạn';
        } else if (dayjs(record.expiryDate).diff(dayjs(), 'month') < 3) {
          color = 'warning';
          text = 'Gần hết hạn';
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
  ];

  return (
    <AppLayout>
      <Head>
        <title>Tồn kho thuốc - Mini CIS</title>
      </Head>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2}>Tồn kho thuốc</Title>
        </div>
        <Button type="primary" icon={<DownloadOutlined />}>
          Xuất báo cáo
        </Button>
      </div>
      
      <Card>
        <div className="flex flex-wrap gap-4 mb-4">
          <Input
            placeholder="Tìm theo tên thuốc"
            value={medicineName}
            onChange={e => setMedicineName(e.target.value)}
            style={{ width: 200 }}
          />
          <Input
            placeholder="Tìm theo mã thuốc"
            value={medicineCode}
            onChange={e => setMedicineCode(e.target.value)}
            style={{ width: 200 }}
          />
          <Button 
            type="primary" 
            icon={<SearchOutlined />} 
            onClick={handleSearchClick}
          >
            Tìm kiếm
          </Button>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleResetSearch}
          >
            Đặt lại
          </Button>
        </div>
        
        <Table 
          dataSource={inventories} 
          columns={columns} 
          rowKey="id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalItems,
            onChange: handlePageChange,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
          }}
        />
      </Card>
    </AppLayout>
  );
} 