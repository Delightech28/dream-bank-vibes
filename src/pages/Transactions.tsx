import { Card, CardContent } from "@/components/ui/card";
import { TransactionItem } from "@/components/TransactionItem";
import { Button } from "@/components/ui/button";
import { Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: string;
  created_at: string;
  status: string;
  provider?: string;
}

const Transactions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string, provider?: string) => {
    if (type === 'airtime' || type === 'data') return '📱';
    if (type === 'electricity') return '⚡';
    if (type === 'cable') return '📺';
    if (type === 'water') return '💧';
    if (type === 'topup') return '💰';
    return '📦';
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = transaction.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || 
      (filterType === "income" && transaction.type === "topup") ||
      (filterType === "expense" && transaction.type !== "topup");
    return matchesSearch && matchesFilter;
  });

  const totalIncome = transactions
    .filter(t => t.type === 'topup' && t.status === 'completed')
    .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

  const totalExpenses = transactions
    .filter(t => t.type !== 'topup' && t.status === 'completed')
    .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

  return (
    <div className="pb-24 md:pb-8">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold mb-6">Transactions</h1>
        
        {/* Search and Filter */}
        <div className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search transactions..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={filterType} onValueChange={setFilterType}>
                <DropdownMenuRadioItem value="all">All Transactions</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="income">Income Only</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="expense">Expenses Only</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="shadow-glow border-0">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Income</p>
              <p className="text-xl font-bold text-primary">+₦{totalIncome.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">Total deposits</p>
            </CardContent>
          </Card>
          <Card className="shadow-purple-glow border-0">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Expenses</p>
              <p className="text-xl font-bold text-secondary">-₦{totalExpenses.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">Total spent</p>
            </CardContent>
          </Card>
        </div>

        {/* Transaction List */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">
                Loading transactions...
              </div>
            ) : filteredTransactions.length > 0 ? (
              <div className="divide-y">
                {filteredTransactions.map((transaction) => (
                  <TransactionItem 
                    key={transaction.id} 
                    name={transaction.description || 'Transaction'}
                    amount={parseFloat(transaction.amount.toString())}
                    type={transaction.type === 'topup' ? 'income' : 'expense'}
                    date={format(new Date(transaction.created_at), "MMM dd, hh:mm a")}
                    icon={getTransactionIcon(transaction.type, transaction.provider)}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                No transactions yet. Start by topping up your wallet!
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Transactions;
