import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Fingerprint, Lock, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface TransactionConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: string;
  recipient: string;
  onConfirm: () => void;
}

export const TransactionConfirmModal = ({ open, onOpenChange, amount, recipient, onConfirm }: TransactionConfirmModalProps) => {
  const [pin, setPin] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const handlePinConfirm = () => {
    if (pin.length !== 4) {
      toast.error("Please enter a 4-digit PIN");
      return;
    }
    setConfirmed(true);
    setTimeout(() => {
      onConfirm();
      onOpenChange(false);
      setConfirmed(false);
      setPin("");
    }, 1500);
  };

  const handleFingerprintConfirm = () => {
    setConfirmed(true);
    setTimeout(() => {
      onConfirm();
      onOpenChange(false);
      setConfirmed(false);
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {!confirmed ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Confirm Transaction</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Transaction Details */}
              <div className="bg-muted rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Recipient</span>
                  <span className="font-semibold">{recipient}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-semibold text-2xl text-primary">₦{amount}</span>
                </div>
              </div>

              {/* Authentication Method */}
              <Tabs defaultValue="fingerprint" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="fingerprint">
                    <Fingerprint className="w-4 h-4 mr-2" />
                    Fingerprint
                  </TabsTrigger>
                  <TabsTrigger value="pin">
                    <Lock className="w-4 h-4 mr-2" />
                    PIN
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="fingerprint" className="space-y-4">
                  <div className="flex flex-col items-center py-8">
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4 animate-pulse">
                      <Fingerprint className="w-12 h-12 text-primary" />
                    </div>
                    <p className="text-center text-muted-foreground">
                      Touch the fingerprint sensor to confirm
                    </p>
                  </div>
                  <Button onClick={handleFingerprintConfirm} className="w-full" variant="gradient" size="lg">
                    Authenticate with Fingerprint
                  </Button>
                </TabsContent>

                <TabsContent value="pin" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pin">Enter 4-Digit PIN</Label>
                    <Input
                      id="pin"
                      type="password"
                      maxLength={4}
                      placeholder="••••"
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                      className="text-center text-2xl tracking-widest"
                    />
                  </div>
                  <Button onClick={handlePinConfirm} className="w-full" variant="gradient" size="lg">
                    Confirm Transaction
                  </Button>
                </TabsContent>
              </Tabs>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4 animate-bounce">
              <CheckCircle2 className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Transaction Confirmed!</h3>
            <p className="text-muted-foreground text-center">
              Your payment is being processed
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
