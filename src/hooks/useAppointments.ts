import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import dayjs from 'dayjs';
import { appointmentService, type Appointment, type AppointmentRequest, type AppointmentSearchParams } from '../services/appointmentService';

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchParams, setSearchParams] = useState<AppointmentSearchParams>({
    startDate: dayjs().startOf('day').toISOString(),
    endDate: dayjs().endOf('day').toISOString(),
    page: 1,
    limit: 10
  });

  const fetchAppointments = useCallback(async (params: AppointmentSearchParams = searchParams) => {
    setLoading(true);
    try {
      const response = await appointmentService.getAppointments(params);
      
      // Xử lý nếu response là một mảng thay vì đối tượng phân trang
      if (Array.isArray(response)) {
        setAppointments(response);
        setTotalItems(response.length);
        setCurrentPage(1);
        setPageSize(response.length);
      } else {
        // Nếu response là đối tượng phân trang như mong đợi
        setAppointments(response.items);
        setTotalItems(response.total);
        setCurrentPage(response.page);
        setPageSize(response.limit);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      message.error('Không thể tải danh sách lịch khám. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handlePageChange = (page: number, pageSize?: number) => {
    const newParams = {
      ...searchParams,
      page,
      limit: pageSize || 10
    };
    setSearchParams(newParams);
    fetchAppointments(newParams);
  };

  const handleSearch = (
    patientId?: string,
    doctorId?: string,
    status?: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED',
    search?: string,
    startDate?: string,
    endDate?: string
  ) => {
    const newParams = {
      ...searchParams,
      patientId,
      doctorId,
      status,
      search,
      startDate,
      endDate,
      page: 1
    };
    setSearchParams(newParams);
    fetchAppointments(newParams);
  };

  const resetSearch = () => {
    const defaultParams: AppointmentSearchParams = {
      startDate: dayjs().startOf('day').toISOString(),
      endDate: dayjs().endOf('day').toISOString(),
      page: 1,
      limit: 10
    };
    setSearchParams(defaultParams);
    fetchAppointments(defaultParams);
  };

  const createAppointment = async (data: AppointmentRequest): Promise<boolean> => {
    setLoading(true);
    try {
      await appointmentService.createAppointment(data);
      message.success('Tạo lịch khám thành công');
      fetchAppointments();
      return true;
    } catch (error) {
      console.error('Error creating appointment:', error);
      message.error('Không thể tạo lịch khám. Vui lòng thử lại sau.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateAppointment = async (id: string, data: Partial<AppointmentRequest>): Promise<boolean> => {
    setLoading(true);
    try {
      await appointmentService.updateAppointment(id, data);
      message.success('Cập nhật lịch khám thành công');
      fetchAppointments();
      return true;
    } catch (error) {
      console.error('Error updating appointment:', error);
      message.error('Không thể cập nhật lịch khám. Vui lòng thử lại sau.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteAppointment = async (id: string): Promise<boolean> => {
    setLoading(true);
    try {
      await appointmentService.deleteAppointment(id);
      message.success('Xóa lịch khám thành công');
      fetchAppointments();
      return true;
    } catch (error) {
      console.error('Error deleting appointment:', error);
      message.error('Không thể xóa lịch khám. Vui lòng thử lại sau.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (id: string, status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'): Promise<boolean> => {
    setLoading(true);
    try {
      await appointmentService.updateAppointmentStatus(id, status);
      
      let successMessage = 'Cập nhật trạng thái lịch khám thành công';
      if (status === 'CONFIRMED') {
        successMessage = 'Đã xác nhận lịch khám';
      } else if (status === 'COMPLETED') {
        successMessage = 'Đã hoàn thành lịch khám';
      } else if (status === 'CANCELLED') {
        successMessage = 'Đã hủy lịch khám';
      }
      
      message.success(successMessage);
      fetchAppointments();
      return true;
    } catch (error) {
      console.error('Error updating appointment status:', error);
      message.error('Không thể cập nhật trạng thái lịch khám. Vui lòng thử lại sau.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    appointments,
    loading,
    totalItems,
    currentPage,
    pageSize,
    searchParams,
    handlePageChange,
    handleSearch,
    resetSearch,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    updateAppointmentStatus
  };
} 