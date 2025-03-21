
import { supabase } from '../../utils/supabase';

/**
 * Normalize an address by removing unit/apartment numbers
 * @param address The address to normalize
 * @returns Normalized address string
 */
export const normalizeAddress = (address: string): string => {
  return address
    .replace(/\s+(apt|apartment|unit|#|suite|ste|floor|fl)\.?\s+\w+/i, '')
    .replace(/\s+#\w+/i, '')
    .trim();
};

/**
 * Fetch all addresses from the database
 * @returns Array of address strings
 */
export const fetchAddresses = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // Convert the Address objects to strings
  return data.map(item => item.address);
};

/**
 * Save a new address to the database
 * @param address The address to save
 * @returns Updated list of addresses
 */
export const saveAddress = async (address: string): Promise<string[]> => {
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
  const normalizedExisting = existingAddresses.map((addr: any) => 
    normalizeAddress(addr.address)
  );
  
  // If no normalized version of this address exists, insert it
  if (!normalizedExisting.includes(normalizedAddress)) {
    const { error } = await supabase
      .from('addresses')
      .insert([{ address }]);

    if (error) throw error;
  }

  // Return the updated list of addresses
  return await fetchAddresses();
};

/**
 * Remove an address from the database
 * @param index The index of the address to remove
 * @returns Updated list of addresses
 */
export const removeAddress = async (index: number): Promise<string[]> => {
  // First, get all addresses to find the one at the given index
  const addressList = await fetchAddresses();
  const addressToRemove = addressList[index];

  if (!addressToRemove) {
    throw new Error('Address not found at the given index');
  }

  // Delete the address from the database
  const { error } = await supabase
    .from('addresses')
    .delete()
    .eq('address', addressToRemove);

  if (error) throw error;

  // Return the updated list of addresses
  return await fetchAddresses();
};

/**
 * Bulk import multiple addresses at once
 * @param addresses Array of addresses to import
 * @returns Updated list of addresses
 */
export const bulkImportAddresses = async (addresses: string[]): Promise<string[]> => {
  // Get existing addresses
  const existingAddresses = await fetchAddresses();
  const normalizedExisting = existingAddresses.map(addr => normalizeAddress(addr));
  
  // Filter out addresses that already exist in normalized form
  const newAddresses = addresses.filter(addr => 
    !normalizedExisting.includes(normalizeAddress(addr))
  );
  
  if (newAddresses.length > 0) {
    // Create array of address objects for insert
    const addressObjects = newAddresses.map(address => ({ address }));
    
    // Insert new addresses
    const { error } = await supabase
      .from('addresses')
      .insert(addressObjects);
      
    if (error) throw error;
  }
  
  // Fetch updated list
  return await fetchAddresses();
};
