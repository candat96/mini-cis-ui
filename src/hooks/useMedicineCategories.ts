import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { medicineCategoryService, type MedicineCategory, type MedicineCategoryRequest, type MedicineCategorySearchParams } from '../services/medicineCategoryService';

export function useMedicineCategories() {
  const [categories, setCategories] = useState<MedicineCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchParams, setSearchParams] = useState<MedicineCategorySearchParams>({
    name: '',
    code: '',
    page: 1,
    limit: 10
  });

  const fetchCategories = useCallback(async (params: MedicineCategorySearchParams = searchParams) => {
    setLoading(true);
    try {
      const response = await medicineCategoryService.getMedicineCategories(params);
      setCategories(response.items);
      setTotalItems(response.total);
      setCurrentPage(response.page);
      setPageSize(response.limit);
    } catch (error) {
      console.error('Error fetching medicine categories:', error);
      message.error('Không thể tải danh sách loại thuốc. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handlePageChange = (page: number, pageSize?: number) => {
    const newParams = {
      ...searchParams,
      page,
      limit: pageSize || 10
    };
    setSearchParams(newParams);
    fetchCategories(newParams);
  };

  const handleSearch = (name?: string, code?: string) => {
    const newParams = {
      ...searchParams,
      name: name || '',
      code: code || '',
      page: 1 // Reset về trang đầu tiên khi tìm kiếm
    };
    setSearchParams(newParams);
    fetchCategories(newParams);
  };

  const resetSearch = () => {
    const newParams = {
      name: '',
      code: '',
      page: 1,
      limit: pageSize
    };
    setSearchParams(newParams);
    fetchCategories(newParams);
  };

  const createCategory = async (data: MedicineCategoryRequest): Promise<boolean> => {
    setLoading(true);
    try {
      await medicineCategoryService.createMedicineCategory(data);
      message.success('Thêm loại thuốc thành công');
      fetchCategories();
      return true;
    } catch (error: any) {
      console.error('Error creating medicine category:', error);
      message.error(error?.message || 'Không thể thêm loại thuốc. Vui lòng thử lại sau.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id: string, data: MedicineCategoryRequest): Promise<boolean> => {
    setLoading(true);
    try {
      await medicineCategoryService.updateMedicineCategory(id, data);
      message.success('Cập nhật loại thuốc thành công');
      fetchCategories();
      return true;
    } catch (error: any) {
      console.error('Error updating medicine category:', error);
      message.error(error?.message || 'Không thể cập nhật loại thuốc. Vui lòng thử lại sau.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    setLoading(true);
    try {
      await medicineCategoryService.deleteMedicineCategory(id);
      message.success('Xóa loại thuốc thành công');
      fetchCategories();
      return true;
    } catch (error: any) {
      console.error('Error deleting medicine category:', error);
      message.error(error?.message || 'Không thể xóa loại thuốc. Vui lòng thử lại sau.');
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
    handlePageChange,
    handleSearch,
    resetSearch,
    createCategory,
    updateCategory,
    deleteCategory
  };
} 