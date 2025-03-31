import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { inventoryService, type Inventory, type InventorySearchParams } from '../services/inventoryService';

export function useInventories() {
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchParams, setSearchParams] = useState<InventorySearchParams>({
    medicineName: '',
    medicineCode: '',
    page: 1,
    limit: 10
  });

  const fetchInventories = useCallback(async (params: InventorySearchParams = searchParams) => {
    setLoading(true);
    try {
      const response = await inventoryService.getInventories(params);
      setInventories(response.items);
      setTotalItems(response.total);
      setCurrentPage(response.page);
      setPageSize(response.limit);
    } catch (error) {
      console.error('Error fetching inventories:', error);
      message.error('Không thể tải danh sách tồn kho. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchInventories();
  }, [fetchInventories]);

  const handlePageChange = (page: number, pageSize?: number) => {
    const newParams = {
      ...searchParams,
      page,
      limit: pageSize || 10
    };
    setSearchParams(newParams);
    fetchInventories(newParams);
  };

  const handleSearch = (medicineName?: string, medicineCode?: string) => {
    const newParams: InventorySearchParams = {
      ...searchParams,
      medicineName: medicineName || '',
      medicineCode: medicineCode || '',
      page: 1 // Reset về trang đầu tiên khi tìm kiếm
    };

    setSearchParams(newParams);
    fetchInventories(newParams);
  };

  const resetSearch = () => {
    const newParams: InventorySearchParams = {
      medicineName: '',
      medicineCode: '',
      page: 1,
      limit: pageSize
    };
    setSearchParams(newParams);
    fetchInventories(newParams);
  };

  return {
    inventories,
    loading,
    totalItems,
    currentPage,
    pageSize,
    searchParams,
    handlePageChange,
    handleSearch,
    resetSearch
  };
} 