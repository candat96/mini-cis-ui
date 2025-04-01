import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import type { 
  ServiceCategoryRequest, 
  ServiceCategorySearchParams
} from '../services/serviceCategoryService';
import { ServiceCategoryService } from '../services/serviceCategoryService';
import type { ServiceCategory } from '~/services';

export function useServiceCategories() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchParams, setSearchParams] = useState<{name: string; code: string}>({
    name: '',
    code: ''
  });

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const params: ServiceCategorySearchParams = {
        page: currentPage,
        limit: pageSize
      };

      if (searchParams.name) {
        params.name = searchParams.name;
      }

      if (searchParams.code) {
        params.code = searchParams.code;
      }

      const response = await ServiceCategoryService.getServiceCategories(params);
      
      setCategories(response.items);
      setTotalItems(response.total);
      setCurrentPage(response.page);
    } catch (error) {
      console.error('Error fetching service categories:', error);
      message.error('Không thể tải danh sách loại dịch vụ');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchParams]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) setPageSize(pageSize);
  };

  const handleSearch = (name: string, code: string) => {
    setSearchParams({ name, code });
    setCurrentPage(1);
  };

  const resetSearch = () => {
    setSearchParams({ name: '', code: '' });
    setCurrentPage(1);
  };

  const createCategory = async (data: ServiceCategoryRequest) => {
    setLoading(true);
    try {
      await ServiceCategoryService.createServiceCategory(data);
      message.success('Thêm loại dịch vụ thành công!');
      fetchCategories();
      return true;
    } catch (error) {
      console.error('Error creating service category:', error);
      message.error('Không thể thêm loại dịch vụ. Vui lòng thử lại!');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id: string, data: ServiceCategoryRequest) => {
    setLoading(true);
    try {
      await ServiceCategoryService.updateServiceCategory(id, data);
      message.success('Cập nhật loại dịch vụ thành công!');
      fetchCategories();
      return true;
    } catch (error) {
      console.error('Error updating service category:', error);
      message.error('Không thể cập nhật loại dịch vụ. Vui lòng thử lại!');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: string) => {
    setLoading(true);
    try {
      await ServiceCategoryService.deleteServiceCategory(id);
      message.success('Xóa loại dịch vụ thành công!');
      fetchCategories();
      return true;
    } catch (error) {
      console.error('Error deleting service category:', error);
      message.error('Không thể xóa loại dịch vụ. Vui lòng thử lại!');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    categories,
    loading,
    totalItems,
    currentPage,
    pageSize,
    searchParams,
    fetchCategories,
    handlePageChange,
    handleSearch,
    resetSearch,
    createCategory,
    updateCategory,
    deleteCategory
  };
} 