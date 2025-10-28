import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronRight, User, Bell, Shield, HelpCircle, Settings, LogOut, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Profile = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [userId, setUserId] = useState("");
  const [uploading, setUploading] = useState(false);
  
  const menuItems = [
    { icon: <User className="w-5 h-5" />, label: "Personal Information", badge: null, path: "/personal-info" },
    { icon: <Bell className="w-5 h-5" />, label: "Notifications", badge: "3", path: "/notifications" },
    { icon: <Shield className="w-5 h-5" />, label: "Security", badge: null, path: "/security" },
    { icon: <Settings className="w-5 h-5" />, label: "Settings", badge: null, path: "/settings" },
    { icon: <HelpCircle className="w-5 h-5" />, label: "Help & Support", badge: null, path: "/help-support" },
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/");
        return;
      }

      setUserId(user.id);
      setEmail(user.email || "");

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error);
        return;
      }

      if (profile) {
        setFullName(profile.full_name || "");
        if (profile.avatar_url) {
          // Check if it's a storage path or a data URL
          if (profile.avatar_url.startsWith('data:')) {
            setAvatarUrl(profile.avatar_url);
          } else {
            const { data } = supabase.storage
              .from('avatars')
              .getPublicUrl(profile.avatar_url);
            setAvatarUrl(data.publicUrl);
          }
        }
      }
    } catch (error) {
      console.error("Error in fetchProfile:", error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    setUploading(true);
    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${Date.now()}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: filePath })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      // Update local state
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      setAvatarUrl(data.publicUrl);

      toast.success("Profile picture updated!");
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

  return (
    <div className="pb-24 md:pb-8">
      <div className="px-4 pt-6">
        <h1 className="text-2xl font-bold mb-6">Profile</h1>

        {/* Profile Header */}
        <Card className="mb-6 shadow-glow border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20 border-4 border-primary/20">
                {uploading ? (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    <AvatarImage src={avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${fullName}`} />
                    <AvatarFallback>{fullName.split(' ').map(n => n[0]).join('').toUpperCase() || "U"}</AvatarFallback>
                  </>
                )}
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{fullName || "User"}</h2>
                <p className="text-sm text-muted-foreground">{email}</p>
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
                <p className="text-2xl font-bold">₦24.5K</p>
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
                onClick={() => navigate(item.path)}
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
        <Button variant="outline" className="w-full" size="lg" onClick={handleLogout}>
          <LogOut className="w-5 h-5 mr-2" />
          Log Out
        </Button>
      </div>
    </div>
  );
};

export default Profile;
