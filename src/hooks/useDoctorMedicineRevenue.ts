import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import dayjs from 'dayjs';
import { reportService } from '../services/reportService';
import type { DoctorMedicineRevenue, DoctorMedicineRevenueParams } from '../services/reportService';

export function useDoctorMedicineRevenue(initialDoctorId?: string) {
  const [reportData, setReportData] = useState<DoctorMedicineRevenue | null>(null);
  const [loading, setLoading] = useState(false);
  const [doctorId, setDoctorId] = useState<string | undefined>(initialDoctorId);
  const [params, setParams] = useState<DoctorMedicineRevenueParams>({
    fromDate: dayjs().subtract(3, 'month').format('YYYY-MM-DD'),
    toDate: dayjs().format('YYYY-MM-DD'),
  });

  const fetchDoctorMedicineRevenue = useCallback(async (
    id: string | undefined, 
    searchParams: DoctorMedicineRevenueParams = params
  ) => {
    if (!id) {
      setReportData(null);
      return;
    }

    setLoading(true);
    try {
      const data = await reportService.getDoctorMedicineRevenue(id, searchParams);
      setReportData(data);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu báo cáo doanh thu thuốc theo bác sĩ:', error);
      message.error('Không thể tải báo cáo doanh thu thuốc. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    if (doctorId) {
      fetchDoctorMedicineRevenue(doctorId);
    }
  }, [doctorId, fetchDoctorMedicineRevenue]);

  const handleDoctorChange = (newDoctorId: string) => {
    setDoctorId(newDoctorId);
  };

  const handleParamsChange = (fromDate?: string, toDate?: string) => {
    const newParams: DoctorMedicineRevenueParams = {
      fromDate: fromDate || params.fromDate,
      toDate: toDate || params.toDate,
    };
    setParams(newParams);
    if (doctorId) {
      fetchDoctorMedicineRevenue(doctorId, newParams);
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