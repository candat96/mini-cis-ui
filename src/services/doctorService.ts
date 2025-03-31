import HttpClient from '../lib/axios';

export interface Doctor {
  id: string;
  code?: string;
  fullName?: string;
  fullname?: string;
  phone?: string;
  email?: string;
  speciality?: string;
  createdAt?: string;
  updatedAt?: string;
  username?: string;
  role?: string;
}

export interface DoctorResponse {
  items: Doctor[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
}

export interface DoctorSearchParams {
  search?: string;
  page?: number;
  limit?: number;
}

class DoctorService {
  private apiUrl = '/api/auth/doctors';

  async getDoctors(params: DoctorSearchParams = {}): Promise<DoctorResponse> {
    try {
      const response = await HttpClient.get(this.apiUrl, { params });
      
      // Nếu response là mảng (không có phân trang), convert sang format DoctorResponse
      if (Array.isArray(response)) {
        // Chuẩn hóa các bác sĩ để đảm bảo có fullName
        const normalizedDoctors = response.map(doctor => this.normalizeDoctor(doctor));
        
        return {
          items: normalizedDoctors,
          total: normalizedDoctors.length,
          page: 1,
          limit: normalizedDoctors.length,
          pageCount: 1
        };
      }
      
      // Nếu response là đối tượng phân trang, chuẩn hóa các bác sĩ
      if (response.items && Array.isArray(response.items)) {
        response.items = response.items.map((doctor: Doctor) => this.normalizeDoctor(doctor));
      }
      
      return response;
    } catch (error) {
      console.error('Error fetching doctors:', error);
      throw error;
    }
  }

  async getDoctorById(id: string): Promise<Doctor> {
    try {
      const doctor = await HttpClient.get(`${this.apiUrl}/${id}`);
      return this.normalizeDoctor(doctor);
    } catch (error) {
      console.error(`Error fetching doctor with ID ${id}:`, error);
      throw error;
    }
  }
  
  // Hàm chuẩn hóa thông tin bác sĩ để đảm bảo có fullName
  private normalizeDoctor(doctor: Doctor): Doctor {
    // Tạo đối tượng mới để không thay đổi đối tượng gốc
    const normalizedDoctor = { ...doctor };
    
    // Nếu không có fullName nhưng có fullname, sử dụng fullname
    if (!normalizedDoctor.fullName && normalizedDoctor.fullname) {
      normalizedDoctor.fullName = normalizedDoctor.fullname;
    }
    
    return normalizedDoctor;
  }
}

export const doctorService = new DoctorService(); 