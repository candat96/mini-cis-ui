import HttpClient from '../lib/axios';
import type { Medicine } from './medicineService';
import type { MedicineCategory } from './medicineCategoryService';

export interface StockInDetail {
  id: string;
  medicineId: string;
  medicine: {
    id: string;
    name: string;
    code: string;
    unit: string;
    sellPrice: number;
    buyPrice: number;
    manufacturer: string;
    description: string;
    category: MedicineCategory;
    createdAt: string;
    updatedAt: string;
  };
  quantity: number;
  unitPrice: number;
  amount: number;
  expiryDate: string;
  batchNumber: string;
}

export interface StockIn {
  id: string;
  code: string;
  stockInDate: string;
  supplier: string;
  note: string;
  totalAmount: number;
  details: StockInDetail[];
  createdAt: string;
  updatedAt: string;
}

export interface StockInResponse {
  items: StockIn[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
}

export interface StockInDetailRequest {
  medicineId: string;
  quantity: number;
  unitPrice: number;
  expiryDate: string;
  batchNumber: string;
}

export interface StockInRequest {
  code?: string;
  stockInDate: string;
  supplier: string;
  note?: string;
  details: StockInDetailRequest[];
}

export interface StockInSearchParams {
  code?: string;
  supplier?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

class StockInService {
  private apiUrl = '/api/stock-ins';

  async getStockIns(params: StockInSearchParams = {}): Promise<StockInResponse> {
    try {
      return await HttpClient.get(this.apiUrl, { params });
    } catch (error) {
      console.error('Error fetching stock-ins:', error);
      throw error;
    }
  }

  async getStockInById(id: string): Promise<StockIn> {
    try {
      return await HttpClient.get(`${this.apiUrl}/${id}`);
    } catch (error) {
      console.error(`Error fetching stock-in with ID ${id}:`, error);
      throw error;
    }
  }

  async createStockIn(data: StockInRequest): Promise<StockIn> {
    try {
      return await HttpClient.post(this.apiUrl, data);
    } catch (error) {
      console.error('Error creating stock-in:', error);
      throw error;
    }
  }
}

export const stockInService = new StockInService(); 