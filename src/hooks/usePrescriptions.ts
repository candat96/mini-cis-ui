import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import dayjs from 'dayjs';
import { 
  prescriptionService, 
  type Prescription, 
  type PrescriptionRequest, 
  type PrescriptionUpdateRequest,
  type PrescriptionSearchParams 
} from '../services/prescriptionService';

export function usePrescriptions() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchParams, setSearchParams] = useState<PrescriptionSearchParams>({
    page: 1,
    limit: 10
  });

  const fetchPrescriptions = useCallback(async (params: PrescriptionSearchParams = searchParams) => {
    setLoading(true);
    try {
      const response = await prescriptionService.getPrescriptions(params);
      setPrescriptions(response.items);
      setTotalItems(response.total);
      setCurrentPage(response.page);
      setPageSize(response.limit);
    } catch (error) {
      console.error('Lỗi khi tải danh sách đơn thuốc:', error);
      message.error('Không thể tải danh sách đơn thuốc. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  const handlePageChange = (page: number, pageSize?: number) => {
    const newParams = {
      ...searchParams,
      page,
      limit: pageSize || 10
    };
    setSearchParams(newParams);
    fetchPrescriptions(newParams);
  };

  const handleSearch = (
    patientId?: string,
    doctorId?: string,
    appointmentId?: string,
    status?: 'PENDING' | 'COMPLETED' | 'CANCELLED',
    startDate?: string,
    endDate?: string
  ) => {
    const newParams: PrescriptionSearchParams = {
      ...searchParams,
      patientId,
      doctorId,
      appointmentId,
      status,
      startDate,
      endDate,
      page: 1
    };
    setSearchParams(newParams);
    fetchPrescriptions(newParams);
  };

  const resetSearch = () => {
    const defaultParams: PrescriptionSearchParams = {
      page: 1,
      limit: 10
    };
    setSearchParams(defaultParams);
    fetchPrescriptions(defaultParams);
  };

  const createPrescription = async (data: PrescriptionRequest): Promise<boolean> => {
    setLoading(true);
    try {
      await prescriptionService.createPrescription(data);
      message.success('Tạo đơn thuốc thành công');
      fetchPrescriptions();
      return true;
    } catch (error: any) {
      console.error('Lỗi khi tạo đơn thuốc:', error);
      message.error(error?.message || 'Không thể tạo đơn thuốc. Vui lòng thử lại sau.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updatePrescription = async (id: string, data: PrescriptionUpdateRequest): Promise<boolean> => {
    setLoading(true);
    try {
      await prescriptionService.updatePrescription(id, data);
      message.success('Cập nhật đơn thuốc thành công');
      fetchPrescriptions();
      return true;
    } catch (error: any) {
      console.error('Lỗi khi cập nhật đơn thuốc:', error);
      message.error(error?.message || 'Không thể cập nhật đơn thuốc. Vui lòng thử lại sau.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deletePrescription = async (id: string): Promise<boolean> => {
    setLoading(true);
    try {
      await prescriptionService.deletePrescription(id);
      message.success('Xóa đơn thuốc thành công');
      fetchPrescriptions();
      return true;
    } catch (error: any) {
      console.error('Lỗi khi xóa đơn thuốc:', error);
      message.error(error?.message || 'Không thể xóa đơn thuốc. Vui lòng thử lại sau.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    prescriptions,
    loading,
    totalItems,
    currentPage,
    pageSize,
    searchParams,
    handlePageChange,
    handleSearch,
    resetSearch,
    createPrescription,
    updatePrescription,
    deletePrescription
  };
} 