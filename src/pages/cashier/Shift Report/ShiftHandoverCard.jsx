import { useMemo, useState } from "react";
import { ClipboardCheck, Save } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const money = (value) => `Rs ${(Number(value) || 0).toLocaleString()}`;
const emptyForm = { cashCounted: "", notes: "", nextTasks: "" };
const loadForm = (storageKey) => {
  try { return JSON.parse(localStorage.getItem(storageKey))?.form || emptyForm; }
  catch { return emptyForm; }
};

export default function ShiftHandoverCard({ shift }) {
  const shiftId = shift?.id || shift?._id || shift?.shiftReportId;
  const storageKey = `pos_shift_handover_${shiftId || "current"}`;
  const expectedCash = useMemo(() => (shift?.paymentSummaries || []).reduce(
    (sum, payment) => String(payment.type).toUpperCase() === "CASH" ? sum + (Number(payment.totalAmount) || 0) : sum,
    0,
  ), [shift]);
  const [form, setForm] = useState(() => loadForm(storageKey));

  const counted = Number(form.cashCounted) || 0;
  const variance = counted - expectedCash;
  const save = () => {
    localStorage.setItem(storageKey, JSON.stringify({
      shiftId, savedAt: new Date().toISOString(), expectedCash, variance, form,
    }));
    toast.success("Handover saved on this device.");
  };

  return (
    <Card className="rounded-lg py-0">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div><h2 className="text-base font-semibold text-gray-900">Shift Handover</h2><p className="text-xs text-gray-500">Record cash and notes for the next shift.</p></div>
          <ClipboardCheck className="h-5 w-5 text-gray-700" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-gray-500">Expected cash</p><p className="font-bold">{money(expectedCash)}</p></div>
          <div className={`rounded-lg p-3 ${variance === 0 ? "bg-gray-50" : "bg-amber-50"}`}><p className="text-xs text-gray-500">Cash variance</p><p className="font-bold">{form.cashCounted === "" ? "Count cash" : `${variance >= 0 ? "+" : ""}${money(variance)}`}</p></div>
        </div>
        <div className="mt-3 grid gap-3">
          <Input type="number" min="0" value={form.cashCounted} placeholder="Cash counted (Rs)" onChange={(e) => setForm({ ...form, cashCounted: e.target.value })} />
          <textarea className="min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" value={form.notes} placeholder="Issues, refunds, or important notes" onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <textarea className="min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" value={form.nextTasks} placeholder="Tasks for the next cashier or manager" onChange={(e) => setForm({ ...form, nextTasks: e.target.value })} />
          <Button onClick={save} variant="outline" className="justify-self-end"><Save size={14} className="mr-2" />Save handover</Button>
        </div>
      </CardContent>
    </Card>
  );
}
