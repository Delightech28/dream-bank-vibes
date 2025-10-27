import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronRight, User, Bell, Shield, HelpCircle, Settings, LogOut } from "lucide-react";

const Profile = () => {
  const menuItems = [
    { icon: <User className="w-5 h-5" />, label: "Personal Information", badge: null },
    { icon: <Bell className="w-5 h-5" />, label: "Notifications", badge: "3" },
    { icon: <Shield className="w-5 h-5" />, label: "Security", badge: null },
    { icon: <Settings className="w-5 h-5" />, label: "Settings", badge: null },
    { icon: <HelpCircle className="w-5 h-5" />, label: "Help & Support", badge: null },
  ];

  return (
    <div className="pb-24 md:pb-8">
      <div className="px-4 pt-6">
        <h1 className="text-2xl font-bold mb-6">Profile</h1>

        {/* Profile Header */}
        <Card className="mb-6 shadow-glow border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20 border-4 border-primary/20">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-bold">John Doe</h2>
                <p className="text-sm text-muted-foreground">john.doe@example.com</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                    Premium Member
                  </span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">12</p>
                <p className="text-xs text-muted-foreground">Cards</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-secondary">348</p>
                <p className="text-xs text-muted-foreground">Transactions</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">$24.5K</p>
                <p className="text-xs text-muted-foreground">Balance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Menu Items */}
        <Card className="mb-6">
          <CardContent className="p-0">
            {menuItems.map((item, index) => (
              <button
                key={index}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors border-b last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {item.icon}
                  </div>
                  <span className="font-medium">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.badge && (
                    <span className="text-xs px-2 py-1 rounded-full bg-secondary text-white">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Button variant="outline" className="w-full" size="lg">
          <LogOut className="w-5 h-5 mr-2" />
          Log Out
        </Button>
      </div>
    </div>
  );
};

export default Profile;
