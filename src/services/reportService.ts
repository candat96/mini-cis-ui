import HttpClient from '../lib/axios';

export interface TotalRevenueParams {
  fromDate?: string;
  toDate?: string;
  doctorId?: string;
}

export interface TotalRevenueReport {
  serviceRevenue: number;
  medicineRevenue: number;
  totalRevenue: number;
  appointmentCount: number;
  prescriptionCount: number;
  fromDate: string;
  toDate: string;
}

export interface DoctorServiceRevenueParams {
  fromDate?: string;
  toDate?: string;
}

export interface DoctorServiceRevenueItem {
  serviceId: string;
  serviceName: string;
  price: number;
  quantity: number;
  revenue: number;
}

export interface DoctorServiceRevenue {
  doctorId: string;
  username: string;
  fullname: string;
  services: DoctorServiceRevenueItem[];
  totalQuantity: number;
  totalRevenue: number;
  fromDate: string;
  toDate: string;
}

export interface DoctorMedicineRevenueParams {
  fromDate?: string;
  toDate?: string;
}

export interface DoctorMedicineRevenueItem {
  medicineId: string;
  code: string;
  name: string;
  unit: string;
  price: number;
  quantity: number;
  revenue: number;
}

export interface DoctorMedicineRevenue {
  doctorId: string;
  username: string;
  fullname: string;
  medicines: DoctorMedicineRevenueItem[];
  totalQuantity: number;
  totalRevenue: number;
  prescriptionCount: number;
  fromDate: string;
  toDate: string;
}

export interface DoctorRevenueParams {
  fromDate?: string;
  toDate?: string;
  doctorId?: string;
}

export interface DoctorRevenueItem {
  doctorId: string;
  username: string;
  fullname: string;
  serviceRevenue: number;
  medicineRevenue: number;
  totalRevenue: number;
  appointmentCount: number;
  prescriptionCount: number;
}

export interface DoctorRevenueReport {
  doctors: DoctorRevenueItem[];
  totalServiceRevenue: number;
  totalMedicineRevenue: number;
  totalRevenue: number;
  fromDate: string;
  toDate: string;
}

class ReportService {
  // Lấy báo cáo doanh thu tổng hợp
  async getTotalRevenue(params: TotalRevenueParams = {}): Promise<TotalRevenueReport> {
    try {
      return await HttpClient.get('/api/reports/total-revenue', { params });
    } catch (error) {
      console.error('Error fetching total revenue report:', error);
      throw error;
    }
  }

  // Lấy báo cáo doanh thu dịch vụ theo bác sĩ
  async getDoctorServiceRevenue(doctorId: string, params: DoctorServiceRevenueParams = {}): Promise<DoctorServiceRevenue> {
    try {
      return await HttpClient.get(`/api/reports/doctor/${doctorId}/service-revenue`, { params });
    } catch (error) {
      console.error('Error fetching doctor service revenue:', error);
      throw error;
    }
  }

  // Lấy báo cáo doanh thu thuốc theo bác sĩ
  async getDoctorMedicineRevenue(doctorId: string, params: DoctorMedicineRevenueParams = {}): Promise<DoctorMedicineRevenue> {
    try {
      return await HttpClient.get(`/api/reports/doctor/${doctorId}/medicine-revenue`, { params });
    } catch (error) {
      console.error('Error fetching doctor medicine revenue:', error);
      throw error;
    }
  }

  // Lấy báo cáo doanh thu tổng hợp theo bác sĩ
  async getDoctorRevenue(params: DoctorRevenueParams = {}): Promise<DoctorRevenueReport> {
    try {
      return await HttpClient.get('/api/reports/doctor-revenue', { params });
    } catch (error) {
      console.error('Error fetching doctor revenue report:', error);
      throw error;
    }
  }
}

export const reportService = new ReportService(); 