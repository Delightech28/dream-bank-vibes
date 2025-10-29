import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import mtnLogo from "@/assets/mtn-logo.png";
import airtelLogo from "@/assets/airtel-logo.png";
import gloLogo from "@/assets/glo-logo.png";
import nineMobileLogo from "@/assets/9mobile-logo.png";

interface BillsDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: {
    id: string;
    label: string;
  } | null;
}

const nigerianProviders = {
  airtime: [
    { id: "mtn", name: "MTN", logo: mtnLogo },
    { id: "glo", name: "Glo", logo: gloLogo },
    { id: "airtel", name: "Airtel", logo: airtelLogo },
    { id: "9mobile", name: "9mobile", logo: nineMobileLogo },
  ],
  data: [
    { id: "mtn", name: "MTN", logo: mtnLogo },
    { id: "glo", name: "Glo", logo: gloLogo },
    { id: "airtel", name: "Airtel", logo: airtelLogo },
    { id: "9mobile", name: "9mobile", logo: nineMobileLogo },
  ],
  electricity: [
    { id: "ekedc", name: "Eko Electric", logo: "https://ekedp.com/wp-content/uploads/2023/11/Eko-Electricity-Distribution-Company-Plc-logo-1.png" },
    { id: "ikedc", name: "Ikeja Electric", logo: "https://ikejaelectric.com/wp-content/uploads/2022/01/ikeja-electric-logo.png" },
    { id: "aedc", name: "Abuja Electric", logo: "https://abujaelectricity.com/images/logo.png" },
    { id: "phed", name: "Port Harcourt Electric", logo: "https://www.portharcourt-electricity.com/images/phed-logo.png" },
  ],
  cable: [
    { id: "dstv", name: "DStv", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/DStv_logo.svg/200px-DStv_logo.svg.png" },
    { id: "gotv", name: "GOtv", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/GOtv_logo.svg/200px-GOtv_logo.svg.png" },
    { id: "startimes", name: "StarTimes", logo: "https://www.startimesng.com/images/logo.png" },
  ],
  water: [
    { id: "lwc", name: "Lagos Water Corporation", logo: "https://lagoswater.org/images/logo.png" },
    { id: "fctwb", name: "FCT Water Board", logo: "https://fctwaterboard.com/images/logo.png" },
  ],
};

const detectProvider = (phone: string): string => {
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Get first 4 digits
  const prefix = cleaned.substring(0, 4);
  
  // MTN prefixes
  if (['0803', '0806', '0810', '0813', '0814', '0816', '0703', '0706', '0903', '0906', '0913', '0916'].includes(prefix)) {
    return 'mtn';
  }
  
  // Glo prefixes
  if (['0805', '0807', '0811', '0815', '0705', '0905', '0915'].includes(prefix)) {
    return 'glo';
  }
  
  // Airtel prefixes
  if (['0802', '0808', '0812', '0701', '0708', '0901', '0902', '0904', '0907', '0912'].includes(prefix)) {
    return 'airtel';
  }
  
  // 9mobile prefixes
  if (['0809', '0817', '0818', '0909', '0908'].includes(prefix)) {
    return '9mobile';
  }
  
  return '';
};

export const BillsDetailModal = ({ open, onOpenChange, category }: BillsDetailModalProps) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [detectedProvider, setDetectedProvider] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(0);

  const providers = category ? nigerianProviders[category.id as keyof typeof nigerianProviders] || [] : [];
  
  useEffect(() => {
    if (open) {
      fetchWalletBalance();
    }
  }, [open]);

  const fetchWalletBalance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: wallet, error } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setWalletBalance(wallet ? parseFloat(wallet.balance.toString()) : 0);
    } catch (error) {
      console.error('Failed to fetch wallet balance:', error);
    }
  };
  
  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value);
    const provider = detectProvider(value);
    setDetectedProvider(provider);
  };

  const handlePayment = async () => {
    if (!detectedProvider || !phoneNumber || !amount) {
      toast.error("Please fill all fields");
      return;
    }

    const purchaseAmount = parseFloat(amount);
    
    // Check if amount is valid
    if (isNaN(purchaseAmount) || purchaseAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    // Check wallet balance
    if (purchaseAmount > walletBalance) {
      toast.error(`Insufficient balance. Your balance is ₦${walletBalance.toLocaleString()}`);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('vtpass-purchase', {
        body: {
          serviceID: detectedProvider,
          amount: purchaseAmount,
          phone: phoneNumber,
        },
      });

      if (error) throw error;

      if (data.success) {
        toast.success(`${category?.label} purchase successful! ₦${amount} has been processed.`);
        // Refresh wallet balance
        await fetchWalletBalance();
        onOpenChange(false);
        setPhoneNumber("");
        setAmount("");
        setDetectedProvider("");
      } else {
        toast.error(data.message || "Purchase failed. Please try again.");
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast.error(error.message || "Failed to process purchase. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">{category?.label}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Wallet Balance Display */}
          <div className="bg-primary/10 rounded-lg p-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Wallet Balance</span>
            <span className="text-lg font-bold">₦{walletBalance.toLocaleString()}</span>
          </div>

          {/* Phone Number / Account Number with Provider Detection */}
          <div className="space-y-2">
            <Label htmlFor="phone">
              {category?.id === "airtime" || category?.id === "data" ? "Phone Number" : "Account Number"}
            </Label>
            <div className="relative">
              {detectedProvider && (category?.id === "airtime" || category?.id === "data") && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center bg-muted">
                  <img
                    src={providers.find(p => p.id === detectedProvider)?.logo}
                    alt={providers.find(p => p.id === detectedProvider)?.name}
                    className="w-6 h-6 object-contain rounded-full"
                  />
                </div>
              )}
              <Input
                id="phone"
                placeholder={category?.id === "airtime" || category?.id === "data" ? "080 1234 5678" : "Enter account number"}
                value={phoneNumber}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className={detectedProvider && (category?.id === "airtime" || category?.id === "data") ? "pl-14" : ""}
                disabled={loading}
              />
            </div>
            {detectedProvider && (category?.id === "airtime" || category?.id === "data") && (
              <p className="text-xs text-muted-foreground">
                {providers.find(p => p.id === detectedProvider)?.name} detected
              </p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="bill-amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-muted-foreground">₦</span>
              <Input
                id="bill-amount"
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9.]/g, '');
                  setAmount(val);
                }}
                className="pl-7"
                disabled={loading}
              />
            </div>
            {amount && parseFloat(amount) > walletBalance && (
              <p className="text-xs text-destructive">Insufficient balance</p>
            )}
          </div>

          {/* Quick amounts for airtime/data */}
          {(category?.id === "airtime" || category?.id === "data") && (
            <div className="flex gap-2">
              {[100, 200, 500, 1000].map((val) => (
                <Button
                  key={val}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(val.toString())}
                  className="flex-1"
                  disabled={loading}
                >
                  ₦{val}
                </Button>
              ))}
            </div>
          )}

          <Button 
            onClick={handlePayment} 
            className="w-full" 
            variant="gradient" 
            size="lg"
            disabled={loading || !amount || !phoneNumber || parseFloat(amount) > walletBalance}
          >
            {loading ? "Processing..." : "Pay Now"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
