import { useState, useEffect } from 'react';
import { message } from 'antd';
import { ServiceCategoryService } from '../services/serviceCategoryService';
import type { ServiceCategory } from '~/services';

export function useServiceCategoryOptions() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await ServiceCategoryService.getServiceCategories({
          page: 1,
          limit: 100 // Lấy tất cả loại dịch vụ cho dropdown
        });
        
        setCategories(response.items);
      } catch (error) {
        console.error('Error fetching service categories:', error);
        message.error('Không thể tải danh sách loại dịch vụ');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return {
    categories,
    loading
  };
} 