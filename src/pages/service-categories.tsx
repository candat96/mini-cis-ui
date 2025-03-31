import { useState } from 'react';
import Head from 'next/head';
import { Typography, Card, Table, Button, Space, Input, Modal, Form, message, Popconfirm, Pagination } from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  EditOutlined,
  DeleteOutlined 
} from '@ant-design/icons';
import AppLayout from '../components/AppLayout';
import { useServiceCategories } from '../hooks/useServiceCategories';
import type { ServiceCategory, ServiceCategoryRequest } from '../services/serviceCategoryService';

const { Title, Paragraph } = Typography;

export default function ServiceCategoriesPage() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [form] = Form.useForm();

  const { 
    categories, 
    loading, 
    totalItems, 
    currentPage, 
    pageSize, 
    searchParams,
    handlePageChange, 
    handleSearch, 
    resetSearch,
    createCategory,
    updateCategory,
    deleteCategory
  } = useServiceCategories();

  const showModal = (category?: ServiceCategory) => {
    if (category) {
      setEditingCategory(category);
      form.setFieldsValue({
        name: category.name,
        code: category.code,
        note: category.note || '',
      });
    } else {
      setEditingCategory(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = () => {
    form.validateFields().then(async (values: ServiceCategoryRequest) => {
      let success;
      
      if (editingCategory) {
        // Cập nhật
        success = await updateCategory(editingCategory.id, values);
      } else {
        // Thêm mới
        success = await createCategory(values);
      }
      
      if (success) {
        setIsModalVisible(false);
        form.resetFields();
      }
    });
  };

  const handleDeleteCategory = async (id: string) => {
    await deleteCategory(id);
  };

  const columns = [
    {
      title: 'Mã loại dịch vụ',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Tên loại dịch vụ',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      ellipsis: true,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: ServiceCategory) => (
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
            onConfirm={() => handleDeleteCategory(record.id)}
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
        <title>Danh mục loại dịch vụ - Tâm Đức</title>
      </Head>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2}>Danh mục loại dịch vụ</Title>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => showModal()}
        >
          Thêm loại dịch vụ
        </Button>
      </div>
      
      <Card>
        <div className="mb-4 flex flex-wrap gap-4">
          <Input
            placeholder="Tìm theo tên"
            prefix={<SearchOutlined />}
            style={{ width: 200 }}
            value={searchParams.name}
            onChange={e => handleSearch(e.target.value, searchParams.code)}
            allowClear
          />
          <Input
            placeholder="Tìm theo mã"
            prefix={<SearchOutlined />}
            style={{ width: 200 }}
            value={searchParams.code}
            onChange={e => handleSearch(searchParams.name, e.target.value)}
            allowClear
          />
          <Button type="primary" onClick={() => handleSearch(searchParams.name, searchParams.code)}>Tìm kiếm</Button>
          <Button onClick={resetSearch}>Đặt lại</Button>
        </div>
        
        <Table 
          dataSource={categories} 
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
        title={editingCategory ? "Sửa loại dịch vụ" : "Thêm loại dịch vụ mới"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form 
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Tên loại dịch vụ"
            rules={[{ required: true, message: 'Vui lòng nhập tên loại dịch vụ!' }]}
          >
            <Input placeholder="Nhập tên loại dịch vụ" />
          </Form.Item>
          
          <Form.Item
            name="code"
            label="Mã loại dịch vụ"
            rules={[{ required: true, message: 'Vui lòng nhập mã loại dịch vụ!' }]}
          >
            <Input placeholder="Nhập mã loại dịch vụ" />
          </Form.Item>
          
          <Form.Item
            name="note"
            label="Ghi chú"
          >
            <Input.TextArea rows={4} placeholder="Nhập ghi chú cho loại dịch vụ" />
          </Form.Item>
          
          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={handleCancel}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingCategory ? "Cập nhật" : "Thêm mới"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </AppLayout>
  );
} 