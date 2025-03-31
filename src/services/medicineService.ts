import HttpClient from '../lib/axios';
import type { MedicineCategory } from './medicineCategoryService';

export interface Medicine {
  id: string;
  name: string;
  code: string;
  unit: string;
  sellPrice: number;
  buyPrice: number;
  manufacturer: string;
  description: string;
  category: MedicineCategory;
  categoryId?: string;
  categoryName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicineResponse {
  items: Medicine[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
}

export interface MedicineRequest {
  name: string;
  code?: string;
  unit: string;
  sellPrice: number;
  buyPrice: number;
  manufacturer: string;
  categoryId?: string;
  description?: string;
}

export interface MedicineSearchParams {
  name?: string;
  code?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
}

class MedicineService {
  private apiUrl = '/api/medicines';

  async getMedicines(params: MedicineSearchParams = {}): Promise<MedicineResponse> {
    try {
      return await HttpClient.get(this.apiUrl, { params });
    } catch (error) {
      console.error('Error fetching medicines:', error);
      throw error;
    }
  }

  async getMedicineById(id: string): Promise<Medicine> {
    try {
      return await HttpClient.get(`${this.apiUrl}/${id}`);
    } catch (error) {
      console.error(`Error fetching medicine with ID ${id}:`, error);
      throw error;
    }
  }

  async createMedicine(data: MedicineRequest): Promise<Medicine> {
    try {
      return await HttpClient.post(this.apiUrl, data);
    } catch (error) {
      console.error('Error creating medicine:', error);
      throw error;
    }
  }

  async updateMedicine(id: string, data: MedicineRequest): Promise<Medicine> {
    try {
      return await HttpClient.put(`${this.apiUrl}/${id}`, data);
    } catch (error) {
      console.error(`Error updating medicine with ID ${id}:`, error);
      throw error;
    }
  }

  async deleteMedicine(id: string): Promise<void> {
    try {
      await HttpClient.delete(`${this.apiUrl}/${id}`);
    } catch (error) {
      console.error(`Error deleting medicine with ID ${id}:`, error);
      throw error;
    }
  }
}

export const medicineService = new MedicineService(); 