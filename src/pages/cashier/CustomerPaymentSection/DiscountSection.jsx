import React from "react";
import { Tag } from "lucide-react";
import { Input } from "@/components/ui/input";

const DiscountSection = ({ discount, discountType, onDiscountChange, onDiscountTypeChange }) => {
  return (
    <div className="rs">
      <div className="rs-title">
        <Tag size={13} />
        Discount
      </div>
      <div className="disc-row">
        <Input
          type="number"
          className="disc-input"
          value={discount}
          min={0}
          onChange={(e) => onDiscountChange(e.target.value)}
          placeholder="0"
        />
        <div className="disc-tabs">
          <button
            className={`disc-tab ${discountType === "%" ? "active" : ""}`}
            onClick={() => onDiscountTypeChange("%")}
          >
            %
          </button>
          <button
            className={`disc-tab ${discountType === "$" ? "active" : ""}`}
            onClick={() => onDiscountTypeChange("$")}
          >
            रु
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiscountSection;
