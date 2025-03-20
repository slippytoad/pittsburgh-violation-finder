
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { supabase } from '../../utils/supabase';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

// Define interfaces for request types
interface AddressRequest {
  address: string;
}

interface DeleteAddressParams {
  index: string;
}

interface BulkImportRequest {
  addresses: string[];
}

// Get all addresses
export const getAddresses: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Convert the Address objects to strings
    const addresses = data.map(item => item.address);
    res.json(addresses);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ error: 'Failed to fetch addresses' });
  }
};

// Add a new address
export const addAddress: RequestHandler<{}, any, AddressRequest> = async (req: Request<{}, any, AddressRequest>, res: Response) => {
  try {
    const { address } = req.body;
    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }

    // Normalize the address to ignore units
    const normalizeAddress = (addr: string): string => {
      return addr
        .replace(/\s+(apt|apartment|unit|#|suite|ste|floor|fl)\.?\s+\w+/i, '')
        .replace(/\s+#\w+/i, '')
        .trim();
    };
    
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
    const { data: updatedData, error: fetchError } = await supabase
      .from('addresses')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (fetchError) throw fetchError;
    
    const updatedAddresses = updatedData.map(item => item.address);
    res.json(updatedAddresses);
  } catch (error) {
    console.error('Error saving address:', error);
    res.status(500).json({ error: 'Failed to save address' });
  }
};

// Delete an address
export const deleteAddress: RequestHandler<DeleteAddressParams> = async (req: Request<DeleteAddressParams>, res: Response) => {
  try {
    const index = parseInt(req.params.index);
    
    // First, get all addresses to find the one at the given index
    const { data: addresses, error: fetchError } = await supabase
      .from('addresses')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (fetchError) throw fetchError;
    
    const addressList = addresses.map(item => item.address);
    const addressToRemove = addressList[index];

    if (!addressToRemove) {
      return res.status(404).json({ error: 'Address not found at the given index' });
    }

    // Delete the address from the database
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('address', addressToRemove);

    if (error) throw error;

    // Return the updated list of addresses
    const { data: updatedData, error: updatedError } = await supabase
      .from('addresses')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (updatedError) throw updatedError;
    
    const updatedAddresses = updatedData.map(item => item.address);
    res.json(updatedAddresses);
  } catch (error) {
    console.error('Error removing address:', error);
    res.status(500).json({ error: 'Failed to remove address' });
  }
};

// Bulk import addresses
export const bulkImportAddresses: RequestHandler<{}, any, BulkImportRequest> = async (req: Request<{}, any, BulkImportRequest>, res: Response) => {
  try {
    const { addresses } = req.body;
    if (!addresses || !Array.isArray(addresses)) {
      return res.status(400).json({ error: 'Valid address array is required' });
    }

    // Get existing addresses
    const { data: existingData, error: fetchError } = await supabase
      .from('addresses')
      .select('*');
      
    if (fetchError) throw fetchError;
    
    const existingAddresses = existingData.map(item => item.address);
    
    // Normalize addresses helper function
    const normalizeAddress = (addr: string): string => {
      return addr
        .replace(/\s+(apt|apartment|unit|#|suite|ste|floor|fl)\.?\s+\w+/i, '')
        .replace(/\s+#\w+/i, '')
        .trim();
    };
    
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
    const { data: updatedData, error: updatedError } = await supabase
      .from('addresses')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (updatedError) throw updatedError;
    
    const updatedAddresses = updatedData.map(item => item.address);
    res.json(updatedAddresses);
  } catch (error) {
    console.error('Error bulk importing addresses:', error);
    res.status(500).json({ error: 'Failed to bulk import addresses' });
  }
};
