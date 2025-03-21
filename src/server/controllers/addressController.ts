
import { Request, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import * as addressService from '../services/addressService';

// Define types
type CustomRequestHandler<
  P = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = ParsedQs
> = (
  req: Request<P, ResBody, ReqBody, ReqQuery>,
  res: Response<ResBody>,
  next?: NextFunction
) => Promise<any> | void;

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
export const getAddresses: CustomRequestHandler = async (req: Request, res: Response) => {
  try {
    const addresses = await addressService.fetchAddresses();
    res.json(addresses);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ error: 'Failed to fetch addresses' });
  }
};

// Add a new address
export const addAddress: CustomRequestHandler<{}, any, AddressRequest> = async (
  req: Request<{}, any, AddressRequest>, 
  res: Response
) => {
  try {
    const { address } = req.body;
    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }

    const updatedAddresses = await addressService.saveAddress(address);
    res.json(updatedAddresses);
  } catch (error) {
    console.error('Error saving address:', error);
    res.status(500).json({ error: 'Failed to save address' });
  }
};

// Delete an address
export const deleteAddress: CustomRequestHandler<DeleteAddressParams> = async (
  req: Request<DeleteAddressParams>, 
  res: Response
) => {
  try {
    const index = parseInt(req.params.index);
    const updatedAddresses = await addressService.removeAddress(index);
    res.json(updatedAddresses);
  } catch (error) {
    console.error('Error removing address:', error);
    res.status(500).json({ error: 'Failed to remove address' });
  }
};

// Bulk import addresses
export const bulkImportAddresses: CustomRequestHandler<{}, any, BulkImportRequest> = async (
  req: Request<{}, any, BulkImportRequest>, 
  res: Response
) => {
  try {
    const { addresses } = req.body;
    if (!addresses || !Array.isArray(addresses)) {
      return res.status(400).json({ error: 'Valid address array is required' });
    }

    const updatedAddresses = await addressService.bulkImportAddresses(addresses);
    res.json(updatedAddresses);
  } catch (error) {
    console.error('Error bulk importing addresses:', error);
    res.status(500).json({ error: 'Failed to bulk import addresses' });
  }
};
