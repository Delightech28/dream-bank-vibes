import { 
  DollarSign, 
  ShoppingCart, 
  Coffee, 
  Heart, 
  Film, 
  Car, 
  Briefcase, 
  Utensils, 
  Dumbbell, 
  Package,
  LucideIcon 
} from "lucide-react";
import { useState, useEffect } from "react";

interface TransactionItemProps {
  name: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  icon: string;
}

const getIconComponent = (iconName: string): LucideIcon => {
  const iconMap: Record<string, LucideIcon> = {
    "💰": DollarSign,
    "🎬": Film,
    "🛒": ShoppingCart,
    "💝": Heart,
    "☕": Coffee,
    "🚗": Car,
    "💼": Briefcase,
    "🍽️": Utensils,
    "💪": Dumbbell,
    "📦": Package,
  };
  return iconMap[iconName] || DollarSign;
};

export const TransactionItem = ({ name, amount, type, date, icon }: TransactionItemProps) => {
  const IconComponent = getIconComponent(icon);
  const [currency, setCurrency] = useState<"NGN" | "USD">("NGN");
  const exchangeRate = 1650;

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

  const displayAmount = currency === "USD" ? amount / exchangeRate : amount;
  const currencySymbol = currency === "NGN" ? "₦" : "$";
  
  return (
    <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
          type === "income" ? "bg-primary/20 text-primary" : "bg-muted text-foreground"
        }`}>
          <IconComponent className="w-5 h-5" />
        </div>
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-sm text-muted-foreground">{date}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-semibold ${type === "income" ? "text-primary" : "text-foreground"}`}>
          {type === "income" ? "+" : "-"}{currencySymbol}{Math.abs(displayAmount).toLocaleString(undefined, {
            minimumFractionDigits: currency === "USD" ? 2 : 0,
            maximumFractionDigits: currency === "USD" ? 2 : 2
          })}
        </p>
      </div>
    </div>
  );
};
