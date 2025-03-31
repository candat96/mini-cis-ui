import HttpClient from '../lib/axios';

// Interface cho thông tin loại dịch vụ trong response
export interface ServiceCategory {
  id: string;
  name: string;
  code: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  name: string;
  code: string;
  description: string | null;
  price: string;
  category: ServiceCategory;
  categoryId?: string;
  categoryName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceResponse {
  items: Service[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
}

export interface ServiceRequest {
  name: string;
  code?: string;
  categoryId?: string;
  price: number;
  description?: string;
}

export interface ServiceSearchParams {
  name?: string;
  code?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
}

class ServiceService {
  private apiUrl = '/api/services';

  async getServices(params: ServiceSearchParams = {}): Promise<ServiceResponse> {
    try {
      return await HttpClient.get(this.apiUrl, { params });
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }

  async getServiceById(id: string): Promise<Service> {
    try {
      return await HttpClient.get(`${this.apiUrl}/${id}`);
    } catch (error) {
      console.error(`Error fetching service with ID ${id}:`, error);
      throw error;
    }
  }

  async createService(data: ServiceRequest): Promise<Service> {
    try {
      return await HttpClient.post(this.apiUrl, data);
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  }

  async updateService(id: string, data: ServiceRequest): Promise<Service> {
    try {
      return await HttpClient.put(`${this.apiUrl}/${id}`, data);
    } catch (error) {
      console.error(`Error updating service with ID ${id}:`, error);
      throw error;
    }
  }

  async deleteService(id: string): Promise<void> {
    try {
      await HttpClient.delete(`${this.apiUrl}/${id}`);
    } catch (error) {
      console.error(`Error deleting service with ID ${id}:`, error);
      throw error;
    }
  }
}

export const serviceService = new ServiceService(); 