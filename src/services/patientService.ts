import HttpClient from '../lib/axios';

export interface Patient {
  id: string;
  code?: string;
  name: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  birthYear?: number;
  birthDate?: string;
  phone?: string;
  address?: string;
  occupation?: string;
  lastVisit?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface PatientResponse {
  items: Patient[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
}

export interface PatientSearchParams {
  search?: string;
  name?: string;
  phone?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  page?: number;
  limit?: number;
}

export interface PatientRequest {
  name: string;
  phone?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  address?: string;
  occupation?: string;
  birthYear?: number;
  birthDate?: string;
}

class PatientService {
  private apiUrl = '/api/patients';

  async getPatients(params: PatientSearchParams = {}): Promise<PatientResponse> {
    try {
      return await HttpClient.get(this.apiUrl, { params });
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  }

  async getPatientById(id: string): Promise<Patient> {
    try {
      return await HttpClient.get(`${this.apiUrl}/${id}`);
    } catch (error) {
      console.error(`Error fetching patient with ID ${id}:`, error);
      throw error;
    }
  }

  async createPatient(data: PatientRequest): Promise<Patient> {
    try {
      return await HttpClient.post(this.apiUrl, data);
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  }
}

export const patientService = new PatientService(); 