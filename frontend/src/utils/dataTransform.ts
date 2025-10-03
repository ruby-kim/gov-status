import { Service } from '@/types/service';
import { DashboardData, HistoryData } from '@/types/api/dashboard';

export async function loadDashboardData(): Promise<DashboardData> {
  try {
    const response = await fetch('/api/mongodb/dashboard');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    throw error;
  }
}

export async function loadHistoryData(): Promise<HistoryData[]> {
  try {
    const response = await fetch('/api/mongodb/history?days=1');

    if (!response.ok) {
      console.warn(`History API returned ${response.status}, using empty data`);
      return [];
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading history data:', error);
    return [];
  }
}

export async function loadBackendData(): Promise<Service[]> {
  try {
    const response = await fetch('/api/mongodb/services');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.services || data;
  } catch (error) {
    console.error('Error loading backend data:', error);
    throw error;
  }
}