import { Eye, EyeOff, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface BalanceCardProps {
  balance: number;
}

export const BalanceCard = ({ balance }: BalanceCardProps) => {
  const [showBalance, setShowBalance] = useState(true);

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
            {showBalance ? `₦${balance.toLocaleString()}` : "••••••"}
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
