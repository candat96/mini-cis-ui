import { useState, useEffect } from 'react';
import { message } from 'antd';
import { medicineCategoryService, type MedicineCategory } from '../services/medicineCategoryService';

export function useMedicineCategoryOptions() {
  const [categories, setCategories] = useState<MedicineCategory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await medicineCategoryService.getMedicineCategories();
        setCategories(response.items);
      } catch (error) {
        console.error('Error fetching medicine categories:', error);
        message.error('Không thể tải danh sách loại thuốc');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading };
} 