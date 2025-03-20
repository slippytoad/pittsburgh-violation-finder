
import { createServer } from 'http';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import { supabase } from '../utils/supabase';
import { searchViolationsByAddress } from '../utils/violationsService';
import { ViolationType } from '../utils/types';
import { processBatch } from '../utils/batchProcessing';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(json());

// Type-safe route handlers
type RequestHandler<
  P = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = ParsedQs
> = (
  req: Request<P, ResBody, ReqBody, ReqQuery>,
  res: Response,
  next?: NextFunction
) => void | Promise<void>;

// Address endpoints
app.get('/api/addresses', (async (req, res) => {
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
}) as RequestHandler);

interface AddressRequest {
  address: string;
}

app.post('/api/addresses', (async (req: Request<{}, any, AddressRequest>, res) => {
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
}) as RequestHandler<{}, any, AddressRequest>);

interface DeleteAddressParams {
  index: string;
}

app.delete('/api/addresses/:index', (async (req: Request<DeleteAddressParams>, res) => {
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
}) as RequestHandler<DeleteAddressParams>);

interface BulkImportRequest {
  addresses: string[];
}

app.post('/api/addresses/bulk', (async (req: Request<{}, any, BulkImportRequest>, res) => {
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
}) as RequestHandler<{}, any, BulkImportRequest>);

interface ViolationSearchQuery {
  address?: string;
}

// Violations endpoints
app.get('/api/violations/search', (async (req: Request<{}, any, any, ViolationSearchQuery>, res) => {
  try {
    const { address } = req.query;
    if (!address || typeof address !== 'string') {
      return res.status(400).json({ error: 'Valid address is required' });
    }
    
    const violations = await searchViolationsByAddress(address);
    res.json(violations);
  } catch (error) {
    console.error('Error searching violations:', error);
    res.status(500).json({ error: 'Failed to search violations' });
  }
}) as RequestHandler<{}, any, any, ViolationSearchQuery>);

interface MultiAddressSearchRequest {
  addresses: string[];
}

interface MultiAddressSearchQuery {
  year?: string;
}

app.post('/api/violations/search-multiple', (async (req: Request<{}, any, MultiAddressSearchRequest, MultiAddressSearchQuery>, res) => {
  try {
    const { addresses } = req.body;
    const year = req.query.year ? parseInt(req.query.year) : undefined;
    
    if (!addresses || !Array.isArray(addresses)) {
      return res.status(400).json({ error: 'Valid address array is required' });
    }
    
    let allResults: ViolationType[] = [];
    let searchCount = 0;
    
    // Use the batch processing utility
    allResults = await processBatch(
      addresses, 
      0, 
      () => { searchCount++; },
      []
    );
    
    res.json(allResults);
  } catch (error) {
    console.error('Error searching multiple addresses:', error);
    res.status(500).json({ error: 'Failed to search multiple addresses' });
  }
}) as RequestHandler<{}, any, MultiAddressSearchRequest, MultiAddressSearchQuery>);

// Settings endpoints
app.get('/api/settings', (async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .eq('id', 1)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({ error: 'Settings not found' });
    }

    // Transform database record to AppSettings type
    const settings = {
      id: data.id,
      violationChecksEnabled: data.violation_checks_enabled,
      emailReportsEnabled: data.email_reports_enabled,
      emailReportAddress: data.email_report_address || '',
      nextViolationCheckTime: data.next_violation_check_time,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
    
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
}) as RequestHandler);

interface AppSettingsUpdate {
  violationChecksEnabled?: boolean;
  emailReportsEnabled?: boolean;
  emailReportAddress?: string;
  nextViolationCheckTime?: string;
}

app.post('/api/settings', (async (req: Request<{}, any, AppSettingsUpdate>, res) => {
  try {
    const settings = req.body;
    
    // Convert camelCase to snake_case and format the data
    const formattedSettings = {
      violation_checks_enabled: settings.violationChecksEnabled,
      email_reports_enabled: settings.emailReportsEnabled,
      email_report_address: settings.emailReportAddress,
      next_violation_check_time: settings.nextViolationCheckTime,
      updated_at: new Date().toISOString()
    };

    // Remove any undefined values
    Object.keys(formattedSettings).forEach(key => {
      if (formattedSettings[key as keyof typeof formattedSettings] === undefined) {
        delete formattedSettings[key as keyof typeof formattedSettings];
      }
    });

    // First check if the record exists
    const { data: existingData, error: checkError } = await supabase
      .from('app_settings')
      .select('id')
      .eq('id', 1)
      .single();

    if (checkError) {
      // If the record doesn't exist, try to create it
      if (checkError.code === 'PGRST116') {
        const { error: insertError } = await supabase
          .from('app_settings')
          .insert({
            id: 1,
            ...formattedSettings
          });

        if (insertError) throw insertError;
        
        res.json(true);
        return;
      }
      throw checkError;
    }

    // Record exists, update it
    const { error: updateError } = await supabase
      .from('app_settings')
      .update(formattedSettings)
      .eq('id', 1);
    
    if (updateError) throw updateError;
    
    res.json(true);
  } catch (error) {
    console.error('Error saving settings:', error);
    res.status(500).json({ error: 'Failed to save settings' });
  }
}) as RequestHandler<{}, any, AppSettingsUpdate>);

// Start the server
const server = createServer(app);

server.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
});

// For dev environments, export the express app for middleware usage
export { app };

