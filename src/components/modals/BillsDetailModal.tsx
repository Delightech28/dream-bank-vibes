import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

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
    { id: "mtn", name: "MTN", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/MTN_Logo.svg/200px-MTN_Logo.svg.png" },
    { id: "glo", name: "Glo", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Glo_logo.svg/200px-Glo_logo.svg.png" },
    { id: "airtel", name: "Airtel", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Bharti_Airtel_Limited.svg/200px-Bharti_Airtel_Limited.svg.png" },
    { id: "9mobile", name: "9mobile", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/9mobile_logo.svg/200px-9mobile_logo.svg.png" },
  ],
  data: [
    { id: "mtn", name: "MTN", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/MTN_Logo.svg/200px-MTN_Logo.svg.png" },
    { id: "glo", name: "Glo", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Glo_logo.svg/200px-Glo_logo.svg.png" },
    { id: "airtel", name: "Airtel", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Bharti_Airtel_Limited.svg/200px-Bharti_Airtel_Limited.svg.png" },
    { id: "9mobile", name: "9mobile", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/9mobile_logo.svg/200px-9mobile_logo.svg.png" },
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

export const BillsDetailModal = ({ open, onOpenChange, category }: BillsDetailModalProps) => {
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");

  const providers = category ? nigerianProviders[category.id as keyof typeof nigerianProviders] || [] : [];

  const handlePayment = () => {
    if (!selectedProvider || !phoneNumber || !amount) {
      toast.error("Please fill all fields");
      return;
    }
    toast.success(`Payment of ₦${amount} for ${category?.label} initiated! 💸`);
    onOpenChange(false);
    setSelectedProvider("");
    setPhoneNumber("");
    setAmount("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">{category?.label}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Provider Selection */}
          <div className="space-y-3">
            <Label>Select Provider</Label>
            <div className="grid grid-cols-2 gap-3">
              {providers.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => setSelectedProvider(provider.id)}
                  className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                    selectedProvider === provider.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="w-full h-12 flex items-center justify-center mb-2">
                    <img
                      src={provider.logo}
                      alt={provider.name}
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = `<span class="text-xl font-bold">${provider.name}</span>`;
                      }}
                    />
                  </div>
                  <p className="text-xs font-medium text-center">{provider.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Phone Number / Account Number */}
          <div className="space-y-2">
            <Label htmlFor="phone">
              {category?.id === "airtime" || category?.id === "data" ? "Phone Number" : "Account Number"}
            </Label>
            <Input
              id="phone"
              placeholder={category?.id === "airtime" || category?.id === "data" ? "080 1234 5678" : "Enter account number"}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
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
              />
            </div>
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
                >
                  ₦{val}
                </Button>
              ))}
            </div>
          )}

          <Button onClick={handlePayment} className="w-full" variant="gradient" size="lg">
            Pay Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
