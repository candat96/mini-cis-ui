import HttpClient from '../lib/axios';

export interface PrescriptionMedicine {
  id?: string;
  medicineId: string;
  quantity: number;
  dosage: string;
  frequency: string;
  duration: string;
  instruction: string;
  note?: string;
  medicine?: {
    id: string;
    name: string;
    code: string;
    unit: string;
  };
}

export interface Prescription {
  id: string;
  code?: string;
  appointmentId: string;
  doctorId: string;
  status: 'DRAFT' | 'PENDING' | 'COMPLETED' | 'CANCELLED';
  totalAmount?: string;
  note?: string;
  medicines: PrescriptionMedicine[];
  details?: PrescriptionMedicine[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  doctor?: {
    id: string;
    fullname: string;
    code: string;
  };
  appointment?: {
    id: string;
    appointmentDate: string;
    patient: {
      id: string;
      name: string;
      code: string;
      phone: string;
      birthDate?: string;
    };
  };
  stockOut?: {
    id: string;
    code: string;
    stockOutDate: string;
    type: string;
    recipient: string;
    note: string;
    totalAmount: string;
  };
}

export interface PrescriptionResponse {
  items: Prescription[];
  total: number;
  page: number;
  limit: number;
}

export interface PrescriptionRequest {
  appointmentId: string;
  doctorId: string;
  note?: string;
  medicines: PrescriptionMedicine[];
}

export interface PrescriptionUpdateRequest {
  doctorId: string;
  status?: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  note?: string;
  medicines: PrescriptionMedicine[];
}

export interface PrescriptionSearchParams {
  page?: number;
  limit?: number;
  patientId?: string;
  doctorId?: string;
  appointmentId?: string;
  status?: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  startDate?: string;
  endDate?: string;
}

// Tạo service cho xử lý API đơn thuốc
export const prescriptionService = {
  // Lấy danh sách đơn thuốc
  async getPrescriptions(params: PrescriptionSearchParams = {}): Promise<PrescriptionResponse> {
    return HttpClient.get<PrescriptionResponse>('api/prescriptions', { params });
  },

  // Lấy chi tiết đơn thuốc theo ID
  async getPrescriptionById(id: string): Promise<Prescription> {
    return HttpClient.get<Prescription>(`api/prescriptions/${id}`);
  },

  // Tạo đơn thuốc mới
  async createPrescription(data: PrescriptionRequest): Promise<Prescription> {
    return HttpClient.post<PrescriptionRequest, Prescription>('api/prescriptions', data);
  },

  // Cập nhật đơn thuốc
  async updatePrescription(id: string, data: PrescriptionUpdateRequest): Promise<Prescription> {
    return HttpClient.put<PrescriptionUpdateRequest, Prescription>(`api/prescriptions/${id}`, data);
  },

  // Xóa đơn thuốc
  async deletePrescription(id: string): Promise<void> {
    return HttpClient.delete(`api/prescriptions/${id}`);
  }
}; 