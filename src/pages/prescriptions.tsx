import { useState } from 'react';
import Head from 'next/head';
import { Typography, Card, Table, Button, Space, Input, DatePicker, Select, Tag, Pagination, Modal, Descriptions } from 'antd';
import { 
  SearchOutlined, 
  EyeOutlined,
  CalendarOutlined,
  UserOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import AppLayout from '../components/AppLayout';
import { usePrescriptions } from '../hooks/usePrescriptions';
import type { Prescription } from '../services/prescriptionService';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// Hàm định dạng ngày giờ
const formatDateTime = (dateString: string): string => {
  return dayjs(dateString).format('DD/MM/YYYY HH:mm');
};

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

export default function PrescriptionsPage() {
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  
  // Sử dụng custom hook để quản lý đơn thuốc
  const { 
    prescriptions, 
    loading, 
    totalItems, 
    currentPage, 
    pageSize, 
    searchParams,
    handlePageChange, 
    handleSearch, 
    resetSearch
  } = usePrescriptions();

  // Xử lý hiển thị modal chi tiết
  const showDetailModal = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setDetailModalVisible(true);
  };

  // Xử lý đóng modal chi tiết
  const handleDetailModalClose = () => {
    setDetailModalVisible(false);
    setSelectedPrescription(null);
  };

  // Xử lý thay đổi khoảng thời gian tìm kiếm
  const handleDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      const startDate = dates[0]?.startOf('day').toISOString();
      const endDate = dates[1]?.endOf('day').toISOString();
      if (startDate && endDate) {
        handleSearch(
          searchParams.patientId,
          searchParams.doctorId,
          searchParams.appointmentId,
          searchParams.status,
          startDate,
          endDate
        );
      }
    } else {
      handleSearch(
        searchParams.patientId,
        searchParams.doctorId,
        searchParams.appointmentId,
        searchParams.status
      );
    }
  };

  // Xử lý tìm kiếm theo trạng thái
  const handleStatusChange = (status: 'PENDING' | 'COMPLETED' | 'CANCELLED' | undefined) => {
    handleSearch(
      searchParams.patientId,
      searchParams.doctorId,
      searchParams.appointmentId,
      status,
      searchParams.startDate,
      searchParams.endDate
    );
  };

  // Định nghĩa các cột cho bảng hiển thị đơn thuốc
  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Bệnh nhân',
      key: 'patient',
      render: (_: any, record: Prescription) => (
        <span>{record.appointment?.patient?.name || 'Không có tên'}</span>
      )
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => formatDateTime(date)
    },
    {
      title: 'Ngày khám',
      key: 'appointmentDate',
      render: (_: any, record: Prescription) => (
        <span>{record.appointment?.appointmentDate ? formatDateTime(record.appointment.appointmentDate) : '-'}</span>
      )
    },
    {
      title: 'Bác sĩ',
      key: 'doctor',
      render: (_: any, record: Prescription) => (
        <span>{record.doctor?.fullname || 'Không có tên'}</span>
      )
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: string) => formatCurrency(amount)
    },
    {
      title: 'Số lượng thuốc',
      key: 'medicineCount',
      render: (_: any, record: Prescription) => (
        <span>{record.details?.length || 0}</span>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'blue';
        let text = 'Chờ xử lý';
        
        if (status === 'COMPLETED') {
          color = 'green';
          text = 'Đã hoàn thành';
        } else if (status === 'CANCELLED') {
          color = 'red';
          text = 'Đã hủy';
        }
        
        return (
          <Tag color={color}>
            {text}
          </Tag>
        );
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: Prescription) => (
        <Button 
          icon={<EyeOutlined />} 
          type="primary"
          size="small"
          onClick={() => showDetailModal(record)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <AppLayout>
      <Head>
        <title>Danh sách đơn thuốc - Tâm Đức</title>
      </Head>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2}>Danh sách đơn thuốc</Title>
        </div>
      </div>
      
      <Card>
        <div className="mb-4 flex flex-wrap gap-4">
          <Input
            placeholder="Tìm kiếm..."
            prefix={<SearchOutlined />}
            style={{ width: 200, height: 40 }}
            allowClear
          />
          <RangePicker 
            style={{ width: 300, height: 40 }} 
            onChange={handleDateRangeChange}
            format="DD/MM/YYYY"
          />
          <Select
            placeholder="Trạng thái"
            style={{ width: 150, height: 40 }}
            onChange={handleStatusChange}
            allowClear
          >
            <Option value="PENDING">Chờ xử lý</Option>
            <Option value="COMPLETED">Đã hoàn thành</Option>
            <Option value="CANCELLED">Đã hủy</Option>
          </Select>
          <Button type="primary" onClick={() => handleSearch()} style={{ height: 40 }}>
            Tìm kiếm
          </Button>
          <Button onClick={resetSearch} style={{ height: 40 }}>Đặt lại</Button>
        </div>
        
        <Table 
          dataSource={prescriptions} 
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

      {/* Modal xem chi tiết đơn thuốc */}
      <Modal
        title={`Chi tiết đơn thuốc ${selectedPrescription?.code || ''}`}
        open={detailModalVisible}
        onCancel={handleDetailModalClose}
        footer={[
          <Button key="back" onClick={handleDetailModalClose}>
            Đóng
          </Button>
        ]}
        width={800}
      >
        {selectedPrescription && (
          <div>
            <div className="mb-6">
              <Descriptions title="Thông tin đơn thuốc" bordered size="small" column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}>
                <Descriptions.Item label="Mã đơn">{selectedPrescription.code}</Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">{formatDateTime(selectedPrescription.createdAt)}</Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color={selectedPrescription.status === 'COMPLETED' ? 'green' : selectedPrescription.status === 'CANCELLED' ? 'red' : 'blue'}>
                    {selectedPrescription.status === 'COMPLETED' ? 'Đã hoàn thành' : selectedPrescription.status === 'CANCELLED' ? 'Đã hủy' : 'Chờ xử lý'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Bệnh nhân" span={2}>
                  {selectedPrescription.appointment?.patient?.name || 'Không có tên'}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày khám">
                  {selectedPrescription.appointment?.appointmentDate ? formatDateTime(selectedPrescription.appointment.appointmentDate) : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Bác sĩ" span={2}>
                  {selectedPrescription.doctor?.fullname || 'Không có tên'}
                </Descriptions.Item>
                <Descriptions.Item label="Tổng tiền">
                  {formatCurrency(selectedPrescription.totalAmount || 0)}
                </Descriptions.Item>
                <Descriptions.Item label="Ghi chú" span={3}>
                  {selectedPrescription.note || '-'}
                </Descriptions.Item>
              </Descriptions>
            </div>

            <Title level={5}>Chi tiết thuốc</Title>
            <Table 
              dataSource={selectedPrescription.details || []} 
              rowKey="id"
              pagination={false}
              columns={[
                {
                  title: 'Tên thuốc',
                  dataIndex: ['medicine', 'name'],
                  key: 'medicineName',
                },
                {
                  title: 'Số lượng',
                  dataIndex: 'quantity',
                  key: 'quantity',
                },
                {
                  title: 'Liều dùng',
                  dataIndex: 'dosage',
                  key: 'dosage',
                },
                {
                  title: 'Tần suất',
                  dataIndex: 'frequency',
                  key: 'frequency',
                },
                {
                  title: 'Thời gian',
                  dataIndex: 'duration',
                  key: 'duration',
                },
                {
                  title: 'Đơn giá',
                  dataIndex: 'price',
                  key: 'price',
                  render: (price: string) => formatCurrency(price)
                },
                {
                  title: 'Thành tiền',
                  dataIndex: 'amount',
                  key: 'amount',
                  render: (amount: string) => formatCurrency(amount)
                }
              ]}
            />
          </div>
        )}
      </Modal>
    </AppLayout>
  );
} 