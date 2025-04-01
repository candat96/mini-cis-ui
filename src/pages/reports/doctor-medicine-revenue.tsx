import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Typography, Card, DatePicker, Button, Select, Table, Empty, Spin, Row, Col, Statistic } from 'antd';
import { DollarOutlined, FileTextOutlined, MedicineBoxOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import AppLayout from '../../components/AppLayout';
import { useDoctorMedicineRevenue } from '../../hooks/useDoctorMedicineRevenue';
import { useDoctors } from '../../hooks/useDoctors';
import type { DoctorMedicineRevenueItem } from '../../services/reportService';

const { Title, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

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

export default function DoctorMedicineRevenuePage() {
  const { doctors, loading: loadingDoctors } = useDoctors();
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | undefined>();
  const { reportData, loading, params, handleDoctorChange, handleParamsChange } = useDoctorMedicineRevenue();

  // Thiết lập bác sĩ đầu tiên khi danh sách bác sĩ được tải
  useEffect(() => {
    if (doctors.length > 0 && !selectedDoctorId) {
      const firstDoctorId = doctors[0]?.id;
      if (firstDoctorId) {
        setSelectedDoctorId(firstDoctorId);
        handleDoctorChange(firstDoctorId);
      }
    }
  }, [doctors, selectedDoctorId, handleDoctorChange]);

  // Xử lý thay đổi bác sĩ
  const onDoctorChange = (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    handleDoctorChange(doctorId);
  };

  // Xử lý thay đổi khoảng thời gian
  const onDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      const fromDate = dates[0]?.format('YYYY-MM-DD');
      const toDate = dates[1]?.format('YYYY-MM-DD');
      if (fromDate && toDate) {
        handleParamsChange(fromDate, toDate);
      }
    }
  };

  // Định nghĩa cột cho bảng thuốc
  const columns: ColumnsType<DoctorMedicineRevenueItem> = [
    {
      title: 'STT',
      width: 80,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Mã thuốc',
      dataIndex: 'code',
      key: 'code',
      width: 120,
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
      width: 100,
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      key: 'price',
      render: (price) => formatCurrency(price),
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
    },
    {
      title: 'Doanh thu',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (revenue) => formatCurrency(revenue),
    },
  ];

  return (
    <AppLayout>
      <Head>
        <title>Báo cáo doanh thu thuốc theo bác sĩ - Tâm Đức</title>
      </Head>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2}>Báo cáo doanh thu thuốc theo bác sĩ</Title>
          <Paragraph>Xem chi tiết doanh thu từ các thuốc kê đơn của từng bác sĩ</Paragraph>
        </div>
      </div>
      
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <div className="mb-2 font-medium">Bác sĩ</div>
            <Select
              placeholder="Chọn bác sĩ"
              style={{ width: 220, height: 40 }}
              onChange={onDoctorChange}
              value={selectedDoctorId}
              loading={loadingDoctors}
              disabled={loadingDoctors}
            >
              {doctors.map(doctor => (
                <Option key={doctor.id} value={doctor.id}>
                  {doctor.fullname || doctor.fullName}
                </Option>
              ))}
            </Select>
          </div>
          
          <div>
            <div className="mb-2 font-medium">Thời gian</div>
            <RangePicker 
              style={{ width: 300, height: 40 }} 
              onChange={onDateRangeChange}
              format="DD/MM/YYYY"
              defaultValue={[
                dayjs(params.fromDate), 
                dayjs(params.toDate)
              ]}
            />
          </div>
          
          <Button 
            type="primary"
            onClick={() => handleParamsChange(params.fromDate, params.toDate)}
            style={{ height: 40 }}
            disabled={!selectedDoctorId}
          >
            Xem báo cáo
          </Button>
        </div>
      </Card>
      
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Spin size="large" />
        </div>
      ) : reportData ? (
        <>
          <Card className="mb-6">
            <div className="mb-4">
              <div className="text-lg font-medium">Bác sĩ: {reportData.fullname}</div>
              <div className="text-gray-500">
                Thời gian báo cáo: {dayjs(reportData.fromDate).format('DD/MM/YYYY')} - {dayjs(reportData.toDate).format('DD/MM/YYYY')}
              </div>
            </div>
            
            <Row gutter={[24, 24]} className="mb-4">
              <Col xs={24} sm={8}>
                <Statistic 
                  title="Tổng doanh thu" 
                  value={reportData.totalRevenue} 
                  formatter={(value) => formatCurrency(value || 0)}
                  valueStyle={{ color: '#3f8600' }}
                  prefix={<DollarOutlined />}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic 
                  title="Tổng số thuốc đã kê đơn" 
                  value={reportData.totalQuantity} 
                  prefix={<MedicineBoxOutlined />}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic 
                  title="Số đơn thuốc đã kê" 
                  value={reportData.prescriptionCount} 
                  prefix={<FileTextOutlined />}
                />
              </Col>
            </Row>
            
            <Table 
              dataSource={reportData.medicines} 
              columns={columns} 
              rowKey="medicineId"
              pagination={false}
              summary={() => (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={5}>
                    <strong>Tổng cộng</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <strong>{reportData.totalQuantity}</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2}>
                    <strong>{formatCurrency(reportData.totalRevenue)}</strong>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )}
            />
          </Card>
        </>
      ) : (
        <Card>
          <Empty description="Vui lòng chọn bác sĩ để xem báo cáo" />
        </Card>
      )}
    </AppLayout>
  );
} 