
import { ViolationType } from './types';
import { sendEmail } from './emailService';
import { useToast } from '@/components/ui/use-toast';

/**
 * Load previously known violations from localStorage
 * @returns Record of known violation IDs by address
 */
export const loadKnownViolations = (): Record<string, string[]> => {
  const saved = localStorage.getItem('knownViolations');
  return saved ? JSON.parse(saved) : {};
};

/**
 * Save known violations to localStorage
 * @param violations Record of known violation IDs by address
 */
export const saveKnownViolations = (violations: Record<string, string[]>): void => {
  localStorage.setItem('knownViolations', JSON.stringify(violations));
};

/**
 * Compare new violations with known ones and return only the new ones
 * @param allViolations All violations found from the search
 * @returns Array of only the new violations that haven't been seen before
 */
export const filterNewViolations = (allViolations: ViolationType[]): ViolationType[] => {
  const knownViolations = loadKnownViolations();
  const newViolations: ViolationType[] = [];
  const updatedKnownViolations: Record<string, string[]> = { ...knownViolations };
  
  allViolations.forEach(violation => {
    const address = violation.address;
    const violationId = violation.id;
    
    // Initialize array for this address if it doesn't exist
    if (!updatedKnownViolations[address]) {
      updatedKnownViolations[address] = [];
    }
    
    // Check if this violation ID is known for this address
    if (!updatedKnownViolations[address].includes(violationId)) {
      newViolations.push(violation);
      updatedKnownViolations[address].push(violationId);
    }
  });
  
  // Save the updated known violations
  saveKnownViolations(updatedKnownViolations);
  
  return newViolations;
};

/**
 * Send email report of violations
 * @param newViolations Array of new violations to report
 * @param emailEnabled Whether email reports are enabled
 * @param emailAddress Email address to send reports to
 * @returns Promise that resolves to true if email was sent successfully
 */
export const sendViolationEmailReport = async (
  newViolations: ViolationType[], 
  emailEnabled: boolean, 
  emailAddress: string
): Promise<boolean> => {
  if (!emailEnabled || !emailAddress) return false;
  
  try {
    // Basic email content
    const emailSubject = `Property Violation Report - ${new Date().toLocaleDateString()}`;
    let emailBody = `Daily Property Violation Report\n\n`;
    
    if (newViolations.length > 0) {
      emailBody += `${newViolations.length} new violations found:\n\n`;
      newViolations.forEach(violation => {
        emailBody += `- Address: ${violation.address}\n`;
        emailBody += `  Violation: ${violation.violation_description}\n`;
        emailBody += `  Status: ${violation.status}\n\n`;
      });
    } else {
      emailBody += "Good news! No new violations were found today.";
    }
    
    // Format for HTML email
    const htmlMessage = emailBody.replace(/\n/g, '<br>');
    
    // Send the email using our email service
    const emailParams = {
      to_email: emailAddress,
      subject: emailSubject,
      message: htmlMessage
    };
    
    return await sendEmail(emailParams);
  } catch (error) {
    console.error("Failed to send email report:", error);
    return false;
  }
};

/**
 * Validate email address format
 * @param email Email address to validate
 * @returns Boolean indicating if the email format is valid
 */
export const validateEmail = (email: string): boolean => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
};
