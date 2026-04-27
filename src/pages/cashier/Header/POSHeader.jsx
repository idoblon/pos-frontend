import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function POSHeader({ onLogout }) {
  const { userProfile } = useSelector((state) => state.user);

  return (
    <div className="bg-white border-b px-6 py-4 flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold">POS System</h1>
        <p className="text-sm text-gray-500">
          Cashier: {userProfile?.firstName} {userProfile?.lastName}
        </p>
      </div>
      <Button variant="outline" onClick={onLogout}>
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </div>
  );
}
