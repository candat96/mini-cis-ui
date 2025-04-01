import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import dayjs from 'dayjs';
import { reportService } from '../services/reportService';
import type { DoctorRevenueReport, DoctorRevenueParams } from '../services/reportService';

export function useDoctorRevenue() {
  const [reportData, setReportData] = useState<DoctorRevenueReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState<DoctorRevenueParams>({
    fromDate: dayjs().startOf('year').format('YYYY-MM-DD'),
    toDate: dayjs().format('YYYY-MM-DD'),
    doctorId: undefined
  });

  const fetchDoctorRevenue = useCallback(async (searchParams: DoctorRevenueParams = params) => {
    setLoading(true);
    try {
      const data = await reportService.getDoctorRevenue(searchParams);
      setReportData(data);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu báo cáo doanh thu theo bác sĩ:', error);
      message.error('Không thể tải báo cáo doanh thu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchDoctorRevenue();
  }, [fetchDoctorRevenue]);

  const handleParamsChange = (newParams: Partial<DoctorRevenueParams>) => {
    const updatedParams = { ...params, ...newParams };
    setParams(updatedParams);
    fetchDoctorRevenue(updatedParams);
  };

  const handleDateRangeChange = (fromDate?: string, toDate?: string) => {
    if (fromDate && toDate) {
      handleParamsChange({ fromDate, toDate });
    }
  };

  const handleDoctorChange = (doctorId?: string) => {
    handleParamsChange({ doctorId });
  };

  return {
    reportData,
    loading,
    params,
    handleDateRangeChange,
    handleDoctorChange,
    fetchDoctorRevenue
  };
} 