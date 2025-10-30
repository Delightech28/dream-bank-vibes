import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ChevronLeft, Lock, Fingerprint, Smartphone, Key, Shield, Monitor } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ChangePinModal } from "@/components/modals/ChangePinModal";
import { ChangePasswordModal } from "@/components/modals/ChangePasswordModal";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Security = () => {
  const navigate = useNavigate();
  const [showChangePinModal, setShowChangePinModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [securityScore, setSecurityScore] = useState(0);

  useEffect(() => {
    fetchSessions();
    calculateSecurityScore();
  }, [biometricEnabled, twoFactorEnabled]);

  const fetchSessions = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      // Current session data
      setSessions([{
        id: session.access_token,
        device: navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop Browser',
        location: 'Current Location',
        lastActive: 'Just now',
        current: true
      }]);
    }
  };

  const calculateSecurityScore = () => {
    let score = 40; // Base score
    if (biometricEnabled) score += 30;
    if (twoFactorEnabled) score += 30;
    setSecurityScore(score);
  };

  const handleEndSession = async (sessionId: string) => {
    try {
      await supabase.auth.signOut();
      toast.success("Session ended successfully");
      navigate("/auth");
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
              <Switch checked={biometricEnabled} onCheckedChange={setBiometricEnabled} />
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
              <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
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
    </div>
  );
};

export default Security;
