import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Search, Users } from "lucide-react";
import { toast } from "sonner";
import { ContactSelectModal } from "./ContactSelectModal";
import { TransactionConfirmModal } from "./TransactionConfirmModal";

interface SendMoneyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SendMoneyModal = ({ open, onOpenChange }: SendMoneyModalProps) => {
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [showContacts, setShowContacts] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSend = () => {
    if (!amount || !recipient) {
      toast.error("Please fill all fields");
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmTransaction = () => {
    toast.success(`₦${amount} sent to ${recipient} 🎉`);
    onOpenChange(false);
    setAmount("");
    setRecipient("");
  };

  const quickContacts = [
    { name: "Mom", avatar: "👩" },
    { name: "John", avatar: "👨" },
    { name: "Sarah", avatar: "👩‍💼" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Send Money</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Quick Contacts */}
          <div>
            <Label className="text-sm text-muted-foreground mb-3 block">Quick Send</Label>
            <div className="flex gap-4">
              {quickContacts.map((contact) => (
                <button
                  key={contact.name}
                  onClick={() => setRecipient(contact.name)}
                  className="flex flex-col items-center gap-2 hover:scale-110 transition-transform"
                >
                  <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-2xl">
                    {contact.avatar}
                  </div>
                  <span className="text-xs">{contact.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recipient */}
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="recipient"
                placeholder="Search or enter account number"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="pl-9 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowContacts(true)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-primary transition-colors"
              >
                <Users className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-muted-foreground">₦</span>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7"
              />
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div className="flex gap-2">
            {[1000, 5000, 10000].map((val) => (
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

          <Button onClick={handleSend} className="w-full" variant="gradient" size="lg">
            Send Money
          </Button>
        </div>
      </DialogContent>

      <ContactSelectModal
        open={showContacts}
        onOpenChange={setShowContacts}
        onSelectContact={(contact) => {
          setRecipient(contact.name);
          setShowContacts(false);
          onOpenChange(false);
        }}
      />

      <TransactionConfirmModal
        open={showConfirm}
        onOpenChange={setShowConfirm}
        amount={amount}
        recipient={recipient}
        onConfirm={handleConfirmTransaction}
      />
    </Dialog>
  );
};
