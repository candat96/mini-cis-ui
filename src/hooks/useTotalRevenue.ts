import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import dayjs from 'dayjs';
import { reportService } from '../services/reportService';
import type { TotalRevenueParams, TotalRevenueReport } from '../services/reportService';

export function useTotalRevenue() {
  const [reportData, setReportData] = useState<TotalRevenueReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState<TotalRevenueParams>({
    fromDate: dayjs().startOf('month').format('YYYY-MM-DD'),
    toDate: dayjs().format('YYYY-MM-DD'),
  });

  const fetchTotalRevenue = useCallback(async (searchParams: TotalRevenueParams = params) => {
    setLoading(true);
    try {
      const data = await reportService.getTotalRevenue(searchParams);
      setReportData(data);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu báo cáo doanh thu:', error);
      message.error('Không thể tải báo cáo doanh thu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchTotalRevenue();
  }, [fetchTotalRevenue]);

  const handleParamsChange = (fromDate?: string, toDate?: string, doctorId?: string) => {
    const newParams: TotalRevenueParams = {
      fromDate: fromDate || params.fromDate,
      toDate: toDate || params.toDate,
      doctorId
    };
    setParams(newParams);
    fetchTotalRevenue(newParams);
  };

  return {
    reportData,
    loading,
    params,
    handleParamsChange
  };
} 