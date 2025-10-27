interface TransactionItemProps {
  name: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  icon: string;
}

export const TransactionItem = ({ name, amount, type, date, icon }: TransactionItemProps) => {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-2xl">
          {icon}
        </div>
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-sm text-muted-foreground">{date}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-semibold ${type === "income" ? "text-primary" : "text-foreground"}`}>
          {type === "income" ? "+" : ""}${Math.abs(amount).toFixed(2)}
        </p>
      </div>
    </div>
  );
};
