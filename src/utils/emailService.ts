
import emailjs from 'emailjs-com';

// EmailJS service credentials
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
const USER_ID = import.meta.env.VITE_EMAILJS_USER_ID || '';

// Initialize EmailJS
export const initEmailService = () => {
  if (USER_ID) {
    emailjs.init(USER_ID);
  } else {
    console.warn('EmailJS user ID not found. Email service will not work.');
  }
};

interface EmailParams {
  to_email: string;
  subject: string;
  message: string;
}

/**
 * Send an email using EmailJS
 */
export const sendEmail = async (params: EmailParams): Promise<boolean> => {
  if (!SERVICE_ID || !TEMPLATE_ID || !USER_ID) {
    console.error('EmailJS configuration is missing. Check your environment variables.');
    return false;
  }

  try {
    const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, params);
    console.log('Email sent successfully:', response);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
};
