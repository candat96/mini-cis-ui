import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { patientService, type Patient, type PatientSearchParams } from '../services/patientService';

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchParams, setSearchParams] = useState<PatientSearchParams>({
    name: '',
    phone: '',
    page: 1,
    limit: 10
  });

  const fetchPatients = useCallback(async (params: PatientSearchParams = searchParams) => {
    setLoading(true);
    try {
      const response = await patientService.getPatients(params);
      setPatients(response.items);
      setTotalItems(response.total);
      setCurrentPage(response.page);
      setPageSize(response.limit);
    } catch (error) {
      console.error('Error fetching patients:', error);
      message.error('Không thể tải danh sách bệnh nhân. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handlePageChange = (page: number, pageSize?: number) => {
    const newParams = {
      ...searchParams,
      page,
      limit: pageSize || 10
    };
    setSearchParams(newParams);
    fetchPatients(newParams);
  };

  const handleSearch = (name: string = '', phone: string = '') => {
    const newParams = {
      ...searchParams,
      name,
      phone,
      page: 1
    };
    setSearchParams(newParams);
    fetchPatients(newParams);
  };

  const resetSearch = () => {
    const defaultParams: PatientSearchParams = {
      name: '',
      phone: '',
      page: 1,
      limit: 10
    };
    setSearchParams(defaultParams);
    fetchPatients(defaultParams);
  };

  return {
    patients,
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