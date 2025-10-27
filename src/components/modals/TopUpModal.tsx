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
  const [cardNumber, setCardNumber] = useState("");
  const [cvv, setCvv] = useState("");
  const [expiry, setExpiry] = useState("");

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

          {/* Method-specific fields */}
          {method === "card" && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="card-number">Card Number</Label>
                <Input
                  id="card-number"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                    const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
                    setCardNumber(formatted);
                  }}
                  maxLength={19}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, '');
                      if (val.length >= 2) {
                        val = val.slice(0, 2) + '/' + val.slice(2, 4);
                      }
                      setExpiry(val);
                    }}
                    maxLength={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    type="password"
                    placeholder="123"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                    maxLength={3}
                  />
                </div>
              </div>
            </div>
          )}

          {method === "bank" && (
            <div className="space-y-3 pt-4 border-t bg-muted rounded-lg p-4">
              <h4 className="font-semibold">Bank Transfer Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bank Name</span>
                  <span className="font-medium">Delighto Bank</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account Number</span>
                  <span className="font-medium">0123456789</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account Name</span>
                  <span className="font-medium">John Doe - Delighto</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Transfer the amount to the account above and your wallet will be credited automatically.
              </p>
            </div>
          )}

          {method === "ussd" && (
            <div className="space-y-3 pt-4 border-t bg-muted rounded-lg p-4">
              <h4 className="font-semibold">USSD Code</h4>
              <div className="bg-background rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-primary mb-2">*737*1*Amount#</p>
                <p className="text-sm text-muted-foreground">
                  Dial the code above on your phone to fund your wallet
                </p>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>• Replace "Amount" with the amount you want to add</p>
                <p>• Example: *737*1*5000# for ₦5,000</p>
                <p>• Follow the prompts on your phone</p>
              </div>
            </div>
          )}

          <Button onClick={handleTopUp} className="w-full" variant="gradient" size="lg">
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
