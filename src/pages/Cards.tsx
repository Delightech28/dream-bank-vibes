import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, CreditCard, Lock, Eye, MoreVertical } from "lucide-react";

const Cards = () => {
  const cards = [
    {
      id: 1,
      name: "Premium Card",
      type: "Virtual",
      number: "•••• •••• •••• 4829",
      balance: 24580.50,
      validThru: "12/26",
      gradient: "gradient-primary",
    },
    {
      id: 2,
      name: "Shopping Card",
      type: "Physical",
      number: "•••• •••• •••• 7156",
      balance: 3240.00,
      validThru: "08/27",
      gradient: "bg-gradient-to-br from-purple-500 to-pink-500",
    },
  ];

  return (
    <div className="pb-24 md:pb-8">
      <div className="px-4 pt-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Cards</h1>
          <Button variant="gradient" size="icon">
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        {/* Cards Display */}
        <div className="space-y-4 mb-6">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`relative h-52 ${card.gradient} rounded-2xl shadow-glow p-6 text-white overflow-hidden`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full -ml-20 -mb-20" />
              
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm opacity-80 mb-1">{card.type}</p>
                    <p className="text-xl font-bold">{card.name}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </div>
                
                <div>
                  <p className="text-xs opacity-80 mb-1">Balance</p>
                  <p className="text-3xl font-bold mb-4">₦{card.balance.toLocaleString()}</p>
                  
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex-1">
                      <p className="text-xs opacity-80 mb-1">Card Number</p>
                      <p className="text-sm tracking-wider">{card.number}</p>
                    </div>
                    <div>
                      <p className="text-xs opacity-80 mb-1">Valid Thru</p>
                      <p className="text-sm">{card.validThru}</p>
                    </div>
                  </div>
                  
                  <CreditCard className="w-10 h-10 opacity-60" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Card Actions */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <p className="text-xs font-medium">Freeze Card</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-2">
                <Eye className="w-5 h-5 text-secondary" />
              </div>
              <p className="text-xs font-medium">Show CVV</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-2">
                <CreditCard className="w-5 h-5 text-accent" />
              </div>
              <p className="text-xs font-medium">Card Details</p>
            </CardContent>
          </Card>
        </div>

        {/* Card Limits */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4">Card Limits</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Daily Spending</span>
                  <span className="font-medium">₦2,450 / ₦5,000</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[49%] rounded-full" />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">ATM Withdrawals</span>
                  <span className="font-medium">₦300 / ₦1,000</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-secondary w-[30%] rounded-full" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Cards;
