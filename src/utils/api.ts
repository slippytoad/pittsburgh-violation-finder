
/**
 * API service for the Property Violations Finder app
 * This file exports all the functions from the individual service modules
 */

// Export all address-related functions from addressService
export { fetchSavedAddresses, saveAddress, removeAddress } from './addressService';

// Export all violations-related functions from violationsService
export { searchViolationsByAddress } from './violationsService';

// Export mock data and types
export { ViolationType } from './types';
export { mockViolations, getViolationsByAddress } from './mockData';
