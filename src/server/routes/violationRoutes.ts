
import { Request, Response, RequestHandler } from 'express';
import { searchViolationsByAddress } from '../../utils/violationsService';
import { ViolationType } from '../../utils/types';
import { processBatch } from '../../utils/batchProcessing';

// Type interfaces
interface ViolationSearchQuery {
  address?: string;
}

interface MultiAddressSearchRequest {
  addresses: string[];
}

interface MultiAddressSearchQuery {
  year?: string;
}

// Search violations by address
export const searchViolations: RequestHandler<{}, any, any, ViolationSearchQuery> = async (
  req: Request<{}, any, any, ViolationSearchQuery>, 
  res: Response
) => {
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
};

// Search violations for multiple addresses
export const searchMultipleAddresses: RequestHandler<{}, any, MultiAddressSearchRequest, MultiAddressSearchQuery> = async (
  req: Request<{}, any, MultiAddressSearchRequest, MultiAddressSearchQuery>, 
  res: Response
) => {
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
};
