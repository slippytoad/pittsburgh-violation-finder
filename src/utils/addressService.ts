
/**
 * Address service for managing saved addresses in Supabase
 */

import { supabase } from './supabase';
import { Address } from './types';

/**
 * Normalize an address by removing unit/apartment numbers
 * @param address The address to normalize
 * @returns Normalized address string
 */
export const normalizeAddress = (address: string): string => {
  // Remove common unit/apartment identifiers and what follows them
  return address
    .replace(/\s+(apt|apartment|unit|#|suite|ste|floor|fl)\.?\s+\w+/i, '')
    .replace(/\s+#\w+/i, '')
    .trim();
};

/**
 * Fetch all saved addresses from the database
 * @returns Array of address strings
 */
export const fetchSavedAddresses = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching addresses:', error);
      throw error;
    }

    // Convert the Address objects to strings
    return (data as Address[]).map(item => item.address);
  } catch (error) {
    console.error('Failed to fetch addresses:', error);
    // Fall back to an empty array if there's an error
    return [];
  }
};

/**
 * Save an address to the database
 * @param address The address to save
 * @returns Updated list of addresses
 */
export const saveAddress = async (address: string): Promise<string[]> => {
  try {
    // Normalize the address to ignore units
    const normalizedAddress = normalizeAddress(address);
    
    // Check if any version of this normalized address already exists
    const { data: existingAddresses } = await supabase
      .from('addresses')
      .select('*');
      
    if (!existingAddresses) {
      throw new Error('Failed to check existing addresses');
    }
    
    // Check if any existing address normalizes to the same as our new address
    const normalizedExisting = existingAddresses.map((addr: Address) => 
      normalizeAddress(addr.address)
    );
    
    // If no normalized version of this address exists, insert it
    if (!normalizedExisting.includes(normalizedAddress)) {
      const { error } = await supabase
        .from('addresses')
        .insert([{ address }]);

      if (error) {
        console.error('Error saving address:', error);
        throw error;
      }
    }

    // Return the updated list of addresses
    return await fetchSavedAddresses();
  } catch (error) {
    console.error('Failed to save address:', error);
    throw error;
  }
};

/**
 * Bulk import multiple addresses at once
 * @param addressList Array of addresses to import
 * @returns Updated list of addresses
 */
export const bulkImportAddresses = async (addressList: string[]): Promise<string[]> => {
  try {
    // Get existing addresses
    const existingAddresses = await fetchSavedAddresses();
    const normalizedExisting = existingAddresses.map(addr => normalizeAddress(addr));
    
    // Filter out addresses that already exist in normalized form
    const newAddresses = addressList.filter(addr => 
      !normalizedExisting.includes(normalizeAddress(addr))
    );
    
    if (newAddresses.length === 0) {
      return existingAddresses;
    }
    
    // Create array of address objects for insert
    const addressObjects = newAddresses.map(address => ({ address }));
    
    // Insert new addresses
    const { error } = await supabase
      .from('addresses')
      .insert(addressObjects);
      
    if (error) {
      console.error('Error bulk importing addresses:', error);
      throw error;
    }
    
    // Fetch updated list
    return await fetchSavedAddresses();
  } catch (error) {
    console.error('Failed to bulk import addresses:', error);
    throw error;
  }
};

/**
 * Remove an address from the database
 * @param index The index of the address to remove
 * @returns Updated list of addresses
 */
export const removeAddress = async (index: number): Promise<string[]> => {
  try {
    // First, get all addresses to find the one at the given index
    const addresses = await fetchSavedAddresses();
    const addressToRemove = addresses[index];

    if (!addressToRemove) {
      throw new Error('Address not found at the given index');
    }

    // Delete the address from the database
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('address', addressToRemove);

    if (error) {
      console.error('Error removing address:', error);
      throw error;
    }

    // Return the updated list of addresses
    return await fetchSavedAddresses();
  } catch (error) {
    console.error('Failed to remove address:', error);
    throw error;
  }
};
