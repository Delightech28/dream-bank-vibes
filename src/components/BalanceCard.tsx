import { Eye, EyeOff, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface BalanceCardProps {
  balance: number;
}

export const BalanceCard = ({ balance }: BalanceCardProps) => {
  const [showBalance, setShowBalance] = useState(true);
  const [currency, setCurrency] = useState<"NGN" | "USD">("NGN");
  const exchangeRate = 1650; // NGN to USD rate

  useEffect(() => {
    const savedCurrency = localStorage.getItem("preferredCurrency") as "NGN" | "USD" | null;
    if (savedCurrency) setCurrency(savedCurrency);
    
    const handleStorageChange = () => {
      const newCurrency = localStorage.getItem("preferredCurrency") as "NGN" | "USD" | null;
      if (newCurrency) setCurrency(newCurrency);
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const displayBalance = currency === "USD" ? balance / exchangeRate : balance;
  const currencySymbol = currency === "NGN" ? "₦" : "$";

  return (
    <div className="px-4 pt-6 pb-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm text-muted-foreground">Total Balance</h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setShowBalance(!showBalance)}
        >
          {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </Button>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2 animate-balance-up">
            {showBalance ? `${currencySymbol}${displayBalance.toLocaleString(undefined, { 
              minimumFractionDigits: currency === "USD" ? 2 : 0,
              maximumFractionDigits: currency === "USD" ? 2 : 2
            })}` : "••••••"}
          </h1>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-primary font-medium">+12.5%</span>
            <span className="text-muted-foreground">vs last month</span>
          </div>
        </div>
      </div>
    </div>
  );
};
