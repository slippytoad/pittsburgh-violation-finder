
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';

interface EmailSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  emailEnabled: boolean;
  emailAddress: string;
  onEmailEnabledChange: (enabled: boolean) => void;
  onEmailAddressChange: (address: string) => void;
  onSave: () => void;
}

const EmailSettingsDialog = ({
  open,
  onOpenChange,
  emailEnabled,
  emailAddress,
  onEmailEnabledChange,
  onEmailAddressChange,
  onSave
}: EmailSettingsDialogProps) => {
  const { toast } = useToast();
  
  const validateEmail = (email: string): boolean => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const handleSave = () => {
    if (emailEnabled && !validateEmail(emailAddress)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }
    
    onSave();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Email Report Settings</DialogTitle>
          <DialogDescription>
            Configure daily email reports for property violations.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-toggle">Enable Email Reports</Label>
            <Switch 
              id="email-toggle" 
              checked={emailEnabled}
              onCheckedChange={onEmailEnabledChange}
            />
          </div>
          
          {emailEnabled && (
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="email-address">Email Address</Label>
              <Input 
                id="email-address" 
                placeholder="your@email.com" 
                value={emailAddress}
                onChange={(e) => onEmailAddressChange(e.target.value)}
              />
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmailSettingsDialog;
