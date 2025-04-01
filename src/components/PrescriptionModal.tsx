import { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Space, Select, InputNumber, Table, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Prescription, PrescriptionMedicine } from '../services/prescriptionService';

const { TextArea } = Input;
const { Option } = Select;

interface PrescriptionModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (prescription: any) => Promise<boolean>;
  prescription?: Prescription;
  appointmentId: string;
  doctorId: string;
  medicines: Array<{
    id: string;
    name: string;
    code: string;
    unit: string;
  }>;
  loading: boolean;
}

const PrescriptionModal: React.FC<PrescriptionModalProps> = ({
  visible,
  onCancel,
  onSubmit,
  prescription,
  appointmentId,
  doctorId,
  medicines,
  loading
}) => {
  const [form] = Form.useForm();
  const [prescriptionMedicines, setPrescriptionMedicines] = useState<(PrescriptionMedicine & { key: string })[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [medicineForm] = Form.useForm();

  useEffect(() => {
    if (visible) {
      form.resetFields();
      medicineForm.resetFields();
      setSelectedMedicine(null);
      
      if (prescription) {
        form.setFieldsValue({
          note: prescription.note
        });
        
        // Chuyển đổi danh sách thuốc từ prescription sang dạng hiển thị
        if (prescription.medicines && prescription.medicines.length > 0) {
          const medicinesList = prescription.medicines.map(med => ({
            ...med,
            key: med.id || Date.now().toString() + Math.random()
          }));
          setPrescriptionMedicines(medicinesList);
        } else {
          setPrescriptionMedicines([]);
        }
      } else {
        form.setFieldsValue({
          note: ''
        });
        setPrescriptionMedicines([]);
      }
    }
  }, [visible, prescription, form, medicineForm]);

  // Xử lý khi chọn thuốc
  const handleMedicineChange = (value: string) => {
    const selected = medicines.find(m => m.id === value);
    setSelectedMedicine(selected || null);
  };

  // Xử lý khi thêm thuốc vào đơn
  const handleAddMedicine = () => {
    medicineForm.validateFields().then(values => {
      const key = Date.now().toString() + Math.random();
      const medicine = medicines.find(m => m.id === values.medicineId);
      
      const newMedicine = {
        ...values,
        key,
        medicine: {
          id: medicine?.id || '',
          name: medicine?.name || '',
          code: medicine?.code || '',
          unit: medicine?.unit || ''
        }
      };
      
      setPrescriptionMedicines([...prescriptionMedicines, newMedicine]);
      medicineForm.resetFields();
      setSelectedMedicine(null);
    });
  };

  // Xử lý khi xóa thuốc khỏi đơn
  const handleRemoveMedicine = (key: string) => {
    setPrescriptionMedicines(prescriptionMedicines.filter(med => med.key !== key));
  };

  // Xử lý khi submit form
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (prescriptionMedicines.length === 0) {
        message.error('Vui lòng thêm ít nhất một thuốc vào đơn');
        return;
      }
      
      setSubmitting(true);
      
      const prescriptionData = {
        appointmentId,
        doctorId,
        note: values.note,
        medicines: prescriptionMedicines.map(({ key, medicine, ...rest }) => rest)
      };
      
      const success = await onSubmit(prescriptionData);
      
      if (success) {
        setPrescriptionMedicines([]);
        onCancel();
      }
    } catch (error) {
      console.error('Error submitting prescription:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Định nghĩa các cột cho bảng hiển thị thuốc
  const columns = [
    {
      title: 'Tên thuốc',
      dataIndex: 'medicine',
      key: 'medicineName',
      render: (medicine: any) => medicine?.name || 'Không có tên'
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity'
    },
    {
      title: 'Liều dùng',
      dataIndex: 'dosage',
      key: 'dosage'
    },
    {
      title: 'Tần suất',
      dataIndex: 'frequency',
      key: 'frequency'
    },
    {
      title: 'Thời gian',
      dataIndex: 'duration',
      key: 'duration'
    },
    {
      title: 'Hướng dẫn',
      dataIndex: 'instruction',
      key: 'instruction',
      ellipsis: true
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      ellipsis: true
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: any) => (
        <Button 
          type="text" 
          danger 
          icon={<DeleteOutlined />} 
          onClick={() => handleRemoveMedicine(record.key)}
        />
      )
    }
  ];

  return (
    <Modal
      title={prescription ? "Chi tiết đơn thuốc" : "Kê đơn thuốc mới"}
      open={visible}
      onCancel={onCancel}
      width={900}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          onClick={handleSubmit} 
          loading={submitting || loading}
        >
          {prescription ? "Cập nhật" : "Tạo đơn thuốc"}
        </Button>
      ]}
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="note"
          label="Ghi chú"
        >
          <TextArea rows={2} placeholder="Nhập ghi chú cho đơn thuốc" />
        </Form.Item>
      </Form>
      
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">Danh sách thuốc</h3>
        
        <Form
          form={medicineForm}
          layout="vertical"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Form.Item
              name="medicineId"
              label="Thuốc"
              rules={[{ required: true, message: 'Vui lòng chọn thuốc!' }]}
            >
              <Select
                showSearch
                placeholder="Chọn thuốc"
                optionFilterProp="children"
                onChange={handleMedicineChange}
                filterOption={(input, option) =>
                  (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
                }
              >
                {medicines.map(medicine => (
                  <Option key={medicine.id} value={medicine.id}>
                    {medicine.name} ({medicine.unit})
                  </Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item
              name="quantity"
              label="Số lượng"
              rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}
            >
              <InputNumber 
                style={{ width: '100%' }} 
                min={1} 
                placeholder="Nhập số lượng"
              />
            </Form.Item>
            
            <Form.Item
              name="dosage"
              label="Liều dùng"
              rules={[{ required: true, message: 'Vui lòng nhập liều dùng!' }]}
            >
              <Input placeholder="Ví dụ: 1 viên/lần" />
            </Form.Item>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Form.Item
              name="frequency"
              label="Tần suất"
              rules={[{ required: true, message: 'Vui lòng nhập tần suất!' }]}
            >
              <Input placeholder="Ví dụ: 3 lần/ngày" />
            </Form.Item>
            
            <Form.Item
              name="duration"
              label="Thời gian dùng"
              rules={[{ required: true, message: 'Vui lòng nhập thời gian dùng!' }]}
            >
              <Input placeholder="Ví dụ: 5 ngày" />
            </Form.Item>
            
            <Form.Item
              name="instruction"
              label="Hướng dẫn sử dụng"
              rules={[{ required: true, message: 'Vui lòng nhập hướng dẫn!' }]}
            >
              <Input placeholder="Ví dụ: Uống sau ăn" />
            </Form.Item>
          </div>
          
          <Form.Item
            name="note"
            label="Ghi chú thuốc"
          >
            <Input placeholder="Nhập ghi chú cho thuốc này" />
          </Form.Item>
          
          <Form.Item>
            <Button 
              type="dashed" 
              onClick={handleAddMedicine} 
              icon={<PlusOutlined />}
              disabled={!selectedMedicine}
              style={{ width: '100%' }}
            >
              Thêm thuốc vào đơn
            </Button>
          </Form.Item>
        </Form>
        
        <Table 
          dataSource={prescriptionMedicines} 
          columns={columns} 
          rowKey="key"
          pagination={false}
          scroll={{ x: 'max-content' }}
        />
      </div>
    </Modal>
  );
};

export default PrescriptionModal; 