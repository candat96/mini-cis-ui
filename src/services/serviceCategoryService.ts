import HttpClient from '../lib/axios';

export interface ServiceCategory {
  id: string;
  name: string;
  code: string;
  note: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceCategoryResponse {
  items: ServiceCategory[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
}

export interface ServiceCategoryRequest {
  name: string;
  code: string;
  note?: string;
}

export interface ServiceCategorySearchParams {
  page?: number;
  limit?: number;
  name?: string;
  code?: string;
}

export const ServiceCategoryService = {
  getServiceCategories: async (params: ServiceCategorySearchParams): Promise<ServiceCategoryResponse> => {
    const response = await HttpClient.get<any, ServiceCategoryResponse>('/api/service-categories', {
      params
    });
    return response;
  },

  getServiceCategoryById: async (id: string): Promise<ServiceCategory> => {
    const response = await HttpClient.get<any, ServiceCategory>(`/api/service-categories/${id}`);
    return response;
  },

  createServiceCategory: async (data: ServiceCategoryRequest): Promise<ServiceCategory> => {
    const response = await HttpClient.post<ServiceCategoryRequest, ServiceCategory>('/api/service-categories', data);
    return response;
  },

  updateServiceCategory: async (id: string, data: ServiceCategoryRequest): Promise<ServiceCategory> => {
    const response = await HttpClient.put<ServiceCategoryRequest, ServiceCategory>(`/api/service-categories/${id}`, data);
    return response;
  },

  deleteServiceCategory: async (id: string): Promise<void> => {
    await HttpClient.delete(`/api/service-categories/${id}`);
  }
}; 