import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ChangePinModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ChangePinModal = ({ open, onOpenChange }: ChangePinModalProps) => {
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPin !== confirmPin) {
      toast.error("New PIN and confirm PIN do not match");
      return;
    }

    if (newPin.length !== 4) {
      toast.error("PIN must be 4 digits");
      return;
    }

    toast.success("PIN changed successfully!");
    onOpenChange(false);
    setCurrentPin("");
    setNewPin("");
    setConfirmPin("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            Change PIN
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-pin">Current PIN</Label>
            <Input
              id="current-pin"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={currentPin}
              onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter current PIN"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-pin">New PIN</Label>
            <Input
              id="new-pin"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter new PIN"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-pin">Confirm New PIN</Label>
            <Input
              id="confirm-pin"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
              placeholder="Confirm new PIN"
              required
            />
          </div>

          <Button type="submit" className="w-full" variant="gradient" size="lg">
            Change PIN
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
