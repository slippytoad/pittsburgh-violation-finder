
/**
 * Provides mock violation data for testing and fallback
 */
import { ViolationType } from '@/utils/types';
import { getDebugViolations as getMockData } from '@/utils/mockData';
import { transformViolationData } from '@/utils/violationTransformer';

/**
 * Get debug violations data (for testing)
 */
export function getDebugViolations(): ViolationType[] {
  return transformViolationData(getMockData());
}

/**
 * Provides mock data when we can't access the real database
 * This helps the app continue to function even when Supabase is inaccessible
 */
export function getMockViolationsData(address: string): ViolationType[] {
  console.log(`Using mock data for address: ${address}`);
  const mockData = getMockData().slice(0, 3).map(violation => ({
    ...violation,
    address: address
  }));
  
  // Group the mock data by case number
  return transformViolationData(mockData);
}
