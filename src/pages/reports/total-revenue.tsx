import { useState } from 'react';
import Head from 'next/head';
import { Typography, Card, DatePicker, Button, Space, Select, Statistic, Row, Col, Divider, Spin } from 'antd';
import { DollarOutlined, FileTextOutlined, MedicineBoxOutlined, ShoppingOutlined, TeamOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import AppLayout from '../../components/AppLayout';
import { useTotalRevenue } from '../../hooks/useTotalRevenue';
import { useDoctors } from '../../hooks/useDoctors';

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

export default function TotalRevenuePage() {
  const { reportData, loading, params, handleParamsChange } = useTotalRevenue();
  const { doctors, loading: loadingDoctors } = useDoctors();

  // Xử lý thay đổi khoảng thời gian
  const handleDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      const fromDate = dates[0]?.format('YYYY-MM-DD');
      const toDate = dates[1]?.format('YYYY-MM-DD');
      if (fromDate && toDate) {
        handleParamsChange(fromDate, toDate, params.doctorId);
      }
    }
  };

  // Xử lý thay đổi bác sĩ
  const handleDoctorChange = (doctorId: string | undefined) => {
    handleParamsChange(params.fromDate, params.toDate, doctorId);
  };

  return (
    <AppLayout>
      <Head>
        <title>Báo cáo doanh thu tổng hợp - Tâm Đức</title>
      </Head>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2}>Báo cáo doanh thu tổng hợp</Title>
          <Paragraph>Tổng hợp doanh thu dịch vụ và thuốc trong khoảng thời gian</Paragraph>
        </div>
      </div>
      
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <div className="mb-2 font-medium">Thời gian</div>
            <RangePicker 
              style={{ width: 300, height: 40 }} 
              onChange={handleDateRangeChange}
              format="DD/MM/YYYY"
              defaultValue={[
                dayjs(params.fromDate), 
                dayjs(params.toDate)
              ]}
            />
          </div>
          
          <div>
            <div className="mb-2 font-medium">Bác sĩ</div>
            <Select
              placeholder="Tất cả bác sĩ"
              style={{ width: 220, height: 40 }}
              onChange={handleDoctorChange}
              value={params.doctorId}
              allowClear
              loading={loadingDoctors}
            >
              {doctors.map(doctor => (
                <Option key={doctor.id} value={doctor.id}>
                  {doctor.fullname || doctor.fullName}
                </Option>
              ))}
            </Select>
          </div>
          
          <Button 
            type="primary"
            onClick={() => handleParamsChange(params.fromDate, params.toDate, params.doctorId)}
            style={{ height: 40 }}
          >
            Xem báo cáo
          </Button>
        </div>
      </Card>
      
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Spin size="large" />
        </div>
      ) : reportData && (
        <>
          <Card className="mb-6">
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={12} md={8}>
                <Statistic 
                  title="Tổng doanh thu" 
                  value={reportData.totalRevenue} 
                  formatter={(value) => formatCurrency(value || 0)}
                  valueStyle={{ color: '#3f8600' }}
                  prefix={<DollarOutlined />}
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Statistic 
                  title="Doanh thu dịch vụ" 
                  value={reportData.serviceRevenue} 
                  formatter={(value) => formatCurrency(value || 0)}
                  prefix={<MedicineBoxOutlined />}
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Statistic 
                  title="Doanh thu thuốc" 
                  value={reportData.medicineRevenue} 
                  formatter={(value) => formatCurrency(value || 0)}
                  prefix={<ShoppingOutlined />}
                />
              </Col>
            </Row>
          </Card>
          
          <Card>
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={12}>
                <Statistic 
                  title="Số lượng lịch khám" 
                  value={reportData.appointmentCount} 
                  prefix={<TeamOutlined />}
                />
              </Col>
              <Col xs={24} sm={12}>
                <Statistic 
                  title="Số lượng đơn thuốc" 
                  value={reportData.prescriptionCount} 
                  prefix={<FileTextOutlined />}
                />
              </Col>
            </Row>
            
            <Divider />
            
            <div className="text-gray-500">
              <div>Thời gian báo cáo: {dayjs(reportData.fromDate).format('DD/MM/YYYY')} - {dayjs(reportData.toDate).format('DD/MM/YYYY')}</div>
              {params.doctorId && <div>Bác sĩ: {doctors.find(d => d.id === params.doctorId)?.fullname || 'Không xác định'}</div>}
            </div>
          </Card>
        </>
      )}
    </AppLayout>
  );
} 