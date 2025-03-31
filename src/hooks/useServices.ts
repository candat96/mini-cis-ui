import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { serviceService, type Service, type ServiceRequest, type ServiceSearchParams } from '../services/serviceService';

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchParams, setSearchParams] = useState<ServiceSearchParams>({
    name: '',
    code: '',
    page: 1,
    limit: 10
  });

  const fetchServices = useCallback(async (params: ServiceSearchParams = searchParams) => {
    setLoading(true);
    try {
      const response = await serviceService.getServices(params);
      
      // Chuyển đổi từ response API thành danh sách dịch vụ
      const servicesWithCategoryName = response.items.map(service => ({
        ...service,
        categoryId: service.category.id, // Lưu categoryId từ category
        categoryName: service.category.name // Lưu categoryName từ category
      }));
      
      setServices(servicesWithCategoryName);
      setTotalItems(response.total);
      setCurrentPage(response.page);
      setPageSize(response.limit);
    } catch (error) {
      console.error('Error fetching services:', error);
      message.error('Không thể tải danh sách dịch vụ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handlePageChange = (page: number, pageSize?: number) => {
    const newParams = {
      ...searchParams,
      page,
      limit: pageSize || 10
    };
    setSearchParams(newParams);
    fetchServices(newParams);
  };

  const handleSearch = (name?: string, code?: string, categoryId?: string) => {
    const newParams: ServiceSearchParams = {
      ...searchParams,
      name: name || '',
      code: code || '',
      page: 1 // Reset về trang đầu tiên khi tìm kiếm
    };

    // Chỉ đưa categoryId vào params nếu có giá trị
    if (categoryId) {
      newParams.categoryId = categoryId;
    } else {
      // Loại bỏ categoryId khỏi params nếu không có giá trị
      delete newParams.categoryId;
    }

    setSearchParams(newParams);
    fetchServices(newParams);
  };

  const resetSearch = () => {
    const newParams: ServiceSearchParams = {
      name: '',
      code: '',
      page: 1,
      limit: pageSize
    };
    // Không đưa categoryId vào params khi reset
    setSearchParams(newParams);
    fetchServices(newParams);
  };

  const createService = async (data: ServiceRequest): Promise<boolean> => {
    setLoading(true);
    try {
      await serviceService.createService(data);
      message.success('Thêm dịch vụ thành công');
      fetchServices();
      return true;
    } catch (error: any) {
      console.error('Error creating service:', error);
      message.error(error?.message || 'Không thể thêm dịch vụ. Vui lòng thử lại sau.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateService = async (id: string, data: ServiceRequest): Promise<boolean> => {
    setLoading(true);
    try {
      await serviceService.updateService(id, data);
      message.success('Cập nhật dịch vụ thành công');
      fetchServices();
      return true;
    } catch (error: any) {
      console.error('Error updating service:', error);
      message.error(error?.message || 'Không thể cập nhật dịch vụ. Vui lòng thử lại sau.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteService = async (id: string): Promise<boolean> => {
    setLoading(true);
    try {
      await serviceService.deleteService(id);
      message.success('Xóa dịch vụ thành công');
      fetchServices();
      return true;
    } catch (error: any) {
      console.error('Error deleting service:', error);
      message.error(error?.message || 'Không thể xóa dịch vụ. Vui lòng thử lại sau.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    services,
    loading,
    totalItems,
    currentPage,
    pageSize,
    searchParams,
    handlePageChange,
    handleSearch,
    resetSearch,
    createService,
    updateService,
    deleteService
  };
} 