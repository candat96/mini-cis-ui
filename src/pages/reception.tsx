import { useState } from 'react';
import Head from 'next/head';
import { Typography, Card, Table, Button, Space, Input, DatePicker, Select, Tag, Pagination } from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import AppLayout from '../components/AppLayout';
import { useAppointments } from '../hooks/useAppointments';
import { useServices } from '../hooks/useServices';
import { useMedicines } from '../hooks/useMedicines';
import { usePrescriptions } from '../hooks/usePrescriptions';
import type { Appointment, AppointmentRequest } from '../services/appointmentService';
import type { Prescription, PrescriptionRequest } from '../services/prescriptionService';
import AppointmentDrawer from '../components/AppointmentDrawer';
import PrescriptionModal from '../components/PrescriptionModal';
import { useDoctors } from '../hooks/useDoctors';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// Hàm định dạng ngày giờ
const formatDateTime = (dateString: string): string => {
  return dayjs(dateString).format('DD/MM/YYYY HH:mm');
};

export default function ReceptionPage() {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [prescriptionModalVisible, setPrescriptionModalVisible] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState<Appointment | null>(null);
  const [currentPrescription, setCurrentPrescription] = useState<Prescription | null>(null);
  
  // Sử dụng custom hook để quản lý lịch khám
  const { 
    appointments, 
    loading, 
    totalItems, 
    currentPage, 
    pageSize, 
    searchParams,
    handlePageChange, 
    handleSearch, 
    resetSearch,
    createAppointment,
    updateAppointment,
    updateAppointmentStatus
  } = useAppointments();

  // Hook để lấy danh sách dịch vụ cho dropdown
  const { services: serviceOptions, loading: loadingServices } = useServices();
  
  // Hook để lấy danh sách thuốc cho đơn thuốc
  const { medicines, loading: loadingMedicines } = useMedicines();
  
  // Hook để lấy danh sách đơn thuốc
  const { createPrescription, updatePrescription } = usePrescriptions();
  
  // Hook để lấy thông tin bác sĩ
  const { doctors, loading: loadingDoctors } = useDoctors();

  // Xử lý hiển thị drawer tạo lịch khám
  const showDrawer = (appointment?: Appointment) => {
    if (appointment) {
      setEditingAppointment(appointment);
    } else {
      setEditingAppointment(null);
    }
    
    setDrawerVisible(true);
  };

  // Xử lý đóng drawer
  const handleDrawerClose = () => {
    setDrawerVisible(false);
    setEditingAppointment(null);
  };

  // Xử lý tạo hoặc cập nhật lịch khám
  const handleSubmitAppointment = async (appointmentData: AppointmentRequest, id?: string): Promise<boolean> => {
    let success;
    if (id) {
      // Cập nhật lịch khám hiện có
      success = await updateAppointment(id, appointmentData);
    } else {
      // Tạo lịch khám mới
      success = await createAppointment(appointmentData);
    }
    
    return success;
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
          searchParams.status,
          searchParams.search,
          startDate,
          endDate
        );
      }
    } else {
      handleSearch(
        searchParams.patientId,
        searchParams.doctorId,
        searchParams.status,
        searchParams.search
      );
    }
  };

  // Xử lý cập nhật trạng thái lịch khám
  const handleUpdateStatus = async (id: string, currentStatus: string) => {
    let newStatus: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
    
    if (currentStatus === 'PENDING') {
      newStatus = 'CONFIRMED';
    } else if (currentStatus === 'CONFIRMED') {
      newStatus = 'COMPLETED';
    } else {
      return; // Không xử lý nếu trạng thái đã là COMPLETED hoặc CANCELLED
    }
    
    await updateAppointmentStatus(id, newStatus);
  };

  // Xử lý hủy lịch khám
  const handleCancelAppointment = async (id: string) => {
    await updateAppointmentStatus(id, 'CANCELLED');
  };

  // Xử lý hiển thị modal kê đơn thuốc
  const showPrescriptionModal = (appointment: Appointment) => {
    setCurrentAppointment(appointment);
    setCurrentPrescription(null);
    setPrescriptionModalVisible(true);
  };

  // Xử lý đóng modal kê đơn thuốc
  const handlePrescriptionModalClose = () => {
    setPrescriptionModalVisible(false);
    setCurrentAppointment(null);
    setCurrentPrescription(null);
  };

  // Xử lý tạo hoặc cập nhật đơn thuốc
  const handleSubmitPrescription = async (prescriptionData: PrescriptionRequest): Promise<boolean> => {
    let success;
    
    // Lấy ID bác sĩ từ appointment nếu không có trong prescriptionData
    const doctorId = prescriptionData.doctorId || currentAppointment?.doctorId || '';
    
    if (currentPrescription) {
      // Cập nhật đơn thuốc hiện có
      success = await updatePrescription(currentPrescription.id, {
        ...prescriptionData,
        doctorId
      });
    } else {
      // Tạo đơn thuốc mới
      success = await createPrescription({
        ...prescriptionData,
        appointmentId: currentAppointment?.id || '',
        doctorId
      });
    }
    
    return success;
  };

  // Định nghĩa các cột cho bảng hiển thị lịch khám
  const columns = [
    {
      title: 'Bệnh nhân',
      key: 'patient',
      render: (_: any, record: Appointment) => (
        <span>{record.patient?.name || 'Không có tên'}</span>
      )
    },
    {
      title: 'Số điện thoại',
      key: 'phone',
      render: (_: any, record: Appointment) => (
        <span>{record.patient?.phone || '-'}</span>
      )
    },
    {
      title: 'Bác sĩ',
      key: 'doctor',
      render: (_: any, record: Appointment) => (
        <span>{record.doctor?.fullname || 'Không có tên'}</span>
      )
    },
    {
      title: 'Ngày giờ khám',
      dataIndex: 'appointmentDate',
      key: 'appointmentDate',
      render: (date: string) => formatDateTime(date)
    },
    {
      title: 'Dịch vụ',
      key: 'services',
      render: (_: any, record: Appointment) => {
        if (record.details && record.details.length > 0) {
          return record.details.length === 1 && record.details[0]?.service
            ? <span>{record.details[0].service.name || 'Không có tên'}</span>
            : <span>{record.details.length} dịch vụ</span>;
        } else if (record.services && record.services.length > 0) {
          return record.services.length === 1
            ? <span>1 dịch vụ</span>
            : <span>{record.services.length} dịch vụ</span>;
        } else {
          return <span>Không có dịch vụ</span>;
        }
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'blue';
        let text = 'Chờ khám';
        let icon = null;
        
        if (status === 'COMPLETED') {
          color = 'green';
          text = 'Đã khám';
          icon = <CheckCircleOutlined />;
        } else if (status === 'CANCELLED') {
          color = 'red';
          text = 'Đã hủy';
          icon = <CloseCircleOutlined />;
        } else if (status === 'CONFIRMED') {
          color = 'geekblue';
          text = 'Đã xác nhận';
          icon = <CheckCircleOutlined />;
        }
        
        return (
          <Tag color={color} icon={icon}>
            {text}
          </Tag>
        );
      }
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
      width: 350,
      render: (_: any, record: Appointment) => (
        <Space>
          <Button 
            size="small" 
            type="primary"
            onClick={() => showDrawer(record)}
          >
            Chi tiết
          </Button>
          
          {record.status !== 'COMPLETED' && record.status !== 'CANCELLED' && (
            <Button 
              size="small" 
              type={record.status === 'PENDING' ? 'primary' : 'default'}
              style={record.status === 'CONFIRMED' ? { backgroundColor: '#52c41a', color: 'white' } : {}}
              onClick={() => handleUpdateStatus(record.id, record.status)}
            >
              {record.status === 'PENDING' ? 'Xác nhận' : 'Hoàn thành'}
            </Button>
          )}
          
          {record.status !== 'CANCELLED' && record.status !== 'COMPLETED' && (
            <Button 
              size="small" 
              danger
              onClick={() => handleCancelAppointment(record.id)}
            >
              Hủy
            </Button>
          )}
          
          {record.status === 'CONFIRMED' && (
            <Button
              size="small"
              icon={<MedicineBoxOutlined />}
              onClick={() => showPrescriptionModal(record)}
            >
              Kê đơn
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <AppLayout>
      <Head>
        <title>Tiếp đón - Tâm Đức</title>
      </Head>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2}>Tiếp đón</Title>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => showDrawer()}
        >
          Tạo lịch khám
        </Button>
      </div>
      
      <Card>
        <div className="mb-4 flex flex-wrap gap-4">
          <Input
            placeholder="Tìm kiếm bệnh nhân"
            prefix={<SearchOutlined />}
            style={{ width: 200, height:40 }}
            value={searchParams.search}
            onChange={e => handleSearch(
              searchParams.patientId,
              searchParams.doctorId,
              searchParams.status,
              e.target.value,
              searchParams.startDate,
              searchParams.endDate
            )}
            allowClear
          />
          <RangePicker 
            style={{ width: 300 , height:40}} 
            onChange={handleDateRangeChange}
            defaultValue={[dayjs().startOf('day'), dayjs().endOf('day')]}
            format="DD/MM/YYYY"
          />
          <Select
            placeholder="Trạng thái"
            style={{ width: 150 , height: 40}}
            value={searchParams.status || 'ALL'}
            onChange={(value: 'ALL' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | undefined) => handleSearch(
              searchParams.patientId,
              searchParams.doctorId,
              value === 'ALL' ? undefined : value as 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | undefined,
              searchParams.search,
              searchParams.startDate,
              searchParams.endDate
            )}
            allowClear
          >
            <Option value="ALL">Tất cả</Option>
            <Option value="PENDING">Chờ khám</Option>
            <Option value="CONFIRMED">Đã xác nhận</Option>
            <Option value="COMPLETED">Đã khám</Option>
            <Option value="CANCELLED">Đã hủy</Option>
          </Select>
          <Button type="primary" onClick={() => handleSearch(
            searchParams.patientId,
            searchParams.doctorId,
            searchParams.status,
            searchParams.search,
            searchParams.startDate,
            searchParams.endDate
          )} className='h-[40px]'>
            Tìm kiếm
          </Button>
          <Button onClick={resetSearch} style={{height:40}}>Đặt lại</Button>
        </div>
        
        <Table 
          dataSource={appointments} 
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
            showTotal={(total) => `Tổng số ${total || 0} mục`}
          />
        </div>
      </Card>

      {/* Sử dụng component Drawer đã tách ra */}
      <AppointmentDrawer
        visible={drawerVisible}
        editingAppointment={editingAppointment}
        onClose={handleDrawerClose}
        onSubmit={handleSubmitAppointment}
        serviceOptions={serviceOptions}
        loadingServices={loadingServices}
        onPrescribe={showPrescriptionModal}
      />
      
      {/* Modal kê đơn thuốc */}
      <PrescriptionModal
        visible={prescriptionModalVisible}
        onCancel={handlePrescriptionModalClose}
        onSubmit={handleSubmitPrescription}
        prescription={currentPrescription || undefined}
        appointmentId={currentAppointment?.id || ''}
        doctorId={currentAppointment?.doctorId || ''}
        medicines={medicines}
        loading={loadingMedicines}
      />
    </AppLayout>
  );
} 