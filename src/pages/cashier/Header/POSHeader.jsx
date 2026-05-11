import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

const POSHeader = ({ title, subtitle, onMenuClick }) => {
  return (
    <div className="bg-card border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>
        <div className="text-center">
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="w-9" />
      </div>
    </div>
  );
};

export default POSHeader;
