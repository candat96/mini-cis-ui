import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Typography, Card, Table, Input, Button, Space, DatePicker, Modal, Form, Pagination, Tag, Select, InputNumber, Divider, Alert } from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined,
  EyeOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import AppLayout from '../components/AppLayout';
import { useStockIns } from '../hooks/useStockIns';
import { useMedicines } from '../hooks/useMedicines';
import type { StockIn, StockInDetailRequest, StockInRequest } from '../services/stockInService';
import type { Medicine } from '../services/medicineService';

const { Title, Paragraph } = Typography;
const { RangePicker } = DatePicker;
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

// Hàm định dạng ngày giờ
const formatDate = (dateString: string): string => {
  return dayjs(dateString).format('DD/MM/YYYY');
};

export default function StockInsPage() {
  const [selectedStockIn, setSelectedStockIn] = useState<StockIn | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [detailsForm] = Form.useForm();
  const [details, setDetails] = useState<(StockInDetailRequest & { key: string, medicineName?: string, amount?: number })[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // Sử dụng custom hook để quản lý phiếu nhập kho
  const { 
    stockIns, 
    loading, 
    totalItems, 
    currentPage, 
    pageSize, 
    searchParams,
    handlePageChange, 
    handleSearch, 
    resetSearch,
    createStockIn,
  } = useStockIns();

  const { medicines, loading: medicinesLoading } = useMedicines();

  // Tính tổng tiền mỗi khi danh sách chi tiết thay đổi
  useEffect(() => {
    const total = details.reduce((sum, item) => sum + (item.amount || 0), 0);
    setTotalAmount(total);
  }, [details]);

  // Xử lý hiển thị chi tiết phiếu nhập
  const showDetailModal = (stockIn: StockIn) => {
    setSelectedStockIn(stockIn);
    setDetailModalVisible(true);
  };

  // Xử lý đóng modal chi tiết
  const handleDetailModalClose = () => {
    setDetailModalVisible(false);
    setSelectedStockIn(null);
  };

  // Xử lý mở modal tạo mới
  const showCreateModal = () => {
    setCreateModalVisible(true);
  };

  // Xử lý đóng modal tạo mới
  const handleCreateModalClose = () => {
    setCreateModalVisible(false);
    form.resetFields();
    detailsForm.resetFields();
    setDetails([]);
    setSelectedMedicine(null);
    setTotalAmount(0);
    setShowSuccessMessage(false);
  };

  // Xử lý khi chọn thuốc
  const handleMedicineChange = (value: string) => {
    const selected = medicines.find(m => m.id === value);
    setSelectedMedicine(selected || null);
    
    // Tự động điền đơn giá là giá nhập của thuốc
    if (selected) {
      detailsForm.setFieldsValue({
        unitPrice: selected.buyPrice
      });
    }
  };

  // Xử lý khi thêm thuốc vào danh sách
  const handleAddDetail = () => {
    detailsForm.validateFields().then(values => {
      const key = Date.now().toString();
      const medicine = medicines.find(m => m.id === values.medicineId);
      const quantity = Number(values.quantity);
      const unitPrice = Number(values.unitPrice);
      const amount = quantity * unitPrice;
      
      const newDetail = {
        ...values,
        key,
        quantity,
        unitPrice,
        medicineName: medicine?.name,
        amount
      };
      
      setDetails([...details, newDetail]);
      detailsForm.resetFields();
      setSelectedMedicine(null);
    });
  };

  // Xử lý khi xóa thuốc khỏi danh sách
  const handleRemoveDetail = (key: string) => {
    setDetails(details.filter(detail => detail.key !== key));
  };

  // Xử lý khi submit form
  const handleSubmit = () => {
    form.validateFields().then(async values => {
      if (details.length === 0) {
        return;
      }

      const stockInData: StockInRequest = {
        ...values,
        stockInDate: dayjs(values.stockInDate).toISOString(),
        details: details.map(detail => ({
          medicineId: detail.medicineId,
          quantity: detail.quantity,
          unitPrice: Number(detail.unitPrice),
          expiryDate: dayjs(detail.expiryDate).toISOString(),
          batchNumber: detail.batchNumber,
        }))
      };

      const success = await createStockIn(stockInData);
      if (success) {
        setShowSuccessMessage(true);
        // Reset form và danh sách chi tiết
        form.resetFields();
        setDetails([]);
        
        // Đóng modal sau 2 giây
        setTimeout(() => {
          handleCreateModalClose();
        }, 2000);
      }
    });
  };

  // Xử lý thay đổi khoảng thời gian tìm kiếm
  const handleDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      const fromDate = dates[0].toISOString();
      const toDate = dates[1].toISOString();
      handleSearch(searchParams.code, searchParams.supplier, fromDate, toDate);
    } else {
      handleSearch(searchParams.code, searchParams.supplier);
    }
  };

  // Cột trong bảng chi tiết
  const detailColumns = [
    {
      title: 'Tên thuốc',
      dataIndex: 'medicineName',
      key: 'medicineName',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Đơn giá',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (price: number) => formatCurrency(price)
    },
    {
      title: 'Thành tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => formatCurrency(amount)
    },
    {
      title: 'Hạn sử dụng',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: (date: any) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'Số lô',
      dataIndex: 'batchNumber',
      key: 'batchNumber',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: any) => (
        <Button 
          icon={<DeleteOutlined />} 
          danger
          onClick={() => handleRemoveDetail(record.key)}
        >
          Xóa
        </Button>
      ),
    },
  ];

  const columns = [
    {
      title: 'Mã phiếu',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Ngày nhập',
      dataIndex: 'stockInDate',
      key: 'stockInDate',
      render: (date: string) => formatDate(date)
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: 'supplier',
      key: 'supplier',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => formatCurrency(amount)
    },
    {
      title: 'Số loại thuốc',
      key: 'medicineCount',
      render: (_: any, record: StockIn) => record.details.length
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
      render: (_: any, record: StockIn) => (
        <Button 
          icon={<EyeOutlined />} 
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
        <title>Danh sách phiếu nhập kho - Tâm Đức</title>
      </Head>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2}>Danh sách phiếu nhập kho</Title>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={showCreateModal}
        >
          Tạo phiếu nhập
        </Button>
      </div>
      
      <Card>
        <div className="mb-4 flex flex-wrap gap-4">
          <Input
            placeholder="Tìm theo mã phiếu"
            prefix={<SearchOutlined />}
            style={{ width: 200 }}
            value={searchParams.code}
            onChange={e => handleSearch(e.target.value, searchParams.supplier, searchParams.fromDate, searchParams.toDate)}
            allowClear
          />
          <Input
            placeholder="Tìm theo nhà cung cấp"
            prefix={<SearchOutlined />}
            style={{ width: 200 }}
            value={searchParams.supplier}
            onChange={e => handleSearch(searchParams.code, e.target.value, searchParams.fromDate, searchParams.toDate)}
            allowClear
          />
          <RangePicker 
            style={{ width: 300 }} 
            onChange={handleDateRangeChange}
            placeholder={['Từ ngày', 'Đến ngày']}
          />
          <Button type="primary" onClick={() => handleSearch(searchParams.code, searchParams.supplier, searchParams.fromDate, searchParams.toDate)}>Tìm kiếm</Button>
          <Button onClick={resetSearch}>Đặt lại</Button>
        </div>
        
        <Table 
          dataSource={stockIns} 
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

      {/* Modal hiển thị chi tiết phiếu nhập */}
      <Modal
        title={`Chi tiết phiếu nhập - ${selectedStockIn?.code}`}
        open={detailModalVisible}
        onCancel={handleDetailModalClose}
        footer={[
          <Button key="close" onClick={handleDetailModalClose}>
            Đóng
          </Button>
        ]}
        width={1000}
      >
        {selectedStockIn && (
          <div>
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex-1">
                <p><strong>Mã phiếu:</strong> {selectedStockIn.code}</p>
                <p><strong>Ngày nhập:</strong> {formatDate(selectedStockIn.stockInDate)}</p>
              </div>
              <div className="flex-1">
                <p><strong>Nhà cung cấp:</strong> {selectedStockIn.supplier}</p>
                <p><strong>Tổng tiền:</strong> {formatCurrency(selectedStockIn.totalAmount)}</p>
              </div>
              <div className="flex-1">
                <p><strong>Ghi chú:</strong> {selectedStockIn.note || 'Không có'}</p>
                <p><strong>Ngày tạo:</strong> {formatDate(selectedStockIn.createdAt)}</p>
              </div>
            </div>
            
            <h3 className="text-lg font-medium mb-2">Danh sách thuốc</h3>
            <Table 
              dataSource={selectedStockIn.details} 
              rowKey="id"
              pagination={false}
              columns={[
                {
                  title: 'Tên thuốc',
                  dataIndex: ['medicine', 'name'],
                  key: 'medicineName',
                },
                {
                  title: 'Mã thuốc',
                  dataIndex: ['medicine', 'code'],
                  key: 'medicineCode',
                },
                {
                  title: 'Đơn vị',
                  dataIndex: ['medicine', 'unit'],
                  key: 'unit',
                },
                {
                  title: 'Số lượng',
                  dataIndex: 'quantity',
                  key: 'quantity',
                },
                {
                  title: 'Đơn giá',
                  dataIndex: 'unitPrice',
                  key: 'unitPrice',
                  render: (price: number) => formatCurrency(price)
                },
                {
                  title: 'Thành tiền',
                  dataIndex: 'amount',
                  key: 'amount',
                  render: (amount: number) => formatCurrency(amount)
                },
                {
                  title: 'Hạn sử dụng',
                  dataIndex: 'expiryDate',
                  key: 'expiryDate',
                  render: (date: string) => formatDate(date)
                },
                {
                  title: 'Số lô',
                  dataIndex: 'batchNumber',
                  key: 'batchNumber',
                }
              ]}
            />
          </div>
        )}
      </Modal>

      {/* Modal tạo phiếu nhập mới */}
      <Modal
        title="Tạo phiếu nhập kho"
        open={createModalVisible}
        onCancel={handleCreateModalClose}
        width={'calc(100vw - 200px)'}
        footer={[
          <Button key="cancel" onClick={handleCreateModalClose}>
            Hủy
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            onClick={handleSubmit}
            loading={loading}
            disabled={details.length === 0}
          >
            Tạo phiếu nhập
          </Button>
        ]}
      >
        {showSuccessMessage && (
          <Alert
            message="Tạo phiếu nhập kho thành công!"
            type="success"
            showIcon
            className="mb-4"
          />
        )}
        
        <Form
          form={form}
          layout="vertical"
          className="mb-6"
        >
          <div className="flex gap-4">
            <Form.Item
              name="stockInDate"
              label="Ngày nhập"
              rules={[{ required: true, message: 'Vui lòng chọn ngày nhập!' }]}
              className="flex-1"
            >
              <DatePicker 
                style={{ width: '100%' }} 
                format="DD/MM/YYYY"
                disabledDate={(current) => current && current > dayjs().endOf('day')}
              />
            </Form.Item>
            
            <Form.Item
              name="supplier"
              label="Nhà cung cấp"
              rules={[{ required: true, message: 'Vui lòng nhập tên nhà cung cấp!' }]}
              className="flex-1"
            >
              <Input placeholder="Nhập tên nhà cung cấp" />
            </Form.Item>
            
            <Form.Item
              name="note"
              label="Ghi chú"
              className="flex-1"
            >
              <Input placeholder="Nhập ghi chú (nếu có)" />
            </Form.Item>
          </div>
        </Form>
        
        <Card title="Chi tiết thuốc" className="mb-6">
          <Form
            form={detailsForm}
            layout="vertical"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Form.Item
                name="medicineId"
                label="Thuốc"
                rules={[{ required: true, message: 'Vui lòng chọn thuốc!' }]}
              >
                <Select
                  showSearch
                  placeholder="Chọn thuốc"
                  loading={medicinesLoading}
                  onChange={handleMedicineChange}
                  optionFilterProp="children"
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
                name="unitPrice"
                label="Đơn giá"
                rules={[{ required: true, message: 'Vui lòng nhập đơn giá!' }]}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  min={0} 
                  placeholder="Nhập đơn giá"
                  addonAfter="VNĐ"
                />
              </Form.Item>
            </div>
            
            <div className="flex gap-4">
              <Form.Item
                name="expiryDate"
                label="Hạn sử dụng"
                rules={[{ required: true, message: 'Vui lòng chọn hạn sử dụng!' }]}
                className="flex-1"
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  format="DD/MM/YYYY" 
                  disabledDate={(current) => current && current < dayjs().endOf('day')}
                />
              </Form.Item>
              
              <Form.Item
                name="batchNumber"
                label="Số lô"
                rules={[{ required: true, message: 'Vui lòng nhập số lô!' }]}
                className="flex-1"
              >
                <Input placeholder="Nhập số lô của thuốc" />
              </Form.Item>

              <Form.Item className="flex-1 flex items-end">
                <Button 
                  type="dashed" 
                  icon={<PlusOutlined />} 
                  onClick={handleAddDetail}
                  disabled={!selectedMedicine}
                  style={{ width: '100%' }}
                >
                  Thêm thuốc vào danh sách
                </Button>
              </Form.Item>
            </div>
          </Form>
          
          <Divider className="my-4" />
          
          <Table 
            dataSource={details} 
            columns={detailColumns} 
            rowKey="key"
            pagination={false}
            locale={{ emptyText: 'Chưa có thuốc nào trong danh sách' }}
          />
          
          <div className="mt-4 text-right">
            <Title level={4}>
              Tổng tiền: {formatCurrency(totalAmount)}
            </Title>
          </div>
        </Card>
      </Modal>
    </AppLayout>
  );
} 