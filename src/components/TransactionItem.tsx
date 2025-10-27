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
          {type === "income" ? "+" : "-"}₦{Math.abs(amount).toLocaleString()}
        </p>
      </div>
    </div>
  );
};
