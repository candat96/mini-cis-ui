import { useState, useEffect } from 'react';
import { Drawer, Form, Button, Input, Select, DatePicker, TimePicker, Space, Table, message, Card, Statistic } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Typography } from 'antd';
import type { Patient, PatientRequest } from '../services/patientService';
import type { Doctor } from '../services/doctorService';
import type { AppointmentServiceItem, Appointment, AppointmentRequest } from '../services/appointmentService';
import { patientService, doctorService } from '../services';

const { Title } = Typography;
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

interface AppointmentDrawerProps {
  visible: boolean;
  editingAppointment: Appointment | null;
  onClose: () => void;
  onSubmit: (appointment: AppointmentRequest, id?: string) => Promise<boolean>;
  serviceOptions: any[];
  loadingServices: boolean;
}

interface ServiceWithPrice extends AppointmentServiceItem {
  key: string;
  servicePrice?: number;
  amount?: number;
}

const AppointmentDrawer: React.FC<AppointmentDrawerProps> = ({
  visible, 
  editingAppointment, 
  onClose, 
  onSubmit,
  serviceOptions,
  loadingServices
}) => {
  const [form] = Form.useForm();
  const [services, setServices] = useState<ServiceWithPrice[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [newPatientMode, setNewPatientMode] = useState(false);
  const [creatingPatient, setCreatingPatient] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedServicePrice, setSelectedServicePrice] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  // Effect to initialize form when editing appointment
  useEffect(() => {
    if (visible) {
      fetchPatients();
      fetchDoctors();
      
      // Set default values
      const now = dayjs();
      
      if (editingAppointment) {
        // Đang chỉnh sửa lịch khám
        // Lấy ngày và giờ khám từ lịch khám
        const appointmentDate = dayjs(editingAppointment.appointmentDate);
        
        // Set form values
        form.setFieldsValue({
          patientId: editingAppointment.patientId,
          doctorId: editingAppointment.doctorId,
          appointmentDate: appointmentDate,
          appointmentTime: appointmentDate,
          note: editingAppointment.note
        });
        
        // Tìm thông tin bệnh nhân và cập nhật selectedPatient
        if (editingAppointment.patient) {
          const patient: Patient = {
            id: editingAppointment.patient.id,
            code: editingAppointment.patient.code || '',
            name: editingAppointment.patient.name || '',
            gender: editingAppointment.patient.gender as 'MALE' | 'FEMALE' | 'OTHER' | undefined,
            address: editingAppointment.patient.address,
            phone: editingAppointment.patient.phone,
            birthYear: editingAppointment.patient.birthDate 
              ? parseInt(editingAppointment.patient.birthDate.split('-')[0] || '0') 
              : undefined,
            status: 'ACTIVE',
            createdAt: editingAppointment.patient.createdAt || '',
            updatedAt: editingAppointment.patient.updatedAt || ''
          };
          setSelectedPatient(patient);
          
          // Điền thông tin bệnh nhân vào form
          form.setFieldsValue({
            patientName: patient.name,
            patientPhone: patient.phone || '',
            patientGender: patient.gender,
            patientBirthDate: editingAppointment.patient.birthDate ? dayjs(editingAppointment.patient.birthDate) : undefined
          });
        }
        
        // Convert appointment details to services format
        if (editingAppointment.details && editingAppointment.details.length > 0) {
          const servicesList = editingAppointment.details.map(detail => {
            const servicePrice = parseFloat(detail.price);
            const quantity = detail.quantity;
            return {
              serviceId: detail.serviceId,
              quantity: quantity,
              note: detail.note || undefined,
              key: detail.id,
              servicePrice: servicePrice,
              amount: servicePrice * quantity
            };
          });
          setServices(servicesList);
          calculateTotalAmount(servicesList);
        } else if (editingAppointment.services && editingAppointment.services.length > 0) {
          const servicesList = editingAppointment.services.map(service => {
            const serviceData = serviceOptions.find(s => s.id === service.serviceId);
            const servicePrice = serviceData ? parseFloat(serviceData.price) : 0;
            const quantity = service.quantity || 1;
            return {
              ...service,
              key: Date.now() + Math.random().toString(),
              servicePrice: servicePrice,
              amount: servicePrice * quantity
            };
          });
          setServices(servicesList);
          calculateTotalAmount(servicesList);
        } else {
          setServices([]);
          setTotalAmount(0);
        }
      } else {
        // Đang tạo mới lịch khám
        setServices([]);
        setSelectedPatient(null);
        setTotalAmount(0);
        
        // Set default values for date and time
        form.setFieldsValue({
          appointmentDate: now,
          appointmentTime: now
        });
      }
    }
  }, [visible, editingAppointment, form, serviceOptions]);

  // Tính tổng tiền các dịch vụ
  const calculateTotalAmount = (serviceList: ServiceWithPrice[]) => {
    const total = serviceList.reduce((sum, service) => {
      return sum + (service.amount || 0);
    }, 0);
    setTotalAmount(total);
  };

  // Hàm fetch danh sách bệnh nhân
  const fetchPatients = async (search: string | undefined = '') => {
    setLoadingPatients(true);
    try {
      const response = await patientService.getPatients({ 
        name: search || '',
        phone: search || ''
      });
      setPatients(response.items);
    } catch (error) {
      console.error('Error fetching patients:', error);
      message.error('Không thể tải danh sách bệnh nhân');
    } finally {
      setLoadingPatients(false);
    }
  };

  // Hàm fetch danh sách bác sĩ
  const fetchDoctors = async (search: string = '') => {
    setLoadingDoctors(true);
    try {
      const response = await doctorService.getDoctors({ search });
      setDoctors(response.items);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      message.error('Không thể tải danh sách bác sĩ');
    } finally {
      setLoadingDoctors(false);
    }
  };

  // Hàm tạo mới bệnh nhân
  const createPatient = async () => {
    try {
      setCreatingPatient(true);
      
      // Lấy thông tin bệnh nhân từ form
      const birthDate = form.getFieldValue('patientBirthDate');
      
      const patientData: PatientRequest = {
        name: form.getFieldValue('patientName'),
        phone: form.getFieldValue('patientPhone'),
        gender: form.getFieldValue('patientGender'),
        address: form.getFieldValue('patientAddress'),
        birthDate: birthDate ? birthDate.format('YYYY-MM-DD') : undefined
      };
      
      // Validate dữ liệu
      if (!patientData.name) {
        message.error('Vui lòng nhập họ tên bệnh nhân');
        return null;
      }
      
      // Gọi API tạo bệnh nhân
      const newPatient = await patientService.createPatient(patientData);
      
      // Cập nhật danh sách bệnh nhân
      setPatients([...patients, newPatient]);
      
      // Chuyển về chế độ chọn bệnh nhân
      setNewPatientMode(false);
      
      // Chọn bệnh nhân vừa tạo
      form.setFieldsValue({
        patientId: newPatient.id
      });

      // Cập nhật selectedPatient
      setSelectedPatient(newPatient);
      
      message.success('Tạo mới bệnh nhân thành công!');
      return newPatient.id;
    } catch (error) {
      console.error('Error creating patient:', error);
      message.error('Không thể tạo mới bệnh nhân. Vui lòng thử lại sau.');
      return null;
    } finally {
      setCreatingPatient(false);
    }
  };

  // Xử lý chọn dịch vụ
  const handleServiceSelect = (serviceId: string) => {
    const service = serviceOptions.find(s => s.id === serviceId);
    if (service) {
      const price = parseFloat(service.price);
      setSelectedServicePrice(price);
      form.setFieldsValue({
        quantity: 1
      });
    } else {
      setSelectedServicePrice(0);
    }
  };

  // Xử lý thêm dịch vụ
  const handleAddService = () => {
    form.validateFields(['serviceId', 'quantity', 'serviceNote']).then(values => {
      const key = Date.now().toString();
      const service = serviceOptions.find(s => s.id === values.serviceId);
      const servicePrice = service ? parseFloat(service.price) : 0;
      const quantity = values.quantity || 1;
      const amount = servicePrice * quantity;
      
      const newService = {
        serviceId: values.serviceId,
        quantity: quantity,
        note: values.serviceNote,
        key,
        servicePrice,
        amount
      };
      
      const updatedServices = [...services, newService];
      setServices(updatedServices);
      calculateTotalAmount(updatedServices);
      
      // Reset fields
      form.setFieldsValue({
        serviceId: undefined,
        quantity: 1,
        serviceNote: undefined
      });
      setSelectedServicePrice(0);
    }).catch(error => {
      console.log('Validate Failed:', error);
    });
  };

  // Xử lý xóa dịch vụ
  const handleRemoveService = (key: string) => {
    const updatedServices = services.filter(service => service.key !== key);
    setServices(updatedServices);
    calculateTotalAmount(updatedServices);
  };

  // Xử lý tạo hoặc cập nhật lịch khám
  const handleSubmit = () => {
    form.validateFields().then(async values => {
      if (services.length === 0) {
        message.error('Vui lòng thêm ít nhất một dịch vụ');
        return;
      }

      setSubmitting(true);
      try {
        // Xác định patientId (hoặc tạo mới nếu chưa có)
        let patientId = values.patientId;
        
        // Nếu không chọn bệnh nhân từ dropdown, tạo mới bệnh nhân
        if (!patientId) {
          patientId = await createPatient();
          if (!patientId) return; // Nếu tạo bệnh nhân không thành công thì dừng lại
        }

        // Kết hợp ngày và giờ
        const appointmentDate = dayjs(values.appointmentDate)
          .hour(dayjs(values.appointmentTime).hour())
          .minute(dayjs(values.appointmentTime).minute())
          .second(0);

        const appointmentData = {
          patientId,
          doctorId: values.doctorId,
          appointmentDate: appointmentDate.toISOString(),
          note: values.note,
          services: services.map(service => ({
            serviceId: service.serviceId,
            quantity: service.quantity,
            note: service.note
          }))
        };

        const success = await onSubmit(appointmentData, editingAppointment?.id);
        
        if (success) {
          handleClose();
        }
      } finally {
        setSubmitting(false);
      }
    });
  };

  // Xử lý đóng drawer
  const handleClose = () => {
    form.resetFields();
    setServices([]);
    setNewPatientMode(false);
    setSelectedPatient(null);
    setTotalAmount(0);
    setSelectedServicePrice(0);
    onClose();
  };

  // Xử lý khi chọn bệnh nhân
  const handlePatientSelect = (patientId: string) => {
    if (!patientId) {
      // Nếu xóa lựa chọn bệnh nhân, reset form
      form.setFieldsValue({
        patientName: '',
        patientPhone: '',
        patientGender: undefined,
        patientBirthDate: undefined
      });
      setSelectedPatient(null);
      return;
    }
    
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      setSelectedPatient(patient);
      
      // Điền thông tin bệnh nhân vào form
      form.setFieldsValue({
        patientName: patient.name || '',
        patientPhone: patient.phone || '',
        patientGender: patient.gender || undefined,
        patientBirthDate: undefined // Not available in patient obj
      });
    }
  };

  // Định nghĩa các cột cho bảng dịch vụ trong drawer
  const serviceColumns = [
    {
      title: 'Tên dịch vụ',
      key: 'serviceName',
      render: (_: any, record: any) => {
        const service = serviceOptions.find(s => s.id === record.serviceId);
        return service ? service.name : '';
      }
    },
    {
      title: 'Đơn giá',
      key: 'price',
      render: (_: any, record: any) => formatCurrency(record.servicePrice || 0),
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Thành tiền',
      key: 'amount',
      render: (_: any, record: any) => formatCurrency(record.amount || 0),
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
      render: (_: any, record: any) => (
        <Button 
          danger 
          size="small" 
          onClick={() => handleRemoveService(record.key)}
        >
          Xóa
        </Button>
      ),
    },
  ];

  return (
    <Drawer
      title={editingAppointment ? "Chi tiết lịch khám" : "Tạo lịch khám mới"}
      width={'calc(100vw - 200px)'}
      onClose={handleClose}
      open={visible}
      bodyStyle={{ paddingBottom: 80 }}
      extra={
        <Space>
          <Button onClick={handleClose}>Hủy</Button>
          <Button type="primary" onClick={handleSubmit} loading={submitting || creatingPatient}>
            {editingAppointment ? "Cập nhật" : "Tạo lịch khám"}
          </Button>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
      >
        {/* Phần thông tin bệnh nhân */}
        <div className="mb-4">
          <div className="mb-2">
            <Title level={5}>Thông tin bệnh nhân</Title>
          </div>

          <div>
            {/* Dropdown chọn bệnh nhân */}
            <Form.Item
              name="patientId"
              label="Tìm kiếm bệnh nhân"
            >
              <Select
                showSearch
                allowClear
                placeholder="Tìm bệnh nhân theo tên hoặc số điện thoại"
                loading={loadingPatients}
                filterOption={false}
                onSearch={(value) => fetchPatients(value)}
                notFoundContent={loadingPatients ? 'Đang tải...' : 'Không tìm thấy bệnh nhân'}
                onChange={handlePatientSelect}
              >
                {patients.map(patient => (
                  <Option key={patient.id} value={patient.id}>
                    {patient.name} {patient.phone ? `(${patient.phone})` : ''} {patient.gender ? `- ${patient.gender === 'MALE' ? 'Nam' : patient.gender === 'FEMALE' ? 'Nữ' : 'Khác'}` : ''}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* Form thông tin bệnh nhân */}
            <div className="bg-gray-50 p-4 rounded">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  name="patientName"
                  label="Họ và tên"
                  rules={[{ required: true, message: 'Vui lòng nhập họ tên bệnh nhân!' }]}
                >
                  <Input placeholder="Nhập họ tên bệnh nhân" />
                </Form.Item>
                
                <Form.Item
                  name="patientPhone"
                  label="Số điện thoại"
                >
                  <Input placeholder="Nhập số điện thoại" />
                </Form.Item>
                
                <div className="flex gap-4 col-span-2">
                  <Form.Item
                    name="patientGender"
                    label="Giới tính"
                    className="w-32"
                  >
                    <Select placeholder="Chọn giới tính">
                      <Option value="MALE">Nam</Option>
                      <Option value="FEMALE">Nữ</Option>
                      <Option value="OTHER">Khác</Option>
                    </Select>
                  </Form.Item>
                  
                  <Form.Item
                    name="patientBirthDate"
                    label="Ngày sinh"
                    className="w-48"
                  >
                    <DatePicker 
                      style={{ width: '100%' }} 
                      format="DD/MM/YYYY"
                      placeholder="Chọn ngày sinh"
                    />
                  </Form.Item>
                  
                  <Form.Item
                    name="patientAddress"
                    label="Địa chỉ"
                    className="flex-1"
                  >
                    <Input placeholder="Nhập địa chỉ" />
                  </Form.Item>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-4">
          <Form.Item
            name="doctorId"
            label="Bác sĩ"
            className="flex-1"
            rules={[{ required: true, message: 'Vui lòng chọn bác sĩ!' }]}
          >
            <Select
              showSearch
              placeholder="Chọn bác sĩ"
              loading={loadingDoctors}
              filterOption={false}
              onSearch={(value) => fetchDoctors(value)}
              notFoundContent={loadingDoctors ? 'Đang tải...' : 'Không tìm thấy bác sĩ'}
            >
              {doctors.map(doctor => (
                <Option key={doctor.id} value={doctor.id}>
                  {doctor.fullName || doctor.fullname}
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="appointmentDate"
            label="Ngày khám"
            rules={[{ required: true, message: 'Vui lòng chọn ngày khám!' }]}
            className="w-48"
          >
            <DatePicker 
              style={{ width: '100%' }} 
              format="DD/MM/YYYY"
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </Form.Item>
          
          <Form.Item
            name="appointmentTime"
            label="Giờ khám"
            rules={[{ required: true, message: 'Vui lòng chọn giờ khám!' }]}
            className="w-36"
          >
            <TimePicker 
              style={{ width: '100%' }} 
              format="HH:mm"
              minuteStep={5}
            />
          </Form.Item>
          
          <Form.Item
            name="note"
            label="Ghi chú"
            className="flex-1"
          >
            <Input placeholder="Nhập ghi chú cho lịch khám" />
          </Form.Item>
        </div>
        
        <div className="bg-gray-50 p-4 rounded mb-4">
          <div className="flex justify-between items-center mb-2">
            <Title level={5}>Thêm dịch vụ</Title>
            <div>
              <Statistic 
                title="Tổng tiền"
                value={totalAmount}
                formatter={(value) => formatCurrency(value || 0)}
                className="text-right"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <Form.Item
              name="serviceId"
              label="Dịch vụ"
              className="flex-1"
            >
              <Select
                showSearch
                placeholder="Chọn dịch vụ"
                loading={loadingServices}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
                }
                onChange={handleServiceSelect}
              >
                {serviceOptions.map(service => (
                  <Option key={service.id} value={service.id}>
                    {service.name} - {formatCurrency(service.price)}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item
              name="quantity"
              label="Số lượng"
              initialValue={1}
              className="w-32"
            >
              <Input type="number" min={1} />
            </Form.Item>
            
            <Form.Item
              name="serviceNote"
              label="Ghi chú dịch vụ"
              className="flex-1"
            >
              <Input placeholder="Nhập ghi chú cho dịch vụ" />
            </Form.Item>
            
            <Form.Item className="flex-none">
              <Button 
                type="dashed" 
                onClick={handleAddService}
                icon={<PlusOutlined />}
              >
                Thêm
              </Button>
            </Form.Item>
          </div>
          
          {selectedServicePrice > 0 && (
            <div className="mb-4">
              <div className="font-medium">Giá dịch vụ: {formatCurrency(selectedServicePrice)}</div>
              <div className="text-gray-500 text-sm">
                Thành tiền: {formatCurrency(selectedServicePrice * (form.getFieldValue('quantity') || 1))}
              </div>
            </div>
          )}
        </div>
        
        <Table 
          dataSource={services} 
          columns={serviceColumns} 
          rowKey="key"
          pagination={false}
          size="small"
          footer={() => (
            <div className="flex justify-end">
              <Statistic 
                title="Tổng cộng"
                value={totalAmount}
                formatter={(value) => formatCurrency(value || 0)}
                className="text-right"
              />
            </div>
          )}
        />
      </Form>
    </Drawer>
  );
};

export default AppointmentDrawer;