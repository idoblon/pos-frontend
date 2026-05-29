import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Search, Package, Pencil, Trash2, Upload, X } from "lucide-react";
import {
  getProductsByStore,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/Redux Toolkit/Features/product/productThunk";
import { getCategoriesByStore } from "@/Redux Toolkit/Features/category/categoryThunk";
import { getUserProfile } from "@/Redux Toolkit/Features/user/userThunk";
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

const EMPTY_FORM = {
  name: "",
  sku: "",
  sellingPrice: "",
  mrp: "",
  categoryId: "",
  description: "",
  image: "",
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

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

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
    setForm({
      name: p.name ?? "",
      sku: p.sku ?? "",
      sellingPrice: p.sellingPrice ?? "",
      mrp: p.mrp ?? "",
      categoryId: p.categoryId ?? "",
      description: p.description || p.desciption || "",
      image: p.image || p.imageUrl || "",
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

      // Compress image before storing
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

          // Compress to JPEG with 0.7 quality
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.7);
          setImagePreview(compressedDataUrl);
          setImageFile(compressedDataUrl); // Store compressed base64 directly
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

    console.log("📝 Form data before submit:", form);

    const dto = {
      ...form,
      sellingPrice: Number(form.sellingPrice),
      mrp: Number(form.mrp),
      categoryId: form.categoryId ? parseInt(form.categoryId) : null,
      storeId: parseInt(storeId),
      store: { id: parseInt(storeId) },
    };

    console.log("📦 DTO before image:", dto);

    if (imageFile) {
      // imageFile is already compressed base64 string
      if (typeof imageFile === "string") {
        dto.image = imageFile;
        console.log(
          "📦 DTO with compressed image (length):",
          dto.image?.length,
        );
        submitProduct(dto);
      } else {
        // Fallback for old flow
        const reader = new FileReader();
        reader.onloadend = () => {
          dto.image = reader.result;
          console.log("📦 DTO with image (length):", dto.image?.length);
          submitProduct(dto);
        };
        reader.readAsDataURL(imageFile);
      }
    } else {
      submitProduct(dto);
    }
  };

  const submitProduct = (dto) => {
    console.log("🚀 Submitting product:", editing ? "UPDATE" : "CREATE", dto);

    if (editing) {
      const productId = editing.id || editing._id;
      dispatch(updateProduct({ id: productId, dto })).then((result) => {
        console.log("✅ Update result:", result);
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
        console.log("✅ Create result:", result);
        if (result.type.includes("fulfilled")) {
          toast.success("Product created successfully");
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

  return (
    <div style={s.page}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "-0.3px",
            }}
          >
            Product Management
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#8a909c" }}>
            Manage your store's product catalog
          </p>
        </div>
        <button style={s.addBtn} onClick={openAdd}>
          <Plus size={14} /> Add Product
        </button>
      </div>

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
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {[
                    "Image",
                    "Name",
                    "SKU",
                    "Category",
                    "Description",
                    "Price",
                    "Actions",
                  ].map((h, i) => (
                    <th
                      key={h}
                      style={{ ...s.th, textAlign: i >= 5 ? "right" : "left" }}
                    >
                      {h}
                    </th>
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
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#f5f5f5")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "white")
                      }
                    >
                      <td style={s.td}>
                        {p.image || p.imageUrl ? (
                          <img
                            src={p.image || p.imageUrl}
                            alt={p.name}
                            style={{
                              width: 40,
                              height: 40,
                              objectFit: "cover",
                              borderRadius: 6,
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              background: "#f5f5f5",
                              borderRadius: 6,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Package size={20} color="#d1d5db" />
                          </div>
                        )}
                      </td>
                      <td style={{ ...s.td, fontWeight: 600 }}>{p.name}</td>
                      <td style={{ ...s.td, color: "#8a909c" }}>
                        {p.sku ?? "—"}
                      </td>
                      <td style={{ ...s.td, color: "#8a909c" }}>
                        {categories?.find(
                          (c) => (c.id || c._id) === p.categoryId,
                        )?.name ||
                          p.category?.name ||
                          "—"}
                      </td>
                      <td
                        style={{
                          ...s.td,
                          color: "#8a909c",
                          maxWidth: 200,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {p.description || p.desciption || "—"}
                      </td>
                      <td
                        style={{
                          ...s.td,
                          textAlign: "right",
                          fontWeight: 700,
                          color: "#1a1d23",
                        }}
                      >
                        रु {p.sellingPrice || p.price || 0}
                      </td>
                      <td style={{ ...s.td, textAlign: "right" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            gap: 6,
                          }}
                        >
                          <button style={s.iconBtn} onClick={() => openEdit(p)}>
                            <Pencil size={13} color="#6b7280" />
                          </button>
                          <button
                            style={{ ...s.iconBtn, borderColor: "#fecaca" }}
                            onClick={() => openDelete(p)}
                          >
                            <Trash2 size={13} color="#e53e3e" />
                          </button>
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
              <Label>Product Name</Label>
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
                <Label>SKU</Label>
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
                <Label>Selling Price (रु)</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.sellingPrice}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, sellingPrice: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>MRP (रु)</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.mrp}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, mrp: e.target.value }))
                  }
                  required
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
