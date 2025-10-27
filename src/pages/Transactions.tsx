import { Card, CardContent } from "@/components/ui/card";
import { TransactionItem } from "@/components/TransactionItem";
import { Button } from "@/components/ui/button";
import { Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const Transactions = () => {
  const transactions: Array<{
    id: number;
    name: string;
    amount: number;
    type: "income" | "expense";
    date: string;
    icon: string;
  }> = [
    { id: 1, name: "Salary Deposit", amount: 5200, type: "income", date: "Today, 10:30 AM", icon: "💰" },
    { id: 2, name: "Netflix Subscription", amount: -15.99, type: "expense", date: "Yesterday, 3:20 PM", icon: "🎬" },
    { id: 3, name: "Grocery Store", amount: -127.50, type: "expense", date: "Yesterday, 11:45 AM", icon: "🛒" },
    { id: 4, name: "Transfer from Mom", amount: 200, type: "income", date: "Jan 24, 4:15 PM", icon: "💝" },
    { id: 5, name: "Coffee Shop", amount: -4.50, type: "expense", date: "Jan 24, 8:30 AM", icon: "☕" },
    { id: 6, name: "Uber Ride", amount: -23.80, type: "expense", date: "Jan 23, 7:45 PM", icon: "🚗" },
    { id: 7, name: "Freelance Payment", amount: 850, type: "income", date: "Jan 23, 2:00 PM", icon: "💼" },
    { id: 8, name: "Restaurant", amount: -65.00, type: "expense", date: "Jan 22, 8:30 PM", icon: "🍽️" },
    { id: 9, name: "Gym Membership", amount: -45.00, type: "expense", date: "Jan 22, 6:00 AM", icon: "💪" },
    { id: 10, name: "Online Shopping", amount: -199.99, type: "expense", date: "Jan 21, 3:20 PM", icon: "📦" },
  ];

  return (
    <div className="pb-24 md:pb-8">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold mb-6">Transactions</h1>
        
        {/* Search and Filter */}
        <div className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search transactions..." className="pl-9" />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="shadow-glow border-0">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Income</p>
              <p className="text-xl font-bold text-primary">+₦6,250</p>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </CardContent>
          </Card>
          <Card className="shadow-purple-glow border-0">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Expenses</p>
              <p className="text-xl font-bold text-secondary">-₦481</p>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Transaction List */}
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {transactions.map((transaction) => (
                <TransactionItem key={transaction.id} {...transaction} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Transactions;
