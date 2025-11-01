import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const BillDetails = () => {
  const navigate = useNavigate();
  const { category } = useParams();
  const [amount, setAmount] = useState("");
  const [provider, setProvider] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [meterNumber, setMeterNumber] = useState("");
  const [smartCardNumber, setSmartCardNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const getTitle = () => {
    const titles: Record<string, string> = {
      airtime: "Buy Airtime",
      data: "Buy Data",
      electricity: "Pay Electricity",
      water: "Pay Water Bill",
      cable: "Pay Cable TV",
      internet: "Pay Internet",
    };
    return titles[category || ""] || "Pay Bill";
  };

  const providers = {
    airtime: ["MTN", "Glo", "Airtel", "9mobile"],
    data: ["MTN", "Glo", "Airtel", "9mobile"],
    electricity: ["EKEDC", "IKEDC", "AEDC", "PHED"],
    cable: ["DSTV", "GOTV", "Startimes"],
  };

  const getProviders = () => {
    return providers[category as keyof typeof providers] || [];
  };

  const handlePurchase = async () => {
    if (!provider) {
      toast.error("Please select a provider");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (["airtime", "data"].includes(category || "") && !phoneNumber) {
      toast.error("Please enter phone number");
      return;
    }

    if (category === "electricity" && !meterNumber) {
      toast.error("Please enter meter number");
      return;
    }

    if (category === "cable" && !smartCardNumber) {
      toast.error("Please enter smart card number");
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please login to continue");
        navigate("/auth");
        return;
      }

      // Get wallet
      const { data: wallet } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!wallet || wallet.balance < parseFloat(amount)) {
        toast.error("Insufficient balance");
        setLoading(false);
        return;
      }

      // Call VTPass edge function
      const { data, error } = await supabase.functions.invoke('vtpass-purchase', {
        body: {
          serviceID: category === "airtime" ? "airtime" : category === "data" ? "data" : category,
          billersCode: phoneNumber || meterNumber || smartCardNumber,
          variation_code: provider.toLowerCase(),
          amount: parseFloat(amount),
          phone: phoneNumber || user.phone || "",
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(`${getTitle()} successful!`);
        navigate("/dashboard");
      } else {
        toast.error(data?.message || "Purchase failed");
      }
    } catch (error: any) {
      console.error("Purchase error:", error);
      toast.error(error.message || "Failed to complete purchase");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-24 md:pb-8 min-h-screen">
      <div className="sticky top-0 bg-background/95 backdrop-blur z-10 border-b">
        <div className="flex items-center gap-3 px-4 h-16">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">{getTitle()}</h1>
        </div>
      </div>

      <div className="px-4 pt-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="provider">Select Provider</Label>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose provider" />
                </SelectTrigger>
                <SelectContent>
                  {getProviders().map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {["airtime", "data"].includes(category || "") && (
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="08012345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  maxLength={11}
                />
              </div>
            )}

            {category === "electricity" && (
              <div className="space-y-2">
                <Label htmlFor="meter">Meter Number</Label>
                <Input
                  id="meter"
                  type="text"
                  placeholder="Enter meter number"
                  value={meterNumber}
                  onChange={(e) => setMeterNumber(e.target.value)}
                />
              </div>
            )}

            {category === "cable" && (
              <div className="space-y-2">
                <Label htmlFor="smartcard">Smart Card Number</Label>
                <Input
                  id="smartcard"
                  type="text"
                  placeholder="Enter smart card number"
                  value={smartCardNumber}
                  onChange={(e) => setSmartCardNumber(e.target.value)}
                />
              </div>
            )}

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

            {category === "airtime" && (
              <div className="flex gap-2">
                {[1000, 2000, 5000].map((val) => (
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
            )}

            <Button 
              onClick={handlePurchase} 
              className="w-full" 
              variant="gradient" 
              size="lg"
              disabled={loading}
            >
              {loading ? "Processing..." : "Continue"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BillDetails;
