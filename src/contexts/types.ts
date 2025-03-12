
export interface ScheduledCheckContextType {
  isScheduled: boolean;
  lastCheckTime: Date | null;
  nextCheckTime: Date | null;
  emailEnabled: boolean;
  emailAddress: string;
  toggleScheduledChecks: (enable: boolean) => Promise<(() => void) | undefined>;
  checkForViolations: () => Promise<(() => void) | undefined>;
  updateEmailSettings: (enabled: boolean, email?: string) => Promise<void>;
}
