
import { useScheduledCheck } from '@/contexts/ScheduledCheckContext';
import type { ScheduledCheckContextType } from '@/contexts/types';

export function useScheduledViolationCheck(): ScheduledCheckContextType {
  return useScheduledCheck();
}
