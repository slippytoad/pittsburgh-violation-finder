
import { supabase } from './supabase';
import { parse } from 'papaparse';
import { normalizeAddress } from './addressService';

/**
 * Imports violation data from a CSV file into the Supabase violations table
 * @param file - The CSV file to import
 * @param filterAddresses - Optional array of addresses to filter the import by
 * @returns A promise that resolves to the number of records imported
 */
export const importViolationsFromCsv = async (file: File, filterAddresses?: string[]): Promise<number> => {
  try {
    console.log('Starting CSV import process...');
    
    // Parse the CSV file
    return new Promise((resolve, reject) => {
      parse(file, {
        header: true,
        complete: async (results) => {
          const { data, errors, meta } = results;
          
          if (errors.length > 0) {
            console.error('CSV parsing errors:', errors);
            reject(new Error(`CSV parsing errors: ${errors.map(e => e.message).join(', ')}`));
            return;
          }
          
          console.log(`Successfully parsed ${data.length} records`);
          console.log('Sample CSV data:', data[0]);
          
          // Filter by addresses if provided
          let filteredData = data;
          if (filterAddresses && filterAddresses.length > 0) {
            const normalizedFilterAddresses = filterAddresses.map(addr => normalizeAddress(addr));
            
            filteredData = data.filter((row: any) => {
              const rowAddress = row.address || '';
              const normalizedRowAddress = normalizeAddress(rowAddress);
              
              return normalizedFilterAddresses.some(filterAddr => 
                normalizedRowAddress.includes(filterAddr) || filterAddr.includes(normalizedRowAddress)
              );
            });
            
            console.log(`Filtered from ${data.length} to ${filteredData.length} records based on ${filterAddresses.length} saved addresses`);
          }
          
          if (filteredData.length === 0) {
            reject(new Error('No records to import after filtering'));
            return;
          }
          
          // Transform the data to match the violations table structure with API schema
          const transformedData = filteredData.map((row: any) => {
            const originalDate = row.investigation_date || row.inspection_date || row.date || row.created_at || new Date().toISOString();
            const parsedDate = parseDate(originalDate);
            const year = new Date(parsedDate).getFullYear();
            
            console.log(`Processed date for record: ${row.casefile_number || 'unknown'}, original: ${originalDate}, parsed: ${parsedDate}, year: ${year}`);
            
            return {
              _id: row.casefile_number || `VIO-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              casefile_number: row.casefile_number || `VIO-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              address: (row.address || 'Unknown Address').toUpperCase(),
              status: mapStatus(row.status),
              original_status: row.status || 'Unknown',
              violation_description: row.violation_description || 'No description provided',
              owner_name: row.owner_name || row.property_owner || 'Unknown Owner',
              parcel_id: row.parcel_id || null,
              violation_code: row.violation_code || null,
              violation_code_section: row.violation_code_section || null,
              inspection_result: row.inspection_result || null,
              violation_date: row.violation_date || null,
              investigation_outcome: row.investigation_outcome || null,
              investigation_findings: row.investigation_findings || null,
              inspection_date: parsedDate,
              investigation_date: parsedDate,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
          });
          
          console.log('Sample transformed data:', transformedData[0]);
          
          // Insert the data into the violations table
          const { data: insertedData, error } = await supabase
            .from('violations')
            .insert(transformedData);
            
          if (error) {
            console.error('Error inserting violations:', error);
            reject(new Error(`Failed to insert violations: ${error.message}`));
            return;
          }
          
          console.log(`Successfully imported ${transformedData.length} violations`);
          resolve(transformedData.length);
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
          reject(new Error(`Failed to parse CSV: ${error}`));
        }
      });
    });
  } catch (error) {
    console.error('CSV import error:', error);
    throw new Error(`CSV import failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Helper function to parse dates from various formats
 */
const parseDate = (dateString?: string): string => {
  if (!dateString) return new Date().toISOString();
  
  try {
    // Try different date formats
    const date = new Date(dateString);
    
    // Check if the date is valid
    if (!isNaN(date.getTime())) {
      console.log(`Successfully parsed date: ${dateString} → ${date.toISOString()}`);
      return date.toISOString();
    }
    
    // Try alternative formats if standard parsing fails
    // MM/DD/YYYY format
    const usMatch = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (usMatch) {
      const [_, month, day, year] = usMatch;
      const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toISOString();
      }
    }
    
    // DD/MM/YYYY format
    const euMatch = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (euMatch) {
      const [_, day, month, year] = euMatch;
      const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toISOString();
      }
    }
    
    // Try to extract year if all else fails - use January 1st of that year
    const yearMatch = dateString.match(/\b(20\d{2})\b/);
    if (yearMatch) {
      const year = Number(yearMatch[1]);
      if (year >= 2000 && year <= 2100) {
        console.log(`Extracted year ${year} from date: ${dateString}`);
        return new Date(year, 0, 1).toISOString();
      }
    }
  } catch (e) {
    console.error('Error parsing date:', dateString, e);
  }
  
  console.warn(`Failed to parse date: ${dateString}, using current date instead`);
  // Return current date if parsing failed
  return new Date().toISOString();
};

/**
 * Maps status strings to standardized values
 */
const mapStatus = (status?: string): 'Open' | 'Closed' | 'In Progress' => {
  if (!status) return 'Open';
  
  const lowerStatus = status.toLowerCase();
  
  if (lowerStatus.includes('closed') || lowerStatus.includes('resolved') || 
      lowerStatus.includes('complied') || lowerStatus.includes('complete')) {
    return 'Closed';
  }
  
  if (lowerStatus.includes('progress') || lowerStatus.includes('pending') || 
      lowerStatus.includes('scheduled') || lowerStatus.includes('under') ||
      lowerStatus.includes('review') || lowerStatus.includes('processing')) {
    return 'In Progress';
  }
  
  return 'Open';
};

/**
 * Validates a CSV file to ensure it has the required headers
 * @param file - The CSV file to validate
 * @returns A promise that resolves to true if the file is valid
 */
export const validateViolationsCsv = (file: File): Promise<boolean> => {
  const requiredHeaders = [
    'address',
    'status'
  ];
  
  return new Promise((resolve, reject) => {
    parse(file, {
      header: true,
      preview: 1, // Only parse the header row
      complete: (results) => {
        const headers = results.meta.fields || [];
        console.log('CSV headers:', headers);
        
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        
        if (missingHeaders.length > 0) {
          reject(new Error(`Missing required headers: ${missingHeaders.join(', ')}`));
        } else {
          resolve(true);
        }
      },
      error: (error) => {
        reject(new Error(`Failed to validate CSV: ${error}`));
      }
    });
  });
};
