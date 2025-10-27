import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Building2, Smartphone } from "lucide-react";
import { toast } from "sonner";

interface TopUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TopUpModal = ({ open, onOpenChange }: TopUpModalProps) => {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<string>("card");

  const methods = [
    { id: "card", label: "Debit Card", icon: CreditCard },
    { id: "bank", label: "Bank Transfer", icon: Building2 },
    { id: "ussd", label: "USSD", icon: Smartphone },
  ];

  const handleTopUp = () => {
    if (!amount) {
      toast.error("Please enter amount");
      return;
    }
    toast.success(`Top up of ₦${amount} initiated 💳`);
    onOpenChange(false);
    setAmount("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Top Up Wallet</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-3">
            <Label className="text-sm text-muted-foreground">Select Method</Label>
            <div className="grid grid-cols-3 gap-3">
              {methods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                    method === m.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <m.icon className="w-6 h-6 mx-auto mb-2" />
                  <p className="text-xs font-medium">{m.label}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="topup-amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-muted-foreground">₦</span>
              <Input
                id="topup-amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7"
              />
            </div>
          </div>

          <div className="flex gap-2">
            {[5000, 10000, 20000].map((val) => (
              <Button
                key={val}
                variant="outline"
                size="sm"
                onClick={() => setAmount(val.toString())}
                className="flex-1"
              >
                ₦{val.toLocaleString()}
              </Button>
            ))}
          </div>

          <Button onClick={handleTopUp} className="w-full" variant="gradient" size="lg">
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
