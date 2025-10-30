import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, CalendarIcon, Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const PersonalInfo = () => {
  const navigate = useNavigate();
  const [dateOfBirth, setDateOfBirth] = useState<Date>();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [bvn, setBvn] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [virtualAccountNumber, setVirtualAccountNumber] = useState("");
  const [virtualAccountBank, setVirtualAccountBank] = useState("");
  const [virtualAccountName, setVirtualAccountName] = useState("");
  const [creatingVirtualAccount, setCreatingVirtualAccount] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string>("");

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
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (profile) {
        setFullName(profile.full_name || "");
        setPhoneNumber(profile.phone_number || "");
        setAddress(profile.address || "");
        setBvn(profile.bvn || "");
        setAccountNumber(profile.account_number || "");
        setVirtualAccountNumber(profile.virtual_account_number || "");
        setVirtualAccountBank(profile.virtual_account_bank || "");
        setVirtualAccountName(profile.virtual_account_name || "");
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
        if (profile.date_of_birth) {
          setDateOfBirth(new Date(profile.date_of_birth));
        }
      }
    } catch (error: any) {
      toast.error("Failed to load profile");
      console.error(error);
    }
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          phone_number: phoneNumber,
          date_of_birth: dateOfBirth?.toISOString().split('T')[0],
          address: address,
          bvn: bvn,
          avatar_url: avatarUrl,
        })
        .eq("user_id", userId);

      if (error) throw error;
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error("Failed to update profile");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVirtualAccount = async () => {
    setCreatingVirtualAccount(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-virtual-account');

      if (error) throw error;

      if (data.success) {
        toast.success('Virtual account created successfully!');
        setVirtualAccountNumber(data.account.account_number);
        setVirtualAccountBank(data.account.bank_name);
        setVirtualAccountName(data.account.account_name);
      } else {
        toast.error(data.error || 'Failed to create virtual account');
      }
    } catch (error: any) {
      console.error('Error creating virtual account:', error);
      toast.error('Failed to create virtual account');
    } finally {
      setCreatingVirtualAccount(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setLoading(true);
    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${Date.now()}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(data.publicUrl);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: filePath })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      toast.success("Profile picture updated!");
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-24 md:pb-8 min-h-screen">
      <div className="sticky top-0 bg-background/95 backdrop-blur z-10 border-b">
        <div className="flex items-center gap-3 px-4 h-16">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Personal Information</h1>
        </div>
      </div>

      <div className="px-4 pt-6 space-y-6">
        {/* Profile Picture */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Avatar className="w-24 h-24 border-4 border-primary/20">
              {loading ? (
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
            <input
              type="file"
              id="profile-picture"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={loading}
            />
            <label
              htmlFor="profile-picture"
              className={`absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-primary/90'}`}
            >
              <Camera className="w-4 h-4" />
            </label>
          </div>
        </div>

        {/* Form Fields */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullname">Full Name</Label>
              <Input 
                id="fullname" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                value={email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="account-number">Internal Account Number</Label>
              <div className="relative">
                <Input 
                  id="account-number" 
                  value={accountNumber}
                  disabled
                  className="bg-muted font-mono text-lg tracking-wider"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs"
                  onClick={() => {
                    navigator.clipboard.writeText(accountNumber);
                    toast.success("Account number copied!");
                  }}
                >
                  Copy
                </Button>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>🏦</span>
                <span>PayVance - Internal Use Only</span>
              </div>
            </div>

            {/* Virtual Account Section */}
            <div className="space-y-3 p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Bank Transfer Account</Label>
                {!virtualAccountNumber && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCreateVirtualAccount}
                    disabled={creatingVirtualAccount}
                  >
                    {creatingVirtualAccount ? "Creating..." : "Generate"}
                  </Button>
                )}
              </div>
              
              {virtualAccountNumber ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="virtual-account" className="text-xs text-muted-foreground">Account Number</Label>
                    <div className="relative">
                      <Input 
                        id="virtual-account" 
                        value={virtualAccountNumber}
                        disabled
                        className="bg-background font-mono text-xl font-bold tracking-wider"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs"
                        onClick={() => {
                          navigator.clipboard.writeText(virtualAccountNumber);
                          toast.success("Account number copied!");
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Bank Name</Label>
                    <p className="font-semibold">{virtualAccountBank}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Account Name</Label>
                    <p className="font-semibold">{virtualAccountName}</p>
                  </div>

                  <div className="mt-3 p-3 bg-blue-500/10 rounded-md">
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      💡 Transfer money from any Nigerian bank to this account number and it will automatically be credited to your PayVance wallet!
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    Generate your dedicated bank account number to receive payments from any Nigerian bank
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <span>🏦</span>
                    <span>Works with all Nigerian banks</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <span className="text-xl">🇳🇬</span>
                  <span className="text-sm text-muted-foreground">+234</span>
                </div>
                <Input 
                  id="phone" 
                  type="tel" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pl-20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="dob"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-11",
                      !dateOfBirth && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateOfBirth ? format(dateOfBirth, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateOfBirth}
                    onSelect={setDateOfBirth}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                    captionLayout="dropdown-buttons"
                    fromYear={1900}
                    toYear={new Date().getFullYear()}
                    className="pointer-events-auto rounded-lg"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input 
                id="address" 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bvn">BVN</Label>
              <Input 
                id="bvn" 
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={bvn}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setBvn(value);
                }}
                maxLength={11}
              />
            </div>
          </CardContent>
        </Card>

        <Button 
          className="w-full" 
          variant="gradient" 
          size="lg"
          onClick={handleSaveChanges}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

export default PersonalInfo;
