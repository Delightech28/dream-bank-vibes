import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Bell, Mail, Smartphone, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Notifications = () => {
  const navigate = useNavigate();

  const notificationSettings = [
    {
      icon: Bell,
      title: "Push Notifications",
      description: "Receive push notifications on this device",
      enabled: true,
    },
    {
      icon: Mail,
      title: "Email Notifications",
      description: "Receive transaction alerts via email",
      enabled: true,
    },
    {
      icon: Smartphone,
      title: "SMS Alerts",
      description: "Get SMS for important transactions",
      enabled: false,
    },
    {
      icon: DollarSign,
      title: "Transaction Alerts",
      description: "Notify on every transaction",
      enabled: true,
    },
  ];

  return (
    <div className="pb-24 md:pb-8 min-h-screen">
      <div className="sticky top-0 bg-background/95 backdrop-blur z-10 border-b">
        <div className="flex items-center gap-3 px-4 h-16">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Notifications</h1>
        </div>
      </div>

      <div className="px-4 pt-6 space-y-4">
        <Card>
          <CardContent className="p-0">
            {notificationSettings.map((setting, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border-b last:border-b-0"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <setting.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{setting.title}</p>
                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                  </div>
                </div>
                <Switch defaultChecked={setting.enabled} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Recent Notifications</h3>
            <div className="space-y-4">
              {[
                { title: "Payment Received", message: "You received ₦5,200 from Salary", time: "2 hours ago" },
                { title: "Card Transaction", message: "₦15.99 debited from your card", time: "1 day ago" },
                { title: "Top Up Successful", message: "₦10,000 added to your wallet", time: "2 days ago" },
              ].map((notif, index) => (
                <div key={index} className="p-3 rounded-lg bg-muted/50">
                  <p className="font-medium text-sm">{notif.title}</p>
                  <p className="text-sm text-muted-foreground">{notif.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Notifications;
