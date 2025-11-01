import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, Search, User } from "lucide-react";
import { toast } from "sonner";
import { ContactSelectModal } from "@/components/modals/ContactSelectModal";
import { TransactionConfirmModal } from "@/components/modals/TransactionConfirmModal";

const SendMoney = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [note, setNote] = useState("");
  const [showContactModal, setShowContactModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleContactSelect = (contact: { id: number; name: string; phone: string; avatar: string }) => {
    setRecipient(`${contact.name} - ${contact.phone}`);
    setShowContactModal(false);
  };

  const handleSendClick = () => {
    if (!recipient) {
      toast.error("Please select a recipient");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirm = () => {
    toast.success(`Successfully sent ₦${amount} to ${recipient.split(' - ')[0]}`);
    setShowConfirmModal(false);
    navigate("/dashboard");
  };

  return (
    <div className="pb-24 md:pb-8 min-h-screen">
      <div className="sticky top-0 bg-background/95 backdrop-blur z-10 border-b">
        <div className="flex items-center gap-3 px-4 h-16">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Send Money</h1>
        </div>
      </div>

      <div className="px-4 pt-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="recipient">Send To</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="recipient"
                  placeholder="Select recipient"
                  value={recipient}
                  readOnly
                  onClick={() => setShowContactModal(true)}
                  className="pl-10 cursor-pointer"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1"
                  onClick={() => setShowContactModal(true)}
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-muted-foreground">₦</span>
                <Input
                  id="amount"
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

            <div className="space-y-2">
              <Label htmlFor="note">Note (Optional)</Label>
              <Textarea
                id="note"
                placeholder="Add a note..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
              />
            </div>

            <Button onClick={handleSendClick} className="w-full" variant="gradient" size="lg">
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>

      <ContactSelectModal
        open={showContactModal}
        onOpenChange={setShowContactModal}
        onSelectContact={handleContactSelect}
      />

      <TransactionConfirmModal
        open={showConfirmModal}
        onOpenChange={setShowConfirmModal}
        amount={amount}
        recipient={recipient}
        onConfirm={handleConfirm}
      />
    </div>
  );
};

export default SendMoney;
