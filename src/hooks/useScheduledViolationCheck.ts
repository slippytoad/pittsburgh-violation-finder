
import { useScheduledCheck } from '@/contexts/ScheduledCheckContext';

export function useScheduledViolationCheck() {
  return useScheduledCheck();
}
