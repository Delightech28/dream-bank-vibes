import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Zap, Wifi, Smartphone, Tv, Droplet, Receipt } from "lucide-react";

interface BillsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BillsModal = ({ open, onOpenChange }: BillsModalProps) => {
  const billCategories = [
    { id: "airtime", label: "Airtime", icon: Smartphone, color: "text-green-500" },
    { id: "data", label: "Data", icon: Wifi, color: "text-blue-500" },
    { id: "electricity", label: "Electricity", icon: Zap, color: "text-yellow-500" },
    { id: "cable", label: "Cable TV", icon: Tv, color: "text-purple-500" },
    { id: "water", label: "Water", icon: Droplet, color: "text-cyan-500" },
    { id: "other", label: "Other Bills", icon: Receipt, color: "text-gray-500" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Pay Bills</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-3 gap-4 py-4">
          {billCategories.map((category) => (
            <button
              key={category.id}
              className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-muted transition-all hover:scale-105"
            >
              <div className={`w-14 h-14 rounded-full bg-muted flex items-center justify-center ${category.color}`}>
                <category.icon className="w-7 h-7" />
              </div>
              <span className="text-sm font-medium text-center">{category.label}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
