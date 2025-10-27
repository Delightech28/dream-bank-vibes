import { Card, CardContent } from "@/components/ui/card";

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
}

export const QuickAction = ({ icon, label }: QuickActionProps) => {
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-all hover:scale-105">
      <CardContent className="p-4 flex flex-col items-center gap-2">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <span className="text-xs font-medium text-center">{label}</span>
      </CardContent>
    </Card>
  );
};
