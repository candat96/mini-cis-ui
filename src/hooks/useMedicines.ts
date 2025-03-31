import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { medicineService, type Medicine, type MedicineRequest, type MedicineSearchParams } from '../services/medicineService';

export function useMedicines() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchParams, setSearchParams] = useState<MedicineSearchParams>({
    name: '',
    code: '',
    page: 1,
    limit: 10
  });

  const fetchMedicines = useCallback(async (params: MedicineSearchParams = searchParams) => {
    setLoading(true);
    try {
      const response = await medicineService.getMedicines(params);
      
      // Thêm categoryId và categoryName từ đối tượng category
      const medicinesWithCategories = response.items.map(medicine => ({
        ...medicine,
        categoryId: medicine.category?.id,
        categoryName: medicine.category?.name
      }));
      
      setMedicines(medicinesWithCategories);
      setTotalItems(response.total);
      setCurrentPage(response.page);
      setPageSize(response.limit);
    } catch (error) {
      console.error('Error fetching medicines:', error);
      message.error('Không thể tải danh sách thuốc. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  const handlePageChange = (page: number, pageSize?: number) => {
    const newParams = {
      ...searchParams,
      page,
      limit: pageSize || 10
    };
    setSearchParams(newParams);
    fetchMedicines(newParams);
  };

  const handleSearch = (name?: string, code?: string, categoryId?: string) => {
    const newParams: MedicineSearchParams = {
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
    fetchMedicines(newParams);
  };

  const resetSearch = () => {
    const newParams: MedicineSearchParams = {
      name: '',
      code: '',
      page: 1,
      limit: pageSize
    };
    // Không đưa categoryId vào params khi reset
    setSearchParams(newParams);
    fetchMedicines(newParams);
  };

  const createMedicine = async (data: MedicineRequest): Promise<boolean> => {
    setLoading(true);
    try {
      await medicineService.createMedicine(data);
      message.success('Thêm thuốc thành công');
      fetchMedicines();
      return true;
    } catch (error: any) {
      console.error('Error creating medicine:', error);
      message.error(error?.message || 'Không thể thêm thuốc. Vui lòng thử lại sau.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateMedicine = async (id: string, data: MedicineRequest): Promise<boolean> => {
    setLoading(true);
    try {
      await medicineService.updateMedicine(id, data);
      message.success('Cập nhật thuốc thành công');
      fetchMedicines();
      return true;
    } catch (error: any) {
      console.error('Error updating medicine:', error);
      message.error(error?.message || 'Không thể cập nhật thuốc. Vui lòng thử lại sau.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteMedicine = async (id: string): Promise<boolean> => {
    setLoading(true);
    try {
      await medicineService.deleteMedicine(id);
      message.success('Xóa thuốc thành công');
      fetchMedicines();
      return true;
    } catch (error: any) {
      console.error('Error deleting medicine:', error);
      message.error(error?.message || 'Không thể xóa thuốc. Vui lòng thử lại sau.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    medicines,
    loading,
    totalItems,
    currentPage,
    pageSize,
    searchParams,
    handlePageChange,
    handleSearch,
    resetSearch,
    createMedicine,
    updateMedicine,
    deleteMedicine
  };
} 