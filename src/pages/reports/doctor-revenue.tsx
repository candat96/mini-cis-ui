import { useState } from 'react';
import Head from 'next/head';
import { Typography, Card, DatePicker, Button, Select, Table, Empty, Spin, Row, Col, Statistic } from 'antd';
import { DollarOutlined, FileTextOutlined, TeamOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import AppLayout from '../../components/AppLayout';
import { useDoctorRevenue } from '../../hooks/useDoctorRevenue';
import { useDoctors } from '../../hooks/useDoctors';
import type { DoctorRevenueItem } from '../../services/reportService';

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

export default function DoctorRevenuePage() {
  const { doctors, loading: loadingDoctors } = useDoctors();
  const { reportData, loading, params, handleDateRangeChange, handleDoctorChange } = useDoctorRevenue();
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | undefined>(params.doctorId);

  // Xử lý thay đổi bác sĩ
  const onDoctorChange = (doctorId: string | undefined) => {
    setSelectedDoctorId(doctorId);
    handleDoctorChange(doctorId);
  };

  // Xử lý thay đổi khoảng thời gian
  const onDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      const fromDate = dates[0]?.format('YYYY-MM-DD');
      const toDate = dates[1]?.format('YYYY-MM-DD');
      if (fromDate && toDate) {
        handleDateRangeChange(fromDate, toDate);
      }
    }
  };

  // Định nghĩa cột cho bảng bác sĩ
  const columns: ColumnsType<DoctorRevenueItem> = [
    {
      title: 'STT',
      width: 80,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Họ tên bác sĩ',
      dataIndex: 'fullname',
      key: 'fullname',
    },
    {
      title: 'Tài khoản',
      dataIndex: 'username',
      key: 'username',
      width: 150,
    },
    {
      title: 'Doanh thu dịch vụ',
      dataIndex: 'serviceRevenue',
      key: 'serviceRevenue',
      render: (revenue) => formatCurrency(revenue),
    },
    {
      title: 'Doanh thu thuốc',
      dataIndex: 'medicineRevenue',
      key: 'medicineRevenue',
      render: (revenue) => formatCurrency(revenue),
    },
    {
      title: 'Tổng doanh thu',
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      render: (revenue) => formatCurrency(revenue),
    },
    {
      title: 'Số lượt khám',
      dataIndex: 'appointmentCount',
      key: 'appointmentCount',
      width: 130,
    },
    {
      title: 'Số đơn thuốc',
      dataIndex: 'prescriptionCount',
      key: 'prescriptionCount',
      width: 130,
    },
  ];

  return (
    <AppLayout>
      <Head>
        <title>Báo cáo doanh thu theo bác sĩ - Tâm Đức</title>
      </Head>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2}>Báo cáo doanh thu theo bác sĩ</Title>
          <Paragraph>Xem chi tiết doanh thu tổng hợp của từng bác sĩ</Paragraph>
        </div>
      </div>
      
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <div className="mb-2 font-medium">Bác sĩ</div>
            <Select
              placeholder="Tất cả bác sĩ"
              allowClear
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
            onClick={() => handleDateRangeChange(params.fromDate, params.toDate)}
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
      ) : reportData ? (
        <>
          <Card className="mb-6">
            <div className="mb-2 text-gray-500">
              Thời gian báo cáo: {dayjs(reportData.fromDate).format('DD/MM/YYYY')} - {dayjs(reportData.toDate).format('DD/MM/YYYY')}
            </div>
            
            <Row gutter={[24, 24]} className="mb-6">
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
                  title="Doanh thu dịch vụ" 
                  value={reportData.totalServiceRevenue} 
                  formatter={(value) => formatCurrency(value || 0)}
                  prefix={<TeamOutlined />}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic 
                  title="Doanh thu thuốc" 
                  value={reportData.totalMedicineRevenue} 
                  formatter={(value) => formatCurrency(value || 0)}
                  prefix={<FileTextOutlined />}
                />
              </Col>
            </Row>
            
            <Table 
              dataSource={reportData.doctors} 
              columns={columns} 
              rowKey="doctorId"
              pagination={false}
              summary={() => (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={3}>
                    <strong>Tổng cộng</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <strong>{formatCurrency(reportData.totalServiceRevenue)}</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2}>
                    <strong>{formatCurrency(reportData.totalMedicineRevenue)}</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3}>
                    <strong>{formatCurrency(reportData.totalRevenue)}</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={4} colSpan={2}>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )}
            />
          </Card>
        </>
      ) : (
        <Card>
          <Empty description="Vui lòng chọn khoảng thời gian để xem báo cáo" />
        </Card>
      )}
    </AppLayout>
  );
} 