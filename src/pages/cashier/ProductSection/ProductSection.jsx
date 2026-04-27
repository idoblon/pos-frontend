import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { getProductsByBranch } from "@/Redux Toolkit/Features/product/productThunk";
import { getInventoryByBranch } from "@/Redux Toolkit/Features/inventory/inventoryThunk";

export default function ProductSection({ onAddToCart }) {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const { products } = useSelector((state) => state.product);
  const { inventory } = useSelector((state) => state.inventory);
  const branchId = localStorage.getItem("branchId");

  useEffect(() => {
    if (branchId) {
      dispatch(getProductsByBranch({ branchId }));
      dispatch(getInventoryByBranch({ branchId }));
    }
  }, [dispatch, branchId]);

  const getStock = (productId) => {
    const item = inventory?.find((inv) => inv.productId === productId);
    return item?.quantity || 0;
  };

  const filteredProducts = products?.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[600px] overflow-y-auto">
        {filteredProducts?.map((product) => {
          const stock = getStock(product.id);
          const isOutOfStock = stock === 0;
          const isLowStock = stock > 0 && stock <= 10;

          return (
            <Card
              key={product.id}
              className={`cursor-pointer hover:shadow-lg transition-shadow ${
                isOutOfStock ? "opacity-50" : ""
              }`}
              onClick={() => !isOutOfStock && onAddToCart(product)}
            >
              <CardContent className="p-4">
                <h3 className="font-semibold truncate">{product.name}</h3>
                <p className="text-sm text-gray-500 truncate">{product.category}</p>
                <p className="text-lg font-bold mt-2">${product.price}</p>
                <p
                  className={`text-xs mt-1 ${
                    isOutOfStock
                      ? "text-red-500"
                      : isLowStock
                      ? "text-orange-500"
                      : "text-green-500"
                  }`}
                >
                  {isOutOfStock ? "Out of Stock" : `Stock: ${stock}`}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
