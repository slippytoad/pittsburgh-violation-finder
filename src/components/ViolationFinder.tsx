import React, { useState, useEffect } from 'react';
import SearchForm from '@/components/SearchForm';
import ResultsList from '@/components/ResultsList';
import AddressList from '@/components/AddressList';
import AnimatedContainer from '@/components/AnimatedContainer';
import { useViolations } from '@/hooks/useViolations';
import { useAddresses } from '@/hooks/useAddresses';
import { useScheduledViolationCheck } from '@/hooks/useScheduledViolationCheck';
import { Button } from '@/components/ui/button';
import { Import, Bell, BellOff, Mail, MailX } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { initSupabaseTables } from '@/utils/supabase';

const ViolationFinder = () => {
  const { violations, isLoading, selectedAddress, handleSearch, handleSearchAll, searchCount } = useViolations();
  const { addresses, handleAddAddress, handleRemoveAddress, handleBulkImport } = useAddresses();
  const { 
    isScheduled,
    nextCheckTime, 
    toggleScheduledChecks,
    emailEnabled,
    emailAddress,
    updateEmailSettings
  } = useScheduledViolationCheck();
  
  const [bulkImportText, setBulkImportText] = useState<string>('');
  const [showBulkImport, setShowBulkImport] = useState<boolean>(false);
  const [showEmailSettings, setShowEmailSettings] = useState<boolean>(false);
  const [tempEmailEnabled, setTempEmailEnabled] = useState<boolean>(emailEnabled);
  const [tempEmailAddress, setTempEmailAddress] = useState<string>(emailAddress);
  const { toast } = useToast();

  useEffect(() => {
    setTempEmailEnabled(emailEnabled);
    setTempEmailAddress(emailAddress);
  }, [emailEnabled, emailAddress]);

  useEffect(() => {
    const addProvidedAddresses = async () => {
      const addressesToAdd = [
        "10 Edith Place",
        "12 Edith Place",
        "3210 Dawson St",
        "3220 Dawson St",
        "3227 Dawson St Units 1&2",
        "3228 Dawson St",
        "3230 Dawson St",
        "3232 Dawson St",
        "109 Oakland Ct",
        "25 Edith Pl",
        "3206 Dawson St Units 1-3",
        "3208 Dawson St Units 1&2",
        "3431 Parkview Ave",
        "3433 Parkview Ave Units 1&2",
        "5419 Potter St",
        "19 Edith Pl",
        "20 Edith Pl",
        "3341 Parkview Ave",
        "3343 Parkview Ave",
        "3707 Orpwood St",
        "3709 Orpwood St",
        "3711 Orpwood St Units 1&2",
        "3817 Bates St"
      ];
      
      if (addressesToAdd.length > 0) {
        try {
          await handleBulkImport(addressesToAdd);
          toast({
            title: "Addresses added",
            description: `Successfully added the provided addresses to your saved list.`,
          });
        } catch (error) {
          console.error("Failed to add addresses:", error);
          toast({
            title: "Error",
            description: "Failed to add the addresses to your saved list.",
            variant: "destructive"
          });
        }
      }
    };
    
    addProvidedAddresses();
  }, []);

  useEffect(() => {
    const initTables = async () => {
      try {
        await initSupabaseTables();
      } catch (error) {
        console.error('Failed to initialize Supabase tables:', error);
      }
    };
    
    initTables();
  }, []);

  const onSearchAll = () => {
    if (addresses.length > 10) {
      toast({
        title: "Processing in batches",
        description: `Searching ${addresses.length} addresses in smaller batches to avoid timeouts.`,
      });
    }
    handleSearchAll(addresses);
  };

  const processBulkImport = () => {
    if (!bulkImportText.trim()) {
      toast({
        title: "No addresses provided",
        description: "Please enter at least one address to import.",
        variant: "destructive"
      });
      return;
    }
    
    const addressList = bulkImportText
      .split('\n')
      .map(address => address.trim())
      .filter(address => address.length > 0);
      
    if (addressList.length === 0) {
      toast({
        title: "No valid addresses",
        description: "No valid addresses found in the input.",
        variant: "destructive"
      });
      return;
    }
    
    handleBulkImport(addressList);
    setBulkImportText('');
    setShowBulkImport(false);
  };

  const saveEmailSettings = () => {
    if (tempEmailEnabled && !validateEmail(tempEmailAddress)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }
    
    updateEmailSettings(tempEmailEnabled, tempEmailAddress);
    setShowEmailSettings(false);
  };

  const validateEmail = (email: string): boolean => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  return (
    <div className="max-w-screen-xl mx-auto">
      <AnimatedContainer className="mb-8 text-center">
        <h1 className="text-3xl font-semibold mb-2">Pittsburgh Property Violation Finder</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Search for property violation notices in Pittsburgh, PA using addresses with the official WPRDC data.
          {searchCount > 0 && <span className="block mt-1 text-sm">Completed {searchCount} searches so far</span>}
        </p>
        
        <div className="mt-4 flex items-center justify-center gap-4">
          <Button
            variant={isScheduled ? "default" : "outline"}
            onClick={() => toggleScheduledChecks(!isScheduled)}
            className="flex items-center gap-2 text-sm"
          >
            {isScheduled ? (
              <>
                <BellOff className="h-4 w-4" />
                Disable Daily Checks
              </>
            ) : (
              <>
                <Bell className="h-4 w-4" />
                Enable Daily Checks at 6 AM PST
              </>
            )}
          </Button>
          
          <Button
            variant={emailEnabled ? "default" : "outline"}
            onClick={() => setShowEmailSettings(true)}
            className="flex items-center gap-2 text-sm"
          >
            {emailEnabled ? (
              <>
                <Mail className="h-4 w-4" />
                Email Reports: On
              </>
            ) : (
              <>
                <MailX className="h-4 w-4" />
                Email Reports: Off
              </>
            )}
          </Button>
        </div>
        
        {isScheduled && nextCheckTime && (
          <div className="mt-2 text-xs text-muted-foreground">
            Next check scheduled for: {nextCheckTime.toLocaleString()}
          </div>
        )}
        
        {emailEnabled && (
          <div className="mt-1 text-xs text-muted-foreground">
            Email reports will be sent to: {emailAddress}
          </div>
        )}
      </AnimatedContainer>
      
      <div id="violations-data" style={{ display: 'none' }}>
        {JSON.stringify(violations)}
      </div>
      
      <div className="grid grid-cols-1 gap-8">
        <SearchForm 
          onSearch={handleSearch} 
          onAddAddress={handleAddAddress}
          isLoading={isLoading}
        />
        
        <AddressList 
          addresses={addresses} 
          onRemove={handleRemoveAddress}
          onSearch={handleSearch}
          onSearchAll={onSearchAll}
          selectedAddress={selectedAddress}
          onToggleBulkImport={() => setShowBulkImport(!showBulkImport)}
          showBulkImport={showBulkImport}
        />
        
        {showBulkImport && (
          <AnimatedContainer>
            <div className="glass rounded-xl p-6 subtle-shadow">
              <h2 className="text-lg font-medium mb-4">Bulk Import Addresses</h2>
              <div className="space-y-4">
                <textarea 
                  className="w-full h-40 p-3 border rounded-md bg-background/70"
                  placeholder="Enter one address per line..."
                  value={bulkImportText}
                  onChange={(e) => setBulkImportText(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowBulkImport(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={processBulkImport}
                  >
                    <Import className="mr-2 h-4 w-4" />
                    Import Addresses
                  </Button>
                </div>
              </div>
            </div>
          </AnimatedContainer>
        )}
        
        <ResultsList 
          violations={violations}
          isLoading={isLoading}
        />
      </div>
      
      <Dialog open={showEmailSettings} onOpenChange={setShowEmailSettings}>
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
                checked={tempEmailEnabled}
                onCheckedChange={setTempEmailEnabled}
              />
            </div>
            
            {tempEmailEnabled && (
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="email-address">Email Address</Label>
                <Input 
                  id="email-address" 
                  placeholder="your@email.com" 
                  value={tempEmailAddress}
                  onChange={(e) => setTempEmailAddress(e.target.value)}
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailSettings(false)}>Cancel</Button>
            <Button onClick={saveEmailSettings}>Save Settings</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ViolationFinder;
