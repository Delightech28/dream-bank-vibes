import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ChevronLeft, Moon, Globe, DollarSign, Download, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const navigate = useNavigate();

  return (
    <div className="pb-24 md:pb-8 min-h-screen">
      <div className="sticky top-0 bg-background/95 backdrop-blur z-10 border-b">
        <div className="flex items-center gap-3 px-4 h-16">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
      </div>

      <div className="px-4 pt-6 space-y-6">
        {/* Appearance */}
        <Card>
          <CardContent className="p-0">
            <div className="p-4 border-b">
              <h3 className="font-semibold mb-3">Appearance</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Moon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Dark Mode</p>
                    <p className="text-sm text-muted-foreground">Currently enabled</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardContent className="p-0">
            <div className="p-4 border-b">
              <h3 className="font-semibold mb-3">Preferences</h3>
            </div>
            
            <button className="w-full flex items-center justify-between p-4 border-b hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-secondary" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Language</p>
                  <p className="text-sm text-muted-foreground">English (US)</p>
                </div>
              </div>
            </button>

            <button className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-accent" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Currency</p>
                  <p className="text-sm text-muted-foreground">Nigerian Naira (₦)</p>
                </div>
              </div>
            </button>
          </CardContent>
        </Card>

        {/* Data & Storage */}
        <Card>
          <CardContent className="p-0">
            <div className="p-4 border-b">
              <h3 className="font-semibold mb-3">Data & Storage</h3>
            </div>
            
            <button className="w-full flex items-center justify-between p-4 border-b hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Download className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Download Data</p>
                  <p className="text-sm text-muted-foreground">Export your account data</p>
                </div>
              </div>
            </button>

            <button className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-destructive" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-destructive">Clear Cache</p>
                  <p className="text-sm text-muted-foreground">Free up storage space</p>
                </div>
              </div>
            </button>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">FunBank Version</p>
              <p className="text-2xl font-bold">2.5.0</p>
              <p className="text-xs text-muted-foreground">Last updated: January 2025</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
