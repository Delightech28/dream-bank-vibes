import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Building2, Smartphone, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PaystackPaymentModal } from "@/components/modals/PaystackPaymentModal";

type CardType = "visa" | "mastercard" | "amex" | "discover" | "verve" | "unknown";

const detectCardType = (number: string): CardType => {
  const cleaned = number.replace(/\s/g, '');
  
  if (/^4/.test(cleaned)) return "visa";
  if (/^5[1-5]/.test(cleaned)) return "mastercard";
  if (/^3[47]/.test(cleaned)) return "amex";
  if (/^6(?:011|5)/.test(cleaned)) return "discover";
  if (/^(506|507|650|6500)/.test(cleaned)) return "verve";
  
  return "unknown";
};

const getCardTypeDisplay = (type: CardType): string => {
  const types = {
    visa: "Visa",
    mastercard: "Mastercard",
    amex: "American Express",
    discover: "Discover",
    verve: "Verve",
    unknown: ""
  };
  return types[type];
};

const getCardIcon = (type: CardType) => {
  const iconClass = "w-8 h-5 rounded border border-border bg-background flex items-center justify-center text-xs font-bold";
  const icons = {
    visa: <div className={`${iconClass} text-blue-600`}>VISA</div>,
    mastercard: <div className={`${iconClass} text-red-600`}>MC</div>,
    amex: <div className={`${iconClass} text-blue-500`}>AMEX</div>,
    discover: <div className={`${iconClass} text-orange-600`}>DISC</div>,
    verve: <div className={`${iconClass} text-primary`}>VERVE</div>,
    unknown: null
  };
  return icons[type];
};

const TopUp = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<string>("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cvv, setCvv] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cardType, setCardType] = useState<CardType>("unknown");
  const [userEmail, setUserEmail] = useState("");
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  useEffect(() => {
    setCardType(detectCardType(cardNumber));
  }, [cardNumber]);

  useEffect(() => {
    const getUserEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }
    };
    getUserEmail();
  }, []);

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
    
    if (method === "card") {
      const cleanedCard = cardNumber.replace(/\s/g, '');
      const cleanedExpiry = expiry.replace(/\//g, '');
      
      if (cleanedCard.length < 13 || cleanedCard.length > 19) {
        toast.error("Invalid card number");
        return;
      }
      
      if (cleanedExpiry.length !== 4) {
        toast.error("Invalid expiry date");
        return;
      }
      
      const month = parseInt(cleanedExpiry.slice(0, 2));
      if (month < 1 || month > 12) {
        toast.error("Invalid expiry month");
        return;
      }
      
      const maxCvvLength = cardType === "amex" ? 4 : 3;
      if (cvv.length < maxCvvLength) {
        toast.error(`CVV must be ${maxCvvLength} digits`);
        return;
      }

      setPaymentModalOpen(true);
    } else {
      toast.success(`Top up of ₦${amount} initiated 💳`);
      navigate("/dashboard");
      resetForm();
    }
  };

  const resetForm = () => {
    setAmount("");
    setCardNumber("");
    setCvv("");
    setExpiry("");
  };

  const handlePaymentSuccess = () => {
    resetForm();
    window.location.href = "/dashboard";
  };

  return (
    <div className="pb-24 md:pb-8 min-h-screen">
      <div className="sticky top-0 bg-background/95 backdrop-blur z-10 border-b">
        <div className="flex items-center gap-3 px-4 h-16">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Top Up Wallet</h1>
        </div>
      </div>

      <div className="px-4 pt-6">
        <Card>
          <CardContent className="p-6 space-y-6">
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

            {method === "card" && (
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="card-number">Card Number</Label>
                    {cardType !== "unknown" && cardNumber.length > 4 && (
                      <span className="text-xs font-medium text-primary">
                        {getCardTypeDisplay(cardType)}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id="card-number"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 19);
                        const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
                        setCardNumber(formatted);
                      }}
                      maxLength={23}
                      className="pr-12"
                    />
                    {cardType !== "unknown" && cardNumber.length > 4 && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {getCardIcon(cardType)}
                      </div>
                    )}
                  </div>
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
                      placeholder={cardType === "amex" ? "1234" : "123"}
                      value={cvv}
                      onChange={(e) => {
                        const maxLength = cardType === "amex" ? 4 : 3;
                        setCvv(e.target.value.replace(/\D/g, '').slice(0, maxLength));
                      }}
                      maxLength={cardType === "amex" ? 4 : 3}
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
                    <span className="font-medium">PayVance Bank</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account Number</span>
                    <span className="font-medium">0123456789</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account Name</span>
                    <span className="font-medium">John Doe - PayVance</span>
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
          </CardContent>
        </Card>
      </div>

      <PaystackPaymentModal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        amount={amount}
        email={userEmail}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default TopUp;
