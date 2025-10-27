import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownLeft, Plus, CreditCard, TrendingUp, Zap } from "lucide-react";
import { QuickAction } from "@/components/QuickAction";
import { TransactionItem } from "@/components/TransactionItem";
import { BalanceCard } from "@/components/BalanceCard";
import { SendMoneyModal } from "@/components/modals/SendMoneyModal";
import { RequestMoneyModal } from "@/components/modals/RequestMoneyModal";
import { TopUpModal } from "@/components/modals/TopUpModal";
import { BillsModal } from "@/components/modals/BillsModal";

const Dashboard = () => {
  const navigate = useNavigate();
  const [balance] = useState(24580.50);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [topUpModalOpen, setTopUpModalOpen] = useState(false);
  const [billsModalOpen, setBillsModalOpen] = useState(false);

  const transactions: Array<{
    id: number;
    name: string;
    amount: number;
    type: "income" | "expense";
    date: string;
    icon: string;
  }> = [
    { id: 1, name: "Salary Deposit", amount: 5200, type: "income", date: "Today", icon: "💰" },
    { id: 2, name: "Netflix Subscription", amount: -15.99, type: "expense", date: "Yesterday", icon: "🎬" },
    { id: 3, name: "Grocery Store", amount: -127.50, type: "expense", date: "Yesterday", icon: "🛒" },
    { id: 4, name: "Transfer from Mom", amount: 200, type: "income", date: "2 days ago", icon: "💝" },
    { id: 5, name: "Coffee Shop", amount: -4.50, type: "expense", date: "2 days ago", icon: "☕" },
  ];

  return (
    <div className="pb-24 md:pb-8">
      {/* Balance Card */}
      <BalanceCard balance={balance} />

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
          <div onClick={() => setTopUpModalOpen(true)}>
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
            <div className="divide-y">
              {transactions.map((transaction) => (
                <TransactionItem key={transaction.id} {...transaction} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <SendMoneyModal open={sendModalOpen} onOpenChange={setSendModalOpen} />
      <RequestMoneyModal open={requestModalOpen} onOpenChange={setRequestModalOpen} />
      <TopUpModal open={topUpModalOpen} onOpenChange={setTopUpModalOpen} />
      <BillsModal open={billsModalOpen} onOpenChange={setBillsModalOpen} />
    </div>
  );
};

export default Dashboard;
