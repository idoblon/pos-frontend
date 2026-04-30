import { useSidebar } from "@/context/hook/useSidbar";
import POSHeader from "pos-frontend/src/pages/cashier/Header/POSHeader";

const POSHeader = () => {
  const{setSidebarOpen}=useSidebar();
  return (
    <div className="bg-card border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <Button onClick={()=> setSidebarOpen(true)}>
            <AlignJustify />
          </Button>
        </div>
        <div>
          <h1 className="text-2xl font-bold text"></h1>
          <p className="text-sm text-muted-foreground"></p>
        </div>
      </div>
    </div>
  );
};

export default POSHeader;
