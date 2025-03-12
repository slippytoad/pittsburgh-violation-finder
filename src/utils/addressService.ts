
/**
 * Address service for managing saved addresses in Supabase
 */

import { supabase } from './supabase';
import { Address } from './types';

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
    // Check if the address already exists to avoid duplicates
    const { data: existingAddresses } = await supabase
      .from('addresses')
      .select('*')
      .eq('address', address);

    // If the address doesn't exist, insert it
    if (!existingAddresses || existingAddresses.length === 0) {
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
