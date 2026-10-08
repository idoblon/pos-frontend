import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Search, Package, Pencil, Trash2, Upload, X } from "lucide-react";
import {
  getProductsByStore,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/Redux Toolkit/Features/product/productThunk";
import { addInventoryItem } from "@/Redux Toolkit/Features/inventory/inventoryThunk";
import { getCategoriesByStore } from "@/Redux Toolkit/Features/category/categoryThunk";
import { getUserProfile } from "@/Redux Toolkit/Features/user/userThunk";
import { getStoreByAdmin, getStoreById } from "@/Redux Toolkit/Features/Store/storeThunk";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import secureStorage from "@/util/secureStorage";
import ExpiryAlerts from "@/components/ExpiryAlerts";
import {
  PRODUCT_UNITS,
  resolveStoreType,
  supportsFeature,
} from "@/util/storeTypes";

const EMPTY_FORM = {
  name: "",
  sku: "",
  sellingPrice: "",
  mrp: "",
  categoryId: "",
  description: "",
  image: "",
  initialStock: "",
  // Vertical-specific (all optional — backend ignores unknown fields safely)
  expiryDate: "",
  batchNumber: "",
  prescriptionRequired: false,
  isControlled: false,
  dosage: "",
  unit: "pcs",
  weight: "",
  weightStep: "",
  moq: "",
  requiresSerial: false,
  warrantyMonths: "",
  sizeVariant: "",
  colorVariant: "",
  variantsJson: "",
  bulkMinQty: "",
  bulkPrice: "",
  bulkTiersJson: "",
  preparationTime: "",
  kitchenStation: "",
  modifiers: "",
  isVeg: false,
  careInstructions: "",
  guaranteeDays: "",
};

const s = {
  page: {
    padding: 24,
    display: "flex",
    flexDirection: "column",
    gap: 20,
    fontFamily: "'DM Sans','Inter',sans-serif",
    color: "#1a1d23",
    background: "#f5f5f5",
    minHeight: "100%",
  },
  card: { background: "white", border: "1px solid #e5e7eb", borderRadius: 10 },
  cardHeader: {
    padding: "14px 18px",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  searchInput: {
    width: "100%",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: "7px 12px 7px 34px",
    fontFamily: "inherit",
    fontSize: 13,
    color: "#1a1d23",
    background: "#f5f5f5",
    outline: "none",
    boxSizing: "border-box",
  },
  addBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 14px",
    background: "linear-gradient(135deg,#1a1d23,#4a4d55)",
    color: "white",
    border: "none",
    borderRadius: 8,
    fontFamily: "inherit",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  th: {
    padding: "10px 16px",
    fontSize: 12,
    fontWeight: 600,
    color: "#6b7280",
    background: "#f5f5f5",
    textAlign: "left",
    borderBottom: "1px solid #e5e7eb",
  },
  td: {
    padding: "12px 16px",
    fontSize: 13,
    borderBottom: "1px solid #e5e7eb",
    color: "#1a1d23",
  },
  iconBtn: {
    border: "1px solid #e5e7eb",
    background: "white",
    borderRadius: 6,
    padding: "4px 6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },
  empty: {
    textAlign: "center",
    padding: "40px 0",
    color: "#6b7280",
    fontSize: 13,
  },
};

export default function ProductManagement() {
  const dispatch = useDispatch();
  const { user } = useSelector((st) => st.auth);
  const { userProfile } = useSelector((st) => st.user);
  const userData = secureStorage.getUserData();

  const storeId =
    user?.storeId ||
    userData?.storeId ||
    userProfile?.storeId ||
    localStorage.getItem("storeId");

  const { products, loading } = useSelector((st) => st.product);
  const { categories } = useSelector((st) => st.category);
  const { store } = useSelector((st) => st.store);
  const storeType = resolveStoreType(
    store,
    userProfile?.storeType || user?.storeType || userData?.storeType || "",
  );
  const showExpiry = supportsFeature(storeType, "expiry");
  const showBatch = supportsFeature(storeType, "batch");
  const showPrescription = supportsFeature(storeType, "prescription");
  const showDosage = supportsFeature(storeType, "dosage");
  const showControlled = supportsFeature(storeType, "controlled");
  const showUnit = supportsFeature(storeType, "unit");
  const showWeight = supportsFeature(storeType, "weight");
  const showMoq = supportsFeature(storeType, "moq");
  const showSerial = supportsFeature(storeType, "serial");
  const showWarranty = supportsFeature(storeType, "warranty");
  const showVariants = supportsFeature(storeType, "variants");
  const showBulk = supportsFeature(storeType, "bulk");
  const showRestaurant = supportsFeature(storeType, "orderType") || supportsFeature(storeType, "prepTime");
  const showModifiers = supportsFeature(storeType, "modifiers");
  const showCare = supportsFeature(storeType, "care");
  const showGuarantee = supportsFeature(storeType, "guarantee");
  const showWastage = supportsFeature(storeType, "wastage");
  const showVerticalSection =
    showExpiry || showBatch || showPrescription || showDosage || showControlled || showUnit || showWeight ||
    showMoq || showSerial || showWarranty || showVariants || showBulk || showRestaurant || showModifiers ||
    showCare || showGuarantee;

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    // Admin endpoint first; direct store fetch as backup — both fill s.store.
    dispatch(getStoreByAdmin())
      .unwrap?.()
      .catch(() => {
        if (storeId) dispatch(getStoreById(storeId)).catch(() => undefined);
      });
  }, [dispatch, storeId]);

  useEffect(() => {
    if (!storeId) {
      toast.error("Store ID not found. Fetching user profile...");
      dispatch(getUserProfile()).then((result) => {
        if (result.payload?.storeId) {
          dispatch(getProductsByStore(result.payload.storeId));
          dispatch(getCategoriesByStore({ storeId: result.payload.storeId }));
        }
      });
      return;
    }
    dispatch(getProductsByStore(storeId));
    dispatch(getCategoriesByStore({ storeId }));
  }, [dispatch, storeId]);

  const productList = products?.content || products || [];
  const filtered = productList.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase()),
  );

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview(null);
    setDialogOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    const stringify = (v) => (Array.isArray(v) ? JSON.stringify(v, null, 1) : typeof v === "string" ? v : "");
    setForm({
      name: p.name ?? "",
      sku: p.sku ?? "",
      sellingPrice: p.sellingPrice ?? "",
      mrp: p.mrp ?? "",
      categoryId: p.categoryId ?? "",
      description: p.description || p.desciption || "",
      image: p.image || p.imageUrl || "",
      initialStock: "",
      expiryDate: (p.expiryDate || p.expiry || "").slice?.(0, 10) || "",
      batchNumber: p.batchNumber || p.batch || "",
      prescriptionRequired: p.prescriptionRequired ?? p.requiresPrescription ?? false,
      isControlled: p.isControlled ?? p.controlledSubstance ?? false,
      dosage: p.dosage || "",
      unit: p.unit || "pcs",
      weight: p.weight ?? "",
      weightStep: p.weightStep ?? "",
      moq: p.moq ?? p.minOrderQty ?? "",
      requiresSerial: p.requiresSerial ?? p.serialRequired ?? false,
      warrantyMonths: p.warrantyMonths ?? p.warranty ?? "",
      sizeVariant: p.sizeVariant || p.size || "",
      colorVariant: p.colorVariant || p.color || "",
      variantsJson: stringify(p.variants),
      bulkMinQty: p.bulkMinQty ?? "",
      bulkPrice: p.bulkPrice ?? "",
      bulkTiersJson: stringify(p.bulkTiers),
      preparationTime: p.preparationTime ?? "",
      kitchenStation: p.kitchenStation || "",
      modifiers: Array.isArray(p.modifiers) ? p.modifiers.join(", ") : p.modifiers || p.modifierOptions || "",
      isVeg: p.isVeg ?? false,
      careInstructions: p.careInstructions || "",
      guaranteeDays: p.guaranteeDays ?? "",
    });
    setImageFile(null);
    setImagePreview(p.image || p.imageUrl || null);
    setDialogOpen(true);
  };
  const openDelete = (p) => {
    setSelected(p);
    setDeleteDialogOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.7);
          setImagePreview(compressedDataUrl);
          setImageFile(compressedDataUrl);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setForm((f) => ({ ...f, image: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!storeId) {
      toast.error("Store ID not found. Please log in again.");
      return;
    }

    // Validate selling price and MRP
    const sellingPrice = Number(form.sellingPrice);
    const mrp = Number(form.mrp);

    if (!form.sellingPrice || sellingPrice <= 0) {
      toast.error("Please enter a valid selling price");
      return;
    }

    if (!form.mrp || mrp <= 0) {
      toast.error("Please enter a valid MRP");
      return;
    }


    const parseJsonArray = (raw, label) => {
      if (!raw || !String(raw).trim()) return null;
      try {
        const v = JSON.parse(String(raw));
        if (!Array.isArray(v)) {
          toast.error(`${label} must be a JSON array`);
          return "invalid";
        }
        return v;
      } catch {
        toast.error(`${label} is not valid JSON`);
        return "invalid";
      }
    };
    const bulkTiers = parseJsonArray(form.bulkTiersJson, "Bulk tiers");
    if (bulkTiers === "invalid") return;
    const variants = parseJsonArray(form.variantsJson, "Variants");
    if (variants === "invalid") return;

    const dto = {
      ...form,
      sellingPrice: sellingPrice,
      mrp: mrp,
      categoryId: form.categoryId ? parseInt(form.categoryId) : null,
      storeId: parseInt(storeId),
      store: { id: parseInt(storeId) },
      // Normalize optional vertical fields: empty string -> null so backend ignores them
      expiryDate: form.expiryDate || null,
      batchNumber: form.batchNumber?.trim() || null,
      dosage: form.dosage?.trim() || null,
      unit: form.unit || null,
      weight: form.weight === "" ? null : Number(form.weight),
      weightStep: form.weightStep === "" ? null : Number(form.weightStep),
      moq: form.moq === "" ? null : Number(form.moq),
      minOrderQty: form.moq === "" ? null : Number(form.moq),
      warrantyMonths: form.warrantyMonths === "" ? null : Number(form.warrantyMonths),
      warranty: form.warrantyMonths === "" ? null : Number(form.warrantyMonths),
      bulkMinQty: form.bulkMinQty === "" ? null : Number(form.bulkMinQty),
      bulkPrice: form.bulkPrice === "" ? null : Number(form.bulkPrice),
      bulkTiers,
      variants,
      preparationTime: form.preparationTime === "" ? null : Number(form.preparationTime),
      sizeVariant: form.sizeVariant?.trim() || null,
      colorVariant: form.colorVariant?.trim() || null,
      kitchenStation: form.kitchenStation?.trim() || null,
      modifiers: form.modifiers ? String(form.modifiers).split(",").map((s) => s.trim()).filter(Boolean) : null,
      careInstructions: form.careInstructions?.trim() || null,
      guaranteeDays: form.guaranteeDays === "" ? null : Number(form.guaranteeDays),
    };
    delete dto.variantsJson;
    delete dto.bulkTiersJson;
    delete dto.initialStock;
    if (!showExpiry) delete dto.expiryDate;


    if (imageFile) {
      if (typeof imageFile === "string") {
        dto.image = imageFile;
        submitProduct(dto);
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          dto.image = reader.result;
          submitProduct(dto);
        };
        reader.readAsDataURL(imageFile);
      }
    } else {
      submitProduct(dto);
    }
  };

  const submitProduct = (dto) => {

    const initialStock = form.initialStock ? Number(form.initialStock) : 0;

    if (editing) {
      const productId = editing.id || editing._id;
      dispatch(updateProduct({ id: productId, dto })).then((result) => {
        if (result.type.includes("fulfilled")) {
          toast.success("Product updated successfully");
          dispatch(getProductsByStore(storeId));
          setDialogOpen(false);
        } else {
          console.error("❌ Update failed:", result);
          const errorMsg = result.payload || "Failed to update product";
          if (
            errorMsg.includes("Duplicate entry") &&
            errorMsg.includes("UKq1mafxn973ldq80m1irp3mpvq")
          ) {
            toast.error("SKU already exists. Please use a different SKU.");
          } else {
            toast.error(errorMsg);
          }
        }
      });
    } else {
      dispatch(createProduct(dto)).then((result) => {
        if (result.type.includes("fulfilled")) {
          const createdProduct = result.payload;
          const productId = createdProduct?.id || createdProduct?._id;

          if (initialStock > 0 && productId) {
            dispatch(addInventoryItem({
              branchId: null,
              storeId: parseInt(storeId),
              productId: productId,
              quantity: initialStock,
              unitPrice: dto.sellingPrice,
            }))
              .unwrap()
              .then(() => {
                toast.success(`Product created with ${initialStock} units added to warehouse!`);
              })
              .catch((err) => {
                toast.warning(`Product created but failed to add stock: ${err}`);
              });
          } else {
            toast.success("Product created successfully");
          }

          dispatch(getProductsByStore(storeId));
          setDialogOpen(false);
        } else {
          console.error("❌ Create failed:", result);
          const errorMsg = result.payload || "Failed to create product";
          if (
            errorMsg.includes("Duplicate entry") &&
            errorMsg.includes("UKq1mafxn973ldq80m1irp3mpvq")
          ) {
            toast.error("SKU already exists. Please use a different SKU.");
          } else {
            toast.error(errorMsg);
          }
        }
      });
    }
  };

  const handleDelete = () => {
    const productId = selected.id || selected._id;
    dispatch(deleteProduct(productId)).then((result) => {
      if (result.type.includes("fulfilled")) {
        toast.success("Product deleted successfully");
        dispatch(getProductsByStore(storeId));
      } else {
        toast.error(result.payload || "Failed to delete product");
      }
    });
    setDeleteDialogOpen(false);
  };

  const handleWastage = (p) => {
    const qty = Number(window.prompt(`Wastage qty for ${p.name} (damaged/expired):`, "1"));
    if (!Number.isFinite(qty) || qty <= 0) return;
    const reason = window.prompt("Reason (damaged / expired / spoiled):", "damaged") || "wastage";
    try {
      const key = "pos_wastage_log";
      const log = JSON.parse(localStorage.getItem(key) || "[]");
      log.unshift({
        productId: p.id || p._id,
        name: p.name,
        sku: p.sku,
        qty,
        reason,
        at: new Date().toISOString(),
      });
      localStorage.setItem(key, JSON.stringify(log.slice(0, 500)));
    } catch { /* log is best-effort */ }
    toast.success(`Recorded ${qty} × ${p.name} as ${reason}. Adjust stock in Inventory.`);
  };

  return (
    <div style={s.page}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: "-0.3px" }}>
            Product Management
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#8a909c" }}>
            Manage your store's product catalog{storeType ? ` · ${storeType}` : ""}
          </p>
        </div>
        <button style={s.addBtn} onClick={openAdd}>
          <Plus size={14} /> Add Product
        </button>
      </div>

      {(showExpiry || showWastage) && <ExpiryAlerts products={productList} />}

      <div style={s.card}>
        <div style={s.cardHeader}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>
            Products ({filtered?.length ?? 0})
          </span>
          <div style={{ position: "relative", width: 240 }}>
            <Search
              size={14}
              color="#8a909c"
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
            <input
              style={s.searchInput}
              placeholder="Search by name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {!loading && filtered?.length === 0 && (
          <div style={s.empty}>
            <Package
              size={36}
              color="#e2e5e9"
              style={{ margin: "0 auto 10px", display: "block" }}
            />
            <p style={{ margin: 0, fontWeight: 600 }}>No products found</p>
          </div>
        )}

        {filtered?.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
              <colgroup>
                <col style={{ width: 56 }} />
                <col style={{ width: "22%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "14%" }} />
                <col />
                <col style={{ width: 110 }} />
                <col style={{ width: 90 }} />
              </colgroup>
              <thead>
                <tr>
                  {["Image", "Name", "SKU", "Category", "Description", "Price", "Actions"].map((h, i) => (
                    <th key={h} style={{ ...s.th, textAlign: i >= 5 ? "right" : "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const productId = p.id || p._id;
                  return (
                    <tr
                      key={productId}
                      style={{ background: "white" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
                    >
                      <td style={s.td}>
                        {p.image || p.imageUrl ? (
                          <img
                            src={p.image || p.imageUrl}
                            alt={p.name}
                            style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 6 }}
                          />
                        ) : (
                          <div style={{ width: 40, height: 40, background: "#f5f5f5", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Package size={20} color="#d1d5db" />
                          </div>
                        )}
                      </td>
                      <td style={{ ...s.td, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</td>
                      <td style={{ ...s.td, color: "#8a909c", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.sku ?? "—"}</td>
                      <td style={{ ...s.td, color: "#8a909c", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {categories?.find((c) => (c.id || c._id) === p.categoryId)?.name || p.category?.name || "—"}
                      </td>
                      <td style={{ ...s.td, color: "#8a909c", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {p.description || p.desciption || "—"}
                      </td>
                      <td style={{ ...s.td, textAlign: "right", fontWeight: 700, color: "#1a1d23", whiteSpace: "nowrap" }}>
                        रु {p.sellingPrice || p.price || 0}
                      </td>
                      <td style={{ ...s.td, textAlign: "right" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
                          <button style={s.iconBtn} onClick={() => openEdit(p)}><Pencil size={13} color="#6b7280" /></button>
                          {showWastage && (
                            <button style={s.iconBtn} title="Record wastage" onClick={() => handleWastage(p)}>W</button>
                          )}
                          <button style={{ ...s.iconBtn, borderColor: "#fecaca" }} onClick={() => openDelete(p)}><Trash2 size={13} color="#e53e3e" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Product" : "Add New Product"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Update product information"
                : "Create a new product for your store"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Product Name <span className="text-red-500">*</span></Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>SKU <span className="text-red-500">*</span></Label>
                <Input
                  value={form.sku}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, sku: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <select
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none"
                  style={{ borderColor: "#e2e5e9", background: "#f5f6f8" }}
                  value={form.categoryId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, categoryId: e.target.value }))
                  }
                >
                  <option value="">Select category</option>
                  {categories?.map((c) => (
                    <option key={c.id || c._id} value={c.id || c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Selling Price (रु) <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.sellingPrice}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, sellingPrice: e.target.value }))
                  }
                  placeholder="Enter selling price"
                />
              </div>
              <div className="space-y-1.5">
                <Label>MRP (रु) <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.mrp}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, mrp: e.target.value }))
                  }
                  placeholder="Enter MRP"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>

            {showVerticalSection && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {storeType ? `${storeType} fields` : "Store-type fields"}
                </p>
                {(showExpiry || showBatch) && (
                  <div className="grid grid-cols-2 gap-4">
                    {showExpiry && (
                      <div className="space-y-1.5">
                        <Label>Expiry date</Label>
                        <Input
                          type="date"
                          value={form.expiryDate}
                          onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))}
                        />
                      </div>
                    )}
                    {showBatch && (
                      <div className="space-y-1.5">
                        <Label>Batch no.</Label>
                        <Input
                          value={form.batchNumber}
                          onChange={(e) => setForm((f) => ({ ...f, batchNumber: e.target.value }))}
                          placeholder="B-001"
                        />
                      </div>
                    )}
                  </div>
                )}
                {showPrescription && (
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={!!form.prescriptionRequired}
                        onChange={(e) => setForm((f) => ({ ...f, prescriptionRequired: e.target.checked }))}
                      />
                      Prescription required
                    </label>
                    {showControlled && (
                      <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={!!form.isControlled}
                          onChange={(e) => setForm((f) => ({ ...f, isControlled: e.target.checked }))}
                        />
                        Controlled substance (extra verification)
                      </label>
                    )}
                    {showDosage && (
                      <div className="space-y-1.5">
                        <Label>Dosage / usage (printed on label)</Label>
                        <Input
                          value={form.dosage}
                          onChange={(e) => setForm((f) => ({ ...f, dosage: e.target.value }))}
                          placeholder="1 tab twice daily after meals"
                        />
                      </div>
                    )}
                  </div>
                )}
                {(showUnit || showWeight || showMoq) && (
                  <div className="grid grid-cols-2 gap-4">
                    {showUnit && (
                      <div className="space-y-1.5">
                        <Label>Unit</Label>
                        <select
                          className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
                          value={form.unit}
                          onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                        >
                          {PRODUCT_UNITS.map((u) => (
                            <option key={u} value={u}>{u}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    {showWeight && (
                      <div className="space-y-1.5">
                        <Label>Weight</Label>
                        <Input
                          type="number" min={0} step="0.01"
                          value={form.weight}
                          onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
                          placeholder="e.g. 500"
                        />
                      </div>
                    )}
                    {showWeight && (
                      <div className="space-y-1.5">
                        <Label>Scale step (kg/L)</Label>
                        <Input
                          type="number" min={0} step="0.01"
                          value={form.weightStep}
                          onChange={(e) => setForm((f) => ({ ...f, weightStep: e.target.value }))}
                          placeholder="0.5"
                        />
                      </div>
                    )}
                    {showMoq && (
                      <div className="space-y-1.5">
                        <Label>MOQ (min order qty)</Label>
                        <Input
                          type="number" min={0}
                          value={form.moq}
                          onChange={(e) => setForm((f) => ({ ...f, moq: e.target.value }))}
                          placeholder="e.g. 12"
                        />
                      </div>
                    )}
                  </div>
                )}
                {(showSerial || showWarranty) && (
                  <div className="grid grid-cols-2 gap-4">
                    {showSerial && (
                      <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={!!form.requiresSerial}
                          onChange={(e) => setForm((f) => ({ ...f, requiresSerial: e.target.checked }))}
                        />
                        Track serial / IMEI
                      </label>
                    )}
                    {showWarranty && (
                      <div className="space-y-1.5">
                        <Label>Warranty (months)</Label>
                        <Input
                          type="number" min={0}
                          value={form.warrantyMonths}
                          onChange={(e) => setForm((f) => ({ ...f, warrantyMonths: e.target.value }))}
                          placeholder="12"
                        />
                      </div>
                    )}
                  </div>
                )}
                {showVariants && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>Size</Label>
                        <Input
                          value={form.sizeVariant}
                          onChange={(e) => setForm((f) => ({ ...f, sizeVariant: e.target.value }))}
                          placeholder="M / 42 / 15-inch"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Color</Label>
                        <Input
                          value={form.colorVariant}
                          onChange={(e) => setForm((f) => ({ ...f, colorVariant: e.target.value }))}
                          placeholder="Black"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Variant matrix (JSON, optional)</Label>
                      <textarea
                        className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs font-mono"
                        rows={2}
                        value={form.variantsJson}
                        onChange={(e) => setForm((f) => ({ ...f, variantsJson: e.target.value }))}
                        placeholder='[{"sku":"SH-M-BLK","size":"M","color":"Black","price":999,"stock":10}]'
                      />
                      <p className="text-[11px] text-gray-500">Each variant can carry its own SKU / price / stock. Leave empty to use Size+Color above.</p>
                    </div>
                  </div>
                )}
                {showBulk && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>Bulk min qty (legacy)</Label>
                        <Input
                          type="number" min={0}
                          value={form.bulkMinQty}
                          onChange={(e) => setForm((f) => ({ ...f, bulkMinQty: e.target.value }))}
                          placeholder="e.g. 10"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Bulk price (रु)</Label>
                        <Input
                          type="number" min={0} step="0.01"
                          value={form.bulkPrice}
                          onChange={(e) => setForm((f) => ({ ...f, bulkPrice: e.target.value }))}
                          placeholder="Wholesale rate"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Bulk tiers (JSON, optional — wins over legacy)</Label>
                      <textarea
                        className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs font-mono"
                        rows={2}
                        value={form.bulkTiersJson}
                        onChange={(e) => setForm((f) => ({ ...f, bulkTiersJson: e.target.value }))}
                        placeholder='[{"minQty":10,"price":900},{"minQty":50,"price":850}]'
                      />
                    </div>
                  </div>
                )}
                {showRestaurant && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Prep time (min)</Label>
                      <Input
                        type="number" min={0}
                        value={form.preparationTime}
                        onChange={(e) => setForm((f) => ({ ...f, preparationTime: e.target.value }))}
                        placeholder="15"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Kitchen station</Label>
                      <Input
                        value={form.kitchenStation}
                        onChange={(e) => setForm((f) => ({ ...f, kitchenStation: e.target.value }))}
                        placeholder="Grill / Bar"
                      />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-slate-700 col-span-2">
                      <input
                        type="checkbox"
                        checked={!!form.isVeg}
                        onChange={(e) => setForm((f) => ({ ...f, isVeg: e.target.checked }))}
                      />
                      Vegetarian item
                    </label>
                    {showModifiers && (
                      <div className="space-y-1.5 col-span-2">
                        <Label>Modifiers (comma separated)</Label>
                        <Input
                          value={form.modifiers}
                          onChange={(e) => setForm((f) => ({ ...f, modifiers: e.target.value }))}
                          placeholder="Extra cheese, No onion, Less spicy"
                        />
                      </div>
                    )}
                  </div>
                )}
                {showCare && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5 col-span-2">
                      <Label>Care instructions</Label>
                      <Input
                        value={form.careInstructions}
                        onChange={(e) => setForm((f) => ({ ...f, careInstructions: e.target.value }))}
                        placeholder="Indirect sunlight, water weekly"
                      />
                    </div>
                    {showGuarantee && (
                      <div className="space-y-1.5">
                        <Label>Survival guarantee (days)</Label>
                        <Input
                          type="number" min={0}
                          value={form.guaranteeDays}
                          onChange={(e) => setForm((f) => ({ ...f, guaranteeDays: e.target.value }))}
                          placeholder="30"
                        />
                      </div>
                    )}
                  </div>
                )}
                {showWastage && (
                  <p className="text-[11px] text-gray-500">Tip: record damage/expired write-offs from Inventory → adjust stock with reason “wastage”.</p>
                )}
              </div>
            )}

            {!editing && (
              <div className="space-y-1.5">
                <Label>Initial Warehouse Stock (Optional)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.initialStock}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, initialStock: e.target.value }))
                  }
                  placeholder="Enter quantity to add to warehouse"
                />
                <p className="text-xs text-gray-500">💡 Add stock to your warehouse when creating the product (you can add more later)</p>
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Product Image</Label>
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                  <Upload size={24} className="mx-auto mb-2 text-gray-400" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer text-sm text-blue-600 hover:underline"
                  >
                    Click to upload image
                  </label>
                  <p className="text-xs text-gray-500 mt-1">Max 5MB</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                style={{
                  background: "linear-gradient(135deg,#1a1d23,#4a4d55)",
                  color: "white",
                  border: "none",
                }}
              >
                {editing ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{selected?.name}</strong>?
              This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
