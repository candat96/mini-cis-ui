import { useState } from 'react';
import Head from 'next/head';
import { Typography, Card, Table, Input, Button, Space, Tag, Modal, Form, Select, InputNumber, Popconfirm, Pagination } from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import AppLayout from '../components/AppLayout';
import { useMedicines } from '../hooks/useMedicines';
import { useMedicineCategoryOptions } from '../hooks/useMedicineCategoryOptions';
import type { Medicine, MedicineRequest } from '../services/medicineService';

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

export default function MedicinesPage() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [form] = Form.useForm();

  // Sử dụng custom hook để lấy danh sách loại thuốc
  const { categories: medicineCategories, loading: categoriesLoading } = useMedicineCategoryOptions();
  
  // Sử dụng custom hook để quản lý thuốc
  const { 
    medicines, 
    loading, 
    totalItems, 
    currentPage, 
    pageSize, 
    searchParams,
    handlePageChange, 
    handleSearch, 
    resetSearch,
    createMedicine,
    updateMedicine,
    deleteMedicine
  } = useMedicines();

  const showModal = (medicine?: Medicine) => {
    if (medicine) {
      setEditingMedicine(medicine);
      form.setFieldsValue({
        name: medicine.name,
        code: medicine.code,
        unit: medicine.unit,
        sellPrice: medicine.sellPrice,
        buyPrice: medicine.buyPrice,
        manufacturer: medicine.manufacturer,
        categoryId: medicine.categoryId,
        description: medicine.description || '',
      });
    } else {
      setEditingMedicine(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = () => {
    form.validateFields().then(async (values: MedicineRequest) => {
      let success;
      
      if (editingMedicine) {
        // Cập nhật
        success = await updateMedicine(editingMedicine.id, values);
      } else {
        // Thêm mới
        success = await createMedicine(values);
      }
      
      if (success) {
        setIsModalVisible(false);
        form.resetFields();
      }
    });
  };

  const handleDeleteMedicine = async (id: string) => {
    await deleteMedicine(id);
  };

  const columns = [
    {
      title: 'Mã thuốc',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Tên thuốc',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Đơn vị',
      dataIndex: 'unit',
      key: 'unit',
    },
    {
      title: 'Loại thuốc',
      dataIndex: 'categoryName',
      key: 'categoryName',
      render: (text: string) => text ? <Tag color="blue">{text}</Tag> : null,
    },
    {
      title: 'Giá bán',
      dataIndex: 'sellPrice',
      key: 'sellPrice',
      render: (price: number) => formatCurrency(price),
    },
    {
      title: 'Giá nhập',
      dataIndex: 'buyPrice',
      key: 'buyPrice',
      render: (price: number) => formatCurrency(price),
    },
    {
      title: 'Nhà sản xuất',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: Medicine) => (
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
            onConfirm={() => handleDeleteMedicine(record.id)}
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
        <title>Danh mục thuốc - Mini CIS</title>
      </Head>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2}>Danh mục thuốc</Title>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => showModal()}
        >
          Thêm thuốc
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
            placeholder="Lọc theo loại thuốc"
            style={{ width: 250 }}
            value={searchParams.categoryId || undefined}
            onChange={value => handleSearch(searchParams.name, searchParams.code, value)}
            allowClear
            loading={categoriesLoading}
          >
            {medicineCategories.map(category => (
              <Option key={category.id} value={category.id}>{category.name}</Option>
            ))}
          </Select>
          <Button type="primary" onClick={() => handleSearch(searchParams.name, searchParams.code, searchParams.categoryId)}>Tìm kiếm</Button>
          <Button onClick={resetSearch}>Đặt lại</Button>
        </div>
        
        <Table 
          dataSource={medicines} 
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
        title={editingMedicine ? "Sửa thuốc" : "Thêm thuốc mới"}
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
            label="Tên thuốc"
            rules={[{ required: true, message: 'Vui lòng nhập tên thuốc!' }]}
          >
            <Input placeholder="Nhập tên thuốc" />
          </Form.Item>

          <Form.Item
            name="code"
            label="Mã thuốc"
            rules={[]}
          >
            <Input placeholder="Nhập mã thuốc" />
          </Form.Item>
          
          <Form.Item
            name="unit"
            label="Đơn vị"
            rules={[{ required: true, message: 'Vui lòng nhập đơn vị!' }]}
          >
            <Input placeholder="Nhập đơn vị (viên, gói, chai, ...)" />
          </Form.Item>
          
          <Form.Item
            name="categoryId"
            label="Loại thuốc"
            rules={[]}
          >
            <Select placeholder="Chọn loại thuốc" loading={categoriesLoading}>
              {medicineCategories.map(category => (
                <Option key={category.id} value={category.id}>{category.name} ({category.code})</Option>
              ))}
            </Select>
          </Form.Item>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="sellPrice"
              label="Giá bán"
              rules={[{ required: true, message: 'Vui lòng nhập giá bán!' }]}
            >
              <InputNumber 
                style={{ width: '100%' }} 
                placeholder="Nhập giá bán" 
                min={0}
                addonAfter="VNĐ"
              />
            </Form.Item>
            
            <Form.Item
              name="buyPrice"
              label="Giá nhập"
              rules={[{ required: true, message: 'Vui lòng nhập giá nhập!' }]}
            >
              <InputNumber 
                style={{ width: '100%' }} 
                placeholder="Nhập giá nhập" 
                min={0}
                addonAfter="VNĐ"
              />
            </Form.Item>
          </div>
          
          <Form.Item
            name="manufacturer"
            label="Nhà sản xuất"
            rules={[{ required: true, message: 'Vui lòng nhập nhà sản xuất!' }]}
          >
            <Input placeholder="Nhập tên nhà sản xuất" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Mô tả"
          >
            <TextArea rows={4} placeholder="Nhập mô tả thuốc" />
          </Form.Item>
          
          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={handleCancel}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingMedicine ? "Cập nhật" : "Thêm mới"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </AppLayout>
  );
} 