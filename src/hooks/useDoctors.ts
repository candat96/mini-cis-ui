import { useState, useEffect } from 'react';
import { message } from 'antd';
import { doctorService, type Doctor } from '../services/doctorService';

export function useDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const response = await doctorService.getDoctors();
        setDoctors(Array.isArray(response) ? response : response.items);
      } catch (error) {
        console.error('Lỗi khi tải danh sách bác sĩ:', error);
        message.error('Không thể tải danh sách bác sĩ. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  return { doctors, loading };
} 