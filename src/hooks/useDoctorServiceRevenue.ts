import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import dayjs from 'dayjs';
import { reportService } from '../services/reportService';
import type { DoctorServiceRevenue, DoctorServiceRevenueParams } from '../services/reportService';

export function useDoctorServiceRevenue(initialDoctorId?: string) {
  const [reportData, setReportData] = useState<DoctorServiceRevenue | null>(null);
  const [loading, setLoading] = useState(false);
  const [doctorId, setDoctorId] = useState<string | undefined>(initialDoctorId);
  const [params, setParams] = useState<DoctorServiceRevenueParams>({
    fromDate: dayjs().subtract(3, 'month').format('YYYY-MM-DD'),
    toDate: dayjs().format('YYYY-MM-DD'),
  });

  const fetchDoctorServiceRevenue = useCallback(async (
    id: string | undefined, 
    searchParams: DoctorServiceRevenueParams = params
  ) => {
    if (!id) {
      setReportData(null);
      return;
    }

    setLoading(true);
    try {
      const data = await reportService.getDoctorServiceRevenue(id, searchParams);
      setReportData(data);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu báo cáo doanh thu dịch vụ theo bác sĩ:', error);
      message.error('Không thể tải báo cáo doanh thu dịch vụ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    if (doctorId) {
      fetchDoctorServiceRevenue(doctorId);
    }
  }, [doctorId, fetchDoctorServiceRevenue]);

  const handleDoctorChange = (newDoctorId: string) => {
    setDoctorId(newDoctorId);
  };

  const handleParamsChange = (fromDate?: string, toDate?: string) => {
    const newParams: DoctorServiceRevenueParams = {
      fromDate: fromDate || params.fromDate,
      toDate: toDate || params.toDate,
    };
    setParams(newParams);
    if (doctorId) {
      fetchDoctorServiceRevenue(doctorId, newParams);
    }
  };

  return {
    reportData,
    loading,
    doctorId,
    params,
    handleDoctorChange,
    handleParamsChange
  };
} 