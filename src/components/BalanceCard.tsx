import { Eye, EyeOff, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface BalanceCardProps {
  balance: number;
}

export const BalanceCard = ({ balance }: BalanceCardProps) => {
  const [showBalance, setShowBalance] = useState(true);
  const [currency, setCurrency] = useState<"NGN" | "USD">("NGN");
  const [growthPercentage, setGrowthPercentage] = useState(0);
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

  useEffect(() => {
    calculateGrowth();
  }, [balance]);

  const calculateGrowth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Get last month's transactions
      const { data: lastMonthTxs } = await supabase
        .from("transactions")
        .select("amount")
        .eq("user_id", user.id)
        .eq("type", "deposit")
        .gte("created_at", lastMonth.toISOString())
        .lt("created_at", currentMonth.toISOString());

      // Get current month's transactions
      const { data: currentMonthTxs } = await supabase
        .from("transactions")
        .select("amount")
        .eq("user_id", user.id)
        .eq("type", "deposit")
        .gte("created_at", currentMonth.toISOString());

      const lastMonthTotal = lastMonthTxs?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;
      const currentMonthTotal = currentMonthTxs?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;

      if (lastMonthTotal > 0) {
        const growth = ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;
        setGrowthPercentage(growth);
      } else if (currentMonthTotal > 0) {
        setGrowthPercentage(100);
      } else {
        setGrowthPercentage(0);
      }
    } catch (error) {
      console.error("Error calculating growth:", error);
    }
  };

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
            {growthPercentage >= 0 ? (
              <>
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-primary font-medium">+{growthPercentage.toFixed(1)}%</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-4 h-4 text-destructive" />
                <span className="text-destructive font-medium">{growthPercentage.toFixed(1)}%</span>
              </>
            )}
            <span className="text-muted-foreground">vs last month</span>
          </div>
        </div>
      </div>
    </div>
  );
};
