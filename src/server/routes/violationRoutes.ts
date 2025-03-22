
import express from 'express';
import { Request, Response, NextFunction } from 'express';
import { searchViolations as searchViolationsService } from '../../utils/violationsService';
import { ViolationType } from '../../utils/types';
import { processBatch } from '../../utils/batchProcessing';

const router = express.Router();

// For defining body of batch processing request
interface BatchRequestBody {
  addresses: string[];
}

/**
 * Process a batch of addresses to search for violations
 */
router.post('/batch', async (req: Request, res: Response, next: NextFunction) => {
  const { addresses } = req.body as BatchRequestBody;
  
  if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
    return res.status(400).json({ error: 'Valid addresses array is required' });
  }
  
  try {
    const results = await processBatch(
      addresses,
      0,
      (count) => console.log(`Processed ${count} addresses`),
      [],
      undefined // AbortSignal is optional
    );
    res.json(results);
  } catch (error) {
    next(error);
  }
});

/**
 * Search for violations by address
 */
router.get('/search', async (req: Request, res: Response, next: NextFunction) => {
  const address = req.query.address as string;
  
  if (!address) {
    return res.status(400).json({ error: 'Valid address is required' });
  }
  
  try {
    const violations = await searchViolationsService(address);
    res.json(violations);
  } catch (error) {
    console.error('Error searching violations:', error);
    next(error);
  }
});

/**
 * Search violations for multiple addresses
 */
router.post('/search-multiple', async (req: Request, res: Response, next: NextFunction) => {
  const { addresses } = req.body as BatchRequestBody;
  
  if (!addresses || !Array.isArray(addresses)) {
    return res.status(400).json({ error: 'Valid address array is required' });
  }
  
  try {
    const results = await processBatch(
      addresses,
      0,
      (count) => console.log(`Processed ${count} addresses`),
      [],
      undefined // AbortSignal is optional
    );
    res.json(results);
  } catch (error) {
    console.error('Error searching multiple addresses:', error);
    next(error);
  }
});

// Export the router
export default router;
