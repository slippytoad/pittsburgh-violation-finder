
import { Request, Response, NextFunction } from 'express';
import { searchViolations as searchViolationsService } from '../../utils/violationsService';
import { ViolationType } from '../../utils/types';
import { processBatch } from '../../utils/batchProcessing';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

// For defining route parameters
interface AddressRequestParams extends ParamsDictionary {
  address: string;
}

// For defining body of batch processing request
interface BatchRequestBody {
  addresses: string[];
}

/**
 * Process a batch of addresses to search for violations
 */
export async function processBatchViolations(req: Request<{}, {}, BatchRequestBody>, res: Response, next: NextFunction) {
  const { addresses } = req.body;
  
  if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
    return res.status(400).json({ error: 'Valid addresses array is required' });
  }
  
  try {
    const results = await processBatch(addresses);
    res.json(results);
  } catch (error) {
    next(error);
  }
}

/**
 * Search for violations by address
 */
export async function searchViolations(req: Request<AddressRequestParams, {}, {}, ParsedQs>, res: Response, next: NextFunction) {
  try {
    const { address } = req.params;
    
    if (!address) {
      return res.status(400).json({ error: 'Valid address is required' });
    }
    
    const violations = await searchViolationsService(address);
    res.json(violations);
  } catch (error) {
    console.error('Error searching violations:', error);
    next(error);
  }
}
