import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PaystackPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: string;
  email: string;
  onSuccess: () => void;
}

export const PaystackPaymentModal = ({ 
  open, 
  onOpenChange, 
  amount, 
  email,
  onSuccess 
}: PaystackPaymentModalProps) => {
  
  useEffect(() => {
    if (!open || !amount) return;

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      initializePayment();
    };

    return () => {
      document.body.removeChild(script);
    };
  }, [open, amount]);

  const initializePayment = () => {
    const handler = (window as any).PaystackPop.setup({
      key: 'pk_test_xxxxxxxxxxxxx', // Replace with your Paystack public key
      email: email,
      amount: parseFloat(amount) * 100, // Convert to kobo
      currency: 'NGN',
      ref: 'DEL_' + Math.floor((Math.random() * 1000000000) + 1),
      callback: async (response: any) => {
        toast.loading('Processing payment...');
        
        try {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) {
            toast.error('User not authenticated');
            return;
          }

          // Update wallet balance
          const { data: wallet } = await supabase
            .from('wallets')
            .select('id, balance')
            .eq('user_id', user.id)
            .single();

          if (!wallet) {
            toast.error('Wallet not found');
            return;
          }

          const newBalance = wallet.balance + parseFloat(amount);

          await supabase
            .from('wallets')
            .update({ balance: newBalance })
            .eq('user_id', user.id);

          // Create transaction record
          const { data: { user: currentUser } } = await supabase.auth.getUser();
          
          await supabase
            .from('transactions')
            .insert({
              user_id: currentUser!.id,
              wallet_id: wallet.id,
              type: 'credit',
              amount: parseFloat(amount),
              status: 'completed',
              description: 'Wallet top-up via card',
              reference: response.reference,
              metadata: { payment_gateway: 'paystack' }
            } as any);

          toast.dismiss();
          toast.success(`₦${amount} added to wallet successfully! 💳`);
          onSuccess();
          onOpenChange(false);
        } catch (error) {
          console.error('Error updating wallet:', error);
          toast.dismiss();
          toast.error('Payment successful but failed to update wallet');
        }
      },
      onClose: () => {
        toast.error('Payment cancelled');
        onOpenChange(false);
      }
    });

    handler.openIframe();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Processing Payment</DialogTitle>
        </DialogHeader>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Initializing secure payment...</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
