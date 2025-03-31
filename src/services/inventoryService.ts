import HttpClient from '../lib/axios';
import type { Medicine } from './medicineService';

export interface Inventory {
  id: string;
  medicineId: string;
  medicine: Medicine;
  quantity: number;
  batchNumber: string;
  expiryDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryResponse {
  items: Inventory[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
}

export interface InventorySearchParams {
  medicineName?: string;
  medicineCode?: string;
  page?: number;
  limit?: number;
}

class InventoryService {
  private apiUrl = '/api/inventories';

  async getInventories(params: InventorySearchParams = {}): Promise<InventoryResponse> {
    try {
      return await HttpClient.get(this.apiUrl, { params });
    } catch (error) {
      console.error('Error fetching inventories:', error);
      throw error;
    }
  }

  async getInventoryById(id: string): Promise<Inventory> {
    try {
      return await HttpClient.get(`${this.apiUrl}/${id}`);
    } catch (error) {
      console.error(`Error fetching inventory with ID ${id}:`, error);
      throw error;
    }
  }
}

export const inventoryService = new InventoryService(); 