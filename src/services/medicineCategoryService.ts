import HttpClient from '../lib/axios';

export interface MedicineCategory {
  id: string;
  name: string;
  code: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MedicineCategoryResponse {
  items: MedicineCategory[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
}

export interface MedicineCategoryRequest {
  name: string;
  code?: string;
  note?: string;
}

export interface MedicineCategorySearchParams {
  name?: string;
  code?: string;
  page?: number;
  limit?: number;
}

class MedicineCategoryService {
  private apiUrl = '/api/medicine-categories';

  async getMedicineCategories(params: MedicineCategorySearchParams = {}): Promise<MedicineCategoryResponse> {
    try {
      return await HttpClient.get(this.apiUrl, { params });
    } catch (error) {
      console.error('Error fetching medicine categories:', error);
      throw error;
    }
  }

  async getMedicineCategoryById(id: string): Promise<MedicineCategory> {
    try {
      return await HttpClient.get(`${this.apiUrl}/${id}`);
    } catch (error) {
      console.error(`Error fetching medicine category with ID ${id}:`, error);
      throw error;
    }
  }

  async createMedicineCategory(data: MedicineCategoryRequest): Promise<MedicineCategory> {
    try {
      return await HttpClient.post(this.apiUrl, data);
    } catch (error) {
      console.error('Error creating medicine category:', error);
      throw error;
    }
  }

  async updateMedicineCategory(id: string, data: MedicineCategoryRequest): Promise<MedicineCategory> {
    try {
      return await HttpClient.put(`${this.apiUrl}/${id}`, data);
    } catch (error) {
      console.error(`Error updating medicine category with ID ${id}:`, error);
      throw error;
    }
  }

  async deleteMedicineCategory(id: string): Promise<void> {
    try {
      await HttpClient.delete(`${this.apiUrl}/${id}`);
    } catch (error) {
      console.error(`Error deleting medicine category with ID ${id}:`, error);
      throw error;
    }
  }
}

export const medicineCategoryService = new MedicineCategoryService(); 