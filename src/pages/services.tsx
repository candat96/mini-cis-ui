import { useState } from 'react';
import Head from 'next/head';
import { Typography, Card, Table, Input, Button, Space, Tag, Modal, Form, Select, InputNumber, message, Popconfirm, Pagination } from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import AppLayout from '../components/AppLayout';
import { useServiceCategoryOptions } from '../hooks/useServiceCategoryOptions';
import { useServices } from '../hooks/useServices';
import type { Service, ServiceRequest } from '../services/serviceService';

const { Title, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Hàm định dạng tiền VND
const formatCurrency = (value: number | string): string => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numericValue);
};

export default function ServicesPage() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form] = Form.useForm();

  // Sử dụng custom hook để lấy danh sách loại dịch vụ
  const { categories: serviceCategories, loading: categoriesLoading } = useServiceCategoryOptions();
  
  // Sử dụng custom hook để quản lý dịch vụ
  const { 
    services, 
    loading, 
    totalItems, 
    currentPage, 
    pageSize, 
    searchParams,
    handlePageChange, 
    handleSearch, 
    resetSearch,
    createService,
    updateService,
    deleteService
  } = useServices();

  const showModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      form.setFieldsValue({
        name: service.name,
        code: service.code,
        categoryId: service.categoryId,
        price: service.price,
        description: service.description || '',
      });
    } else {
      setEditingService(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = () => {
    form.validateFields().then(async (values: ServiceRequest) => {
      let success;
      
      if (editingService) {
        // Cập nhật
        success = await updateService(editingService.id, values);
      } else {
        // Thêm mới
        success = await createService(values);
      }
      
      if (success) {
        setIsModalVisible(false);
        form.resetFields();
      }
    });
  };

  const handleDeleteService = async (id: string) => {
    await deleteService(id);
  };

  const columns = [
    {
      title: 'Mã dịch vụ',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Tên dịch vụ',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Loại dịch vụ',
      dataIndex: 'categoryName',
      key: 'categoryName',
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => formatCurrency(price),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: Service) => (
        <Space size="middle">
          <Button 
            icon={<EditOutlined />} 
            size="small" 
            type="primary"
            onClick={() => showModal(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa?"
            onConfirm={() => handleDeleteService(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button 
              icon={<DeleteOutlined />} 
              size="small" 
              danger
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <AppLayout>
      <Head>
        <title>Danh mục dịch vụ - Tâm Đức</title>
      </Head>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2}>Danh mục dịch vụ</Title>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => showModal()}
        >
          Thêm dịch vụ
        </Button>
      </div>
      
      <Card>
        <div className="mb-4 flex flex-wrap gap-4">
          <Input
            placeholder="Tìm theo tên"
            prefix={<SearchOutlined />}
            style={{ width: 200 }}
            value={searchParams.name}
            onChange={e => handleSearch(e.target.value, searchParams.code, searchParams.categoryId)}
            allowClear
          />
          <Input
            placeholder="Tìm theo mã"
            prefix={<SearchOutlined />}
            style={{ width: 200 }}
            value={searchParams.code}
            onChange={e => handleSearch(searchParams.name, e.target.value, searchParams.categoryId)}
            allowClear
          />
          <Select
            placeholder="Lọc theo loại dịch vụ"
            style={{ width: 250 }}
            value={searchParams.categoryId || undefined}
            onChange={value => handleSearch(searchParams.name, searchParams.code, value)}
            allowClear
            loading={categoriesLoading}
          >
            {serviceCategories.map(category => (
              <Option key={category.id} value={category.id}>{category.name}</Option>
            ))}
          </Select>
          <Button type="primary" onClick={() => handleSearch(searchParams.name, searchParams.code, searchParams.categoryId)}>Tìm kiếm</Button>
          <Button onClick={resetSearch}>Đặt lại</Button>
        </div>
        
        <Table 
          dataSource={services} 
          columns={columns} 
          loading={loading}
          rowKey="id"
          pagination={false}
        />
        
        <div className="mt-4 flex justify-end">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={totalItems}
            onChange={handlePageChange}
            showSizeChanger
            showQuickJumper
            showTotal={(total) => `Tổng số ${total} mục`}
          />
        </div>
      </Card>

      <Modal
        title={editingService ? "Sửa dịch vụ" : "Thêm dịch vụ mới"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        <Form 
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Tên dịch vụ"
            rules={[{ required: true, message: 'Vui lòng nhập tên dịch vụ!' }]}
          >
            <Input placeholder="Nhập tên dịch vụ" />
          </Form.Item>

          <Form.Item
            name="code"
            label="Mã dịch vụ"
            rules={[]}
          >
            <Input placeholder="Nhập mã dịch vụ" />
          </Form.Item>
          
          <Form.Item
            name="categoryId"
            label="Loại dịch vụ"
            rules={[]}
          >
            <Select placeholder="Chọn loại dịch vụ" loading={categoriesLoading}>
              {serviceCategories.map(category => (
                <Option key={category.id} value={category.id}>{category.name} ({category.code})</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="price"
            label="Giá dịch vụ"
            rules={[{ required: true, message: 'Vui lòng nhập giá dịch vụ!' }]}
          >
            <InputNumber 
              style={{ width: '100%' }} 
              placeholder="Nhập giá dịch vụ" 
              min={0}
              addonAfter="VNĐ"
            />
          </Form.Item>
          
          <Form.Item label="Giá hiển thị" dependencies={['price']}>
            {() => {
              const price = form.getFieldValue('price');
              return (
                <div className="text-lg font-bold text-blue-600">
                  {price ? formatCurrency(price) : '0 ₫'}
                </div>
              );
            }}
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Mô tả"
          >
            <TextArea rows={4} placeholder="Nhập mô tả dịch vụ" />
          </Form.Item>
          
          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={handleCancel}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingService ? "Cập nhật" : "Thêm mới"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </AppLayout>
  );
} 