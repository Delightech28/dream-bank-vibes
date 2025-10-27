import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search } from "lucide-react";
import { toast } from "sonner";

interface RequestMoneyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RequestMoneyModal = ({ open, onOpenChange }: RequestMoneyModalProps) => {
  const [amount, setAmount] = useState("");
  const [from, setFrom] = useState("");
  const [note, setNote] = useState("");

  const handleRequest = () => {
    if (!amount || !from) {
      toast.error("Please fill all fields");
      return;
    }
    toast.success(`Request for ₦${amount} sent to ${from} 📬`);
    onOpenChange(false);
    setAmount("");
    setFrom("");
    setNote("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Request Money</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="from">Request From</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="from"
                placeholder="Search contacts"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="req-amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-muted-foreground">₦</span>
              <Input
                id="req-amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note (Optional)</Label>
            <Textarea
              id="note"
              placeholder="What's this for?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>

          <Button onClick={handleRequest} className="w-full" variant="gradient" size="lg">
            Send Request
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
