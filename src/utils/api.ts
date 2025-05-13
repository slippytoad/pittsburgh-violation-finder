
/**
 * API service for the Property Violations Finder app
 * This file exports functions to interact with the backend API
 */

import { fetchAppSettings, saveSettings as saveAppSettings } from '@/services/settingsService';
import { fetchSavedAddresses, saveAddress, removeAddress, bulkImportAddresses } from '@/utils/addressService';

// Addresses API - Using direct Supabase functions
export { fetchSavedAddresses, saveAddress, removeAddress, bulkImportAddresses };

// Settings API - now using Supabase directly
export async function fetchSettings(): Promise<any> {
  return fetchAppSettings();
}

export async function saveSettings(settings: any): Promise<boolean> {
  return saveAppSettings(settings);
}
