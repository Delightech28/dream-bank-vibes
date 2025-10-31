import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ChevronLeft, Lock, Fingerprint, Smartphone, Key, Shield, Monitor } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ChangePinModal } from "@/components/modals/ChangePinModal";
import { ChangePasswordModal } from "@/components/modals/ChangePasswordModal";
import { TwoFactorSetupModal } from "@/components/modals/TwoFactorSetupModal";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Security = () => {
  const navigate = useNavigate();
  const [showChangePinModal, setShowChangePinModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [securityScore, setSecurityScore] = useState(0);

  useEffect(() => {
    // Load biometric preference from localStorage
    const biometric = localStorage.getItem('biometricEnabled');
    setBiometricEnabled(biometric === 'true');
    
    fetchTwoFactorStatus();
    fetchSessions();
    calculateSecurityScore();
    trackCurrentSession();
  }, []);

  useEffect(() => {
    calculateSecurityScore();
  }, [biometricEnabled, twoFactorEnabled]);

  const fetchTwoFactorStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("totp_enabled")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        setTwoFactorEnabled(profile.totp_enabled || false);
      }
    } catch (error) {
      console.error("Error fetching 2FA status:", error);
    }
  };

  const getDeviceInfo = (userAgent: string): string => {
    // Check for mobile devices first
    if (/iPhone/.test(userAgent)) {
      const match = userAgent.match(/iPhone OS (\d+)_(\d+)/);
      return match ? `iPhone (iOS ${match[1]})` : 'iPhone';
    }
    if (/iPad/.test(userAgent)) {
      return 'iPad';
    }
    if (/Android/.test(userAgent)) {
      const match = userAgent.match(/Android (\d+)/);
      const device = userAgent.match(/;\s*([^;)]+)\s+Build/);
      if (device && device[1]) {
        return `${device[1]} (Android ${match ? match[1] : ''})`;
      }
      return match ? `Android ${match[1]}` : 'Android Device';
    }
    
    // Desktop browsers
    if (/Windows/.test(userAgent)) {
      if (/Edg/.test(userAgent)) return 'Edge on Windows';
      if (/Chrome/.test(userAgent)) return 'Chrome on Windows';
      if (/Firefox/.test(userAgent)) return 'Firefox on Windows';
      return 'Windows PC';
    }
    if (/Macintosh/.test(userAgent)) {
      if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) return 'Safari on Mac';
      if (/Chrome/.test(userAgent)) return 'Chrome on Mac';
      if (/Firefox/.test(userAgent)) return 'Firefox on Mac';
      return 'Mac';
    }
    if (/Linux/.test(userAgent)) {
      if (/Chrome/.test(userAgent)) return 'Chrome on Linux';
      if (/Firefox/.test(userAgent)) return 'Firefox on Linux';
      return 'Linux PC';
    }
    
    return 'Unknown Device';
  };

  const fetchSessions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userSessions } = await supabase
        .from("user_sessions")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("last_active", { ascending: false });

      if (userSessions) {
        const { data: { session } } = await supabase.auth.getSession();
        const currentSessionId = sessionStorage.getItem('session_id');
        
        // Remove duplicate sessions with same user_agent
        const uniqueSessions = userSessions.reduce((acc: any[], curr) => {
          const exists = acc.find(s => s.user_agent === curr.user_agent);
          if (!exists) {
            acc.push(curr);
          }
          return acc;
        }, []);
        
        const formattedSessions = uniqueSessions.map((s) => ({
          id: s.id,
          device: getDeviceInfo(s.user_agent),
          location: s.location || "Current Location",
          lastActive: formatLastActive(s.last_active),
          current: s.id === currentSessionId,
        }));
        setSessions(formattedSessions);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };

  const trackCurrentSession = async () => {
    try {
      // Check if we already tracked this session
      const existingSessionId = sessionStorage.getItem('session_id');
      if (existingSessionId) {
        // Update last_active for existing session
        await supabase
          .from("user_sessions")
          .update({ last_active: new Date().toISOString() })
          .eq("id", existingSessionId);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const userAgent = navigator.userAgent;
      const deviceInfo = getDeviceInfo(userAgent);

      const { data, error } = await supabase
        .from("user_sessions")
        .insert({
          user_id: user.id,
          device_info: deviceInfo,
          user_agent: userAgent,
          location: "Current Location",
          is_active: true,
        })
        .select()
        .single();

      if (!error && data) {
        sessionStorage.setItem('session_id', data.id);
      }
    } catch (error) {
      console.error("Error tracking session:", error);
    }
  };

  const formatLastActive = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const calculateSecurityScore = () => {
    let score = 40; // Base score
    if (biometricEnabled) score += 30;
    if (twoFactorEnabled) score += 30;
    setSecurityScore(score);
  };

  const handleBiometricToggle = async (enabled: boolean) => {
    if (enabled) {
      // Check if HTTPS or localhost
      const isSecureContext = window.isSecureContext;
      if (!isSecureContext) {
        toast.error("Biometric authentication requires HTTPS");
        return;
      }

      // Check if WebAuthn is supported
      if (!window.PublicKeyCredential) {
        toast.error("Biometric authentication is not supported on this device");
        return;
      }

      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email) {
          toast.error("Please sign in to enable biometric authentication");
          return;
        }

        // Create registration options
        const challenge = new Uint8Array(32);
        crypto.getRandomValues(challenge);
        
        const userId = new Uint8Array(16);
        crypto.getRandomValues(userId);

        const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
          challenge,
          rp: {
            name: "PayVance",
            id: window.location.hostname,
          },
          user: {
            id: userId,
            name: user.email,
            displayName: user.email,
          },
          pubKeyCredParams: [
            { alg: -7, type: "public-key" },
            { alg: -257, type: "public-key" }
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "preferred",
          },
          timeout: 60000,
          attestation: "none",
        };

        // Create credential
        const credential = await navigator.credentials.create({
          publicKey: publicKeyCredentialCreationOptions,
        }) as PublicKeyCredential;

        if (credential) {
          // Store credential ID
          const credentialId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
          localStorage.setItem(`biometric_${user.email}`, credentialId);
          localStorage.setItem('biometricEnabled', 'true');
          setBiometricEnabled(true);
          toast.success("Biometric authentication enabled successfully!");
        }
      } catch (error: any) {
        console.error("Biometric setup error:", error);
        let errorMessage = "Failed to setup biometric authentication";
        
        if (error.name === "NotAllowedError") {
          errorMessage = "Biometric authentication was cancelled or not allowed";
        } else if (error.name === "NotSupportedError") {
          errorMessage = "This device doesn't support biometric authentication";
        } else if (error.name === "InvalidStateError") {
          errorMessage = "Biometric credentials already exist for this device";
        }
        
        toast.error(errorMessage);
        setBiometricEnabled(false);
        localStorage.setItem('biometricEnabled', 'false');
      }
    } else {
      setBiometricEnabled(false);
      localStorage.setItem('biometricEnabled', 'false');
      toast.success("Biometric authentication disabled");
    }
  };

  const handleTwoFactorToggle = async (enabled: boolean) => {
    if (enabled) {
      setShowTwoFactorModal(true);
    } else {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
          .from("profiles")
          .update({ totp_enabled: false, totp_secret: null })
          .eq("user_id", user.id);

        if (error) throw error;

        setTwoFactorEnabled(false);
        toast.success("Two-factor authentication disabled");
      } catch (error) {
        toast.error("Failed to disable 2FA");
      }
    }
  };

  const handleTwoFactorSuccess = () => {
    setTwoFactorEnabled(true);
    fetchSessions();
  };

  const handleEndSession = async (sessionId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Mark session as inactive
      const { error } = await supabase
        .from("user_sessions")
        .update({ is_active: false })
        .eq("id", sessionId);

      if (error) throw error;

      toast.success("Session ended successfully");
      fetchSessions();
    } catch (error: any) {
      toast.error("Failed to end session");
    }
  };

  return (
    <div className="pb-24 md:pb-8 min-h-screen">
      <div className="sticky top-0 bg-background/95 backdrop-blur z-10 border-b">
        <div className="flex items-center gap-3 px-4 h-16">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Security</h1>
        </div>
      </div>

      <div className="px-4 pt-6 space-y-6">
        {/* Security Options */}
        <Card>
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Fingerprint className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Biometric Login</p>
                  <p className="text-sm text-muted-foreground">Use fingerprint or face ID</p>
                </div>
              </div>
              <Switch checked={biometricEnabled} onCheckedChange={handleBiometricToggle} />
            </div>

            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Extra security layer</p>
                </div>
              </div>
              <Switch checked={twoFactorEnabled} onCheckedChange={handleTwoFactorToggle} />
            </div>

            <button 
              onClick={() => setShowChangePinModal(true)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-accent" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Change PIN</p>
                  <p className="text-sm text-muted-foreground">Update your transaction PIN</p>
                </div>
              </div>
            </button>

            <button 
              onClick={() => setShowChangePasswordModal(true)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Key className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Change Password</p>
                  <p className="text-sm text-muted-foreground">Update your login password</p>
                </div>
              </div>
            </button>
          </CardContent>
        </Card>

        {/* Security Status */}
        <Card className="shadow-glow border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Account Security</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Your account is well protected with multiple security layers
                </p>
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-300" 
                      style={{ width: `${securityScore}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-primary">{securityScore}%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {securityScore < 50 && "Enable more security features to improve your score"}
                  {securityScore >= 50 && securityScore < 80 && "Good security! Consider enabling all features"}
                  {securityScore >= 80 && "Excellent! Your account is well protected"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Sessions */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Active Sessions</h3>
            {sessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active sessions</p>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div key={session.id} className="p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4 text-muted-foreground" />
                        <p className="font-medium text-sm">{session.device}</p>
                      </div>
                      {session.current ? (
                        <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">Current</span>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 text-xs"
                          onClick={() => handleEndSession(session.id)}
                        >
                          End
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{session.location} • {session.lastActive}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ChangePinModal open={showChangePinModal} onOpenChange={setShowChangePinModal} />
      <ChangePasswordModal open={showChangePasswordModal} onOpenChange={setShowChangePasswordModal} />
      <TwoFactorSetupModal 
        open={showTwoFactorModal} 
        onOpenChange={setShowTwoFactorModal}
        onSuccess={handleTwoFactorSuccess}
      />
    </div>
  );
};

export default Security;
