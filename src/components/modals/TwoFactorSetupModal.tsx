import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import * as OTPAuth from "otpauth";
import QRCode from "qrcode";

interface TwoFactorSetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const TwoFactorSetupModal = ({ open, onOpenChange, onSuccess }: TwoFactorSetupModalProps) => {
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      generateSecret();
    }
  }, [open]);

  const generateSecret = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) return;

      // Generate TOTP secret
      const totp = new OTPAuth.TOTP({
        issuer: "PayVance",
        label: user.email,
        algorithm: "SHA1",
        digits: 6,
        period: 30,
      });

      const newSecret = totp.secret.base32;
      setSecret(newSecret);

      // Generate QR code
      const otpauthURL = `otpauth://totp/PayVance:${user.email}?secret=${newSecret}&issuer=PayVance`;
      const qr = await QRCode.toDataURL(otpauthURL);
      setQrCode(qr);
    } catch (error) {
      console.error("Error generating secret:", error);
      toast.error("Failed to generate 2FA setup");
    }
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Verify the code
      const totp = new OTPAuth.TOTP({
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(secret),
      });

      const isValid = totp.validate({ token: verificationCode, window: 1 }) !== null;

      if (!isValid) {
        toast.error("Invalid verification code");
        setLoading(false);
        return;
      }

      // Save secret to profile
      const { error } = await supabase
        .from("profiles")
        .update({ 
          totp_secret: secret,
          totp_enabled: true 
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Two-factor authentication enabled!");
      onSuccess();
      onOpenChange(false);
      setVerificationCode("");
    } catch (error: any) {
      console.error("Error verifying code:", error);
      toast.error("Failed to enable 2FA");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Setup Two-Factor Authentication</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="text-sm text-muted-foreground">
            Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
          </div>
          
          {qrCode && (
            <div className="flex justify-center p-4 bg-white rounded-lg">
              <img src={qrCode} alt="QR Code" className="w-48 h-48" />
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium">Or enter this code manually:</p>
            <div className="p-3 bg-muted rounded-lg font-mono text-sm break-all">
              {secret}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Enter verification code</label>
            <Input
              type="text"
              placeholder="000000"
              maxLength={6}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
              className="text-center text-lg tracking-widest"
            />
          </div>

          <Button 
            onClick={handleVerify} 
            disabled={loading || verificationCode.length !== 6}
            className="w-full"
          >
            {loading ? "Verifying..." : "Verify & Enable"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
