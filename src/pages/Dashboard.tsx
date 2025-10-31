import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownLeft, Plus, CreditCard, TrendingUp, Zap } from "lucide-react";
import { QuickAction } from "@/components/QuickAction";
import { TransactionItem } from "@/components/TransactionItem";
import { BalanceCard } from "@/components/BalanceCard";
import { SendMoneyModal } from "@/components/modals/SendMoneyModal";
import { RequestMoneyModal } from "@/components/modals/RequestMoneyModal";
import { BillsModal } from "@/components/modals/BillsModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [billsModalOpen, setBillsModalOpen] = useState(false);
  const [showNinUpgrade, setShowNinUpgrade] = useState(false);
  const [isPermanentAccount, setIsPermanentAccount] = useState(false);
  const [ninInput, setNinInput] = useState("");
  const [upgradingAccount, setUpgradingAccount] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<Array<{
    id: string;
    name: string;
    amount: number;
    type: "income" | "expense";
    date: string;
    icon: string;
  }>>([]);

  useEffect(() => {
    fetchWalletBalance();
    fetchRecentTransactions();
    checkAccountStatus();
  }, []);

  const fetchWalletBalance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No authenticated user');
        return;
      }

      const { data: wallet, error } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      
      if (wallet) {
        setBalance(wallet.balance);
      }
    } catch (error) {
      console.error('Error fetching wallet:', error);
      toast.error('Failed to load wallet balance');
    }
  };

  const checkAccountStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_permanent_account, nin, virtual_account_number')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setIsPermanentAccount(profile.is_permanent_account || false);
        setShowNinUpgrade(!!(!profile.is_permanent_account && profile.virtual_account_number));
      }
    } catch (error) {
      console.error('Error checking account status:', error);
    }
  };

  const handleUpgradeAccount = async () => {
    if (ninInput.length !== 11) {
      toast.error("Please enter a valid 11-digit NIN");
      return;
    }

    setUpgradingAccount(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-virtual-account', {
        body: { nin: ninInput }
      });

      if (error) throw error;

      if (data?.success && data.permanent) {
        toast.success("Account upgraded to permanent!");
        setIsPermanentAccount(true);
        setShowNinUpgrade(false);
        setNinInput("");
      } else {
        toast.error(data?.message || "Failed to upgrade account");
      }
    } catch (error: any) {
      console.error('Upgrade error:', error);
      toast.error("Failed to upgrade account. Please try again.");
    } finally {
      setUpgradingAccount(false);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;

      if (transactions) {
        const formattedTransactions = transactions.map((t) => {
          const isIncome = t.type === 'deposit';
          const icon = getTransactionIcon(t.type);
          const date = formatTransactionDate(t.created_at);
          
          return {
            id: t.id,
            name: t.description || getTransactionName(t.type, t.provider),
            amount: parseFloat(String(t.amount)),
            type: isIncome ? 'income' as const : 'expense' as const,
            date,
            icon,
          };
        });
        setRecentTransactions(formattedTransactions);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const getTransactionIcon = (type: string): string => {
    const iconMap: Record<string, string> = {
      deposit: "💰",
      withdrawal: "💸",
      airtime: "📱",
      data: "🌐",
      electricity: "⚡",
      cable: "📺",
      water: "💧",
    };
    return iconMap[type] || "💳";
  };

  const getTransactionName = (type: string, provider?: string | null): string => {
    if (provider) return `${provider} ${type}`;
    const nameMap: Record<string, string> = {
      deposit: "Wallet Deposit",
      withdrawal: "Withdrawal",
      airtime: "Airtime Purchase",
      data: "Data Purchase",
      electricity: "Electricity Bill",
      cable: "Cable TV",
      water: "Water Bill",
    };
    return nameMap[type] || "Transaction";
  };

  const formatTransactionDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 24) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="pb-24 md:pb-8">
      {/* Balance Card */}
      <BalanceCard balance={balance} />

      {/* NIN Upgrade Banner */}
      {showNinUpgrade && (
        <div className="px-4 mb-6">
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold mb-1 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Upgrade to Permanent Account
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Enter your 11-digit NIN to get a permanent virtual account with no expiry
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter NIN"
                      value={ninInput}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 11);
                        setNinInput(value);
                      }}
                      maxLength={11}
                      className="flex-1 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Button 
                      size="sm" 
                      onClick={handleUpgradeAccount}
                      disabled={upgradingAccount || ninInput.length !== 11}
                    >
                      {upgradingAccount ? "Upgrading..." : "Upgrade"}
                    </Button>
                  </div>
                </div>
                <button
                  onClick={() => setShowNinUpgrade(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div className="px-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-4 gap-3">
          <div onClick={() => setSendModalOpen(true)}>
            <QuickAction icon={<ArrowUpRight className="w-5 h-5" />} label="Send" />
          </div>
          <div onClick={() => setRequestModalOpen(true)}>
            <QuickAction icon={<ArrowDownLeft className="w-5 h-5" />} label="Request" />
          </div>
          <div onClick={() => navigate("/top-up")}>
            <QuickAction icon={<Plus className="w-5 h-5" />} label="Top Up" />
          </div>
          <div onClick={() => setBillsModalOpen(true)}>
            <QuickAction icon={<Zap className="w-5 h-5" />} label="Bills" />
          </div>
        </div>
      </div>

      {/* My Cards */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">My Cards</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate("/cards")}>View All</Button>
        </div>
        <div className="relative h-48 gradient-primary rounded-2xl shadow-glow p-6 text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full -ml-20 -mb-20" />
          
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs opacity-80 mb-1">Total Balance</p>
                <p className="text-2xl font-bold">₦{balance.toLocaleString()}</p>
              </div>
              <CreditCard className="w-8 h-8 opacity-80" />
            </div>
            
            <div>
              <p className="text-sm opacity-80 mb-1">Card Number</p>
              <p className="text-lg tracking-wider">•••• •••• •••• 4829</p>
              <div className="flex justify-between mt-3">
                <div>
                  <p className="text-xs opacity-80">Valid Thru</p>
                  <p className="text-sm">12/26</p>
                </div>
                <div>
                  <p className="text-xs opacity-80">CVV</p>
                  <p className="text-sm">•••</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate("/transactions")}>See All</Button>
        </div>
        <Card>
          <CardContent className="p-0">
            {recentTransactions.length > 0 ? (
              <div className="divide-y">
                {recentTransactions.map((transaction) => (
                  <TransactionItem key={transaction.id} {...transaction} />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <p>No transactions yet</p>
                <p className="text-sm mt-1">Start by topping up your wallet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <SendMoneyModal open={sendModalOpen} onOpenChange={setSendModalOpen} />
      <RequestMoneyModal open={requestModalOpen} onOpenChange={setRequestModalOpen} />
      <BillsModal open={billsModalOpen} onOpenChange={setBillsModalOpen} />
    </div>
  );
};

export default Dashboard;
