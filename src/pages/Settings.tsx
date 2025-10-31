import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ChevronLeft, Moon, Globe, DollarSign, Download, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Settings = () => {
  const navigate = useNavigate();
  const [currency, setCurrency] = useState<"NGN" | "USD">("NGN");
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const savedCurrency = localStorage.getItem("preferredCurrency") as "NGN" | "USD" | null;
    if (savedCurrency) setCurrency(savedCurrency);

    // Apply theme from localStorage immediately (synchronously)
    const localTheme = localStorage.getItem("theme") || "dark";
    setDarkMode(localTheme === "dark");
    
    // Then sync with database (asynchronously)
    loadThemeFromDB();
  }, []);

  const loadThemeFromDB = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("theme")
        .eq("user_id", user.id)
        .single();

      if (profile?.theme) {
        const dbTheme = profile.theme;
        const localTheme = localStorage.getItem("theme");
        
        // Only update if DB theme is different from local
        if (dbTheme !== localTheme) {
          setDarkMode(dbTheme === "dark");
          
          if (dbTheme === "dark") {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
          localStorage.setItem("theme", dbTheme);
        }
      }
    } catch (error) {
      console.error("Error loading theme:", error);
    }
  };

  const handleDarkModeToggle = async () => {
    const newMode = !darkMode;
    const newTheme = newMode ? "dark" : "light";
    
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", newTheme);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({ theme: newTheme })
          .eq("user_id", user.id);
      }
    } catch (error) {
      console.error("Error saving theme:", error);
    }

    toast.success(`${newMode ? "Dark" : "Light"} mode enabled`);
  };

  const handleCurrencyChange = () => {
    const newCurrency = currency === "NGN" ? "USD" : "NGN";
    setCurrency(newCurrency);
    localStorage.setItem("preferredCurrency", newCurrency);
    window.dispatchEvent(new Event("storage"));
    toast.success(`Currency changed to ${newCurrency === "NGN" ? "Nigerian Naira (₦)" : "US Dollar ($)"}`);
  };

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
                    <p className="text-sm text-muted-foreground">Currently {darkMode ? "enabled" : "disabled"}</p>
                  </div>
                </div>
                <Switch checked={darkMode} onCheckedChange={handleDarkModeToggle} />
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

            <button 
              onClick={handleCurrencyChange}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-accent" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Currency</p>
                  <p className="text-sm text-muted-foreground">
                    {currency === "NGN" ? "Nigerian Naira (₦)" : "US Dollar ($)"}
                  </p>
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
              <p className="text-sm text-muted-foreground">PayVance Version</p>
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
