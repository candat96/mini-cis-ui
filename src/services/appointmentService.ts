import HttpClient from '../lib/axios';

export interface AppointmentServiceItem {
  serviceId: string;
  note?: string;
  quantity: number;
}

export interface AppointmentRequest {
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  note?: string;
  services: AppointmentServiceItem[];
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  note?: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  totalAmount?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  patient: {
    id: string;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;
    name: string;
    phone?: string;
    gender?: string;
    address?: string;
    occupation?: string;
    birthDate?: string | null;
    code?: string;
  };
  doctor: {
    id: string;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;
    username?: string;
    email?: string;
    phone?: string;
    fullname?: string;
    role?: string;
    code?: string;
  };
  details?: Array<{
    id: string;
    appointmentId: string;
    serviceId: string;
    price: string;
    quantity: number;
    amount: string;
    note?: string | null;
    service: {
      id: string;
      name: string;
      code: string;
      description?: string | null;
      price: string;
    };
  }>;
  services?: AppointmentServiceItem[];
}

export interface AppointmentResponse {
  items: Appointment[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
}

export interface AppointmentSearchParams {
  patientId?: string;
  doctorId?: string;
  status?: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

class AppointmentService {
  private apiUrl = '/api/appointments';

  async getAppointments(params: AppointmentSearchParams = {}): Promise<AppointmentResponse | Appointment[]> {
    try {
      return await HttpClient.get(this.apiUrl, { params });
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  }

  async getAppointmentById(id: string): Promise<Appointment> {
    try {
      return await HttpClient.get(`${this.apiUrl}/${id}`);
    } catch (error) {
      console.error(`Error fetching appointment with ID ${id}:`, error);
      throw error;
    }
  }

  async createAppointment(data: AppointmentRequest): Promise<Appointment> {
    try {
      return await HttpClient.post(this.apiUrl, data);
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }

  async updateAppointment(id: string, data: Partial<AppointmentRequest>): Promise<Appointment> {
    try {
      return await HttpClient.put(`${this.apiUrl}/${id}`, data);
    } catch (error) {
      console.error(`Error updating appointment with ID ${id}:`, error);
      throw error;
    }
  }

  async deleteAppointment(id: string): Promise<void> {
    try {
      await HttpClient.delete(`${this.apiUrl}/${id}`);
    } catch (error) {
      console.error(`Error deleting appointment with ID ${id}:`, error);
      throw error;
    }
  }
}

export const appointmentService = new AppointmentService(); 