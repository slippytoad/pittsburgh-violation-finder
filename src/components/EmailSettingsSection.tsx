
import React from 'react';
import EmailSettingsDialog from '@/components/EmailSettingsDialog';

interface EmailSettingsSectionProps {
  showEmailSettings: boolean;
  setShowEmailSettings: (show: boolean) => void;
  tempEmailEnabled: boolean;
  setTempEmailEnabled: (enabled: boolean) => void;
  tempEmailAddress: string;
  setTempEmailAddress: (address: string) => void;
  updateEmailSettings: (enabled: boolean, email?: string) => Promise<void>;
}

const EmailSettingsSection: React.FC<EmailSettingsSectionProps> = ({
  showEmailSettings,
  setShowEmailSettings,
  tempEmailEnabled,
  setTempEmailEnabled,
  tempEmailAddress,
  setTempEmailAddress,
  updateEmailSettings
}) => {
  const saveEmailSettings = () => {
    updateEmailSettings(tempEmailEnabled, tempEmailAddress);
    setShowEmailSettings(false);
  };

  return (
    <EmailSettingsDialog
      open={showEmailSettings}
      onOpenChange={setShowEmailSettings}
      emailEnabled={tempEmailEnabled}
      emailAddress={tempEmailAddress}
      onEmailEnabledChange={setTempEmailEnabled}
      onEmailAddressChange={setTempEmailAddress}
      onSave={saveEmailSettings}
    />
  );
};

export default EmailSettingsSection;
