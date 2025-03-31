import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { stockInService, type StockIn, type StockInRequest, type StockInSearchParams } from '../services/stockInService';

export function useStockIns() {
  const [stockIns, setStockIns] = useState<StockIn[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchParams, setSearchParams] = useState<StockInSearchParams>({
    code: '',
    supplier: '',
    page: 1,
    limit: 10
  });

  const fetchStockIns = useCallback(async (params: StockInSearchParams = searchParams) => {
    setLoading(true);
    try {
      const response = await stockInService.getStockIns(params);
      setStockIns(response.items);
      setTotalItems(response.total);
      setCurrentPage(response.page);
      setPageSize(response.limit);
    } catch (error) {
      console.error('Error fetching stock-ins:', error);
      message.error('Không thể tải danh sách phiếu nhập kho. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchStockIns();
  }, [fetchStockIns]);

  const handlePageChange = (page: number, pageSize?: number) => {
    const newParams = {
      ...searchParams,
      page,
      limit: pageSize || 10
    };
    setSearchParams(newParams);
    fetchStockIns(newParams);
  };

  const handleSearch = (code?: string, supplier?: string, fromDate?: string, toDate?: string) => {
    const newParams: StockInSearchParams = {
      ...searchParams,
      code: code || '',
      supplier: supplier || '',
      page: 1 // Reset về trang đầu tiên khi tìm kiếm
    };

    if (fromDate) {
      newParams.fromDate = fromDate;
    } else {
      delete newParams.fromDate;
    }

    if (toDate) {
      newParams.toDate = toDate;
    } else {
      delete newParams.toDate;
    }

    setSearchParams(newParams);
    fetchStockIns(newParams);
  };

  const resetSearch = () => {
    const newParams: StockInSearchParams = {
      code: '',
      supplier: '',
      page: 1,
      limit: pageSize
    };
    // Không đưa các tham số date vào params khi reset
    setSearchParams(newParams);
    fetchStockIns(newParams);
  };

  const createStockIn = async (data: StockInRequest): Promise<boolean> => {
    setLoading(true);
    try {
      await stockInService.createStockIn(data);
      message.success('Tạo phiếu nhập kho thành công');
      fetchStockIns();
      return true;
    } catch (error: any) {
      console.error('Error creating stock-in:', error);
      message.error(error?.message || 'Không thể tạo phiếu nhập kho. Vui lòng thử lại sau.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    stockIns,
    loading,
    totalItems,
    currentPage,
    pageSize,
    searchParams,
    handlePageChange,
    handleSearch,
    resetSearch,
    createStockIn
  };
} 