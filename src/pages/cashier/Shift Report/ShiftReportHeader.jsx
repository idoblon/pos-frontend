import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import React, { useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { endShift } from '@/Redux Toolkit/Features/shiftReport/shiftReportThunk'
import { logout } from '@/Redux Toolkit/Features/auth/authSlice'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export const EndShiftLogoutButton = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [declaredCash, setDeclaredCash] = useState("")
    const endingShiftRef = useRef(false)

    const handleEndShiftAndLogout = async () => {
        if (endingShiftRef.current) return
        endingShiftRef.current = true
        setLoading(true)
        try {
            const result = await dispatch(endShift({ declaredCash })).unwrap()
            const discrepancy = Number(result?.cashDiscrepancy ?? 0);
            if (Math.abs(discrepancy) >= 0.01) {
                toast.warning(`Shift ended with cash variance ${discrepancy >= 0 ? "+" : ""}रु ${Math.abs(discrepancy).toLocaleString("en-IN")} (${result?.reconciliationStatus || "check"})`);
            } else {
                toast.success('Shift ended successfully — cash matched');
            }
            setDialogOpen(false);
        } catch (error) {
            toast.error(error || 'Failed to end shift')
        } finally {
            setLoading(false)
            endingShiftRef.current = false
            dispatch(logout())
            navigate('/login')
        }
    }

    return (
        <>
            <Button variant={"destructive"} size="sm" onClick={() => { setDeclaredCash(""); setDialogOpen(true); }} disabled={loading}>
                {loading ? 'Ending Shift...' : 'End Shift & Logout'}
                <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Dialog open={dialogOpen} onOpenChange={(v) => { if (!v && !loading) setDialogOpen(false); }}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>End Shift & Logout</DialogTitle>
                        <DialogDescription>
                            Count the cash in the drawer and enter it below. The server reconciles it against expected cash.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-1.5 mt-2">
                        <Label>Declared cash count (रु)</Label>
                        <Input
                            type="number" min="0" step="0.01"
                            value={declaredCash}
                            onChange={(e) => setDeclaredCash(e.target.value)}
                            placeholder="e.g. 12500"
                            autoFocus
                        />
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={loading}>Cancel</Button>
                        <Button variant="destructive" onClick={handleEndShiftAndLogout} disabled={loading}>
                            {loading ? 'Ending Shift...' : 'End Shift & Logout'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

const ShiftReportHeader = () => {
    return (
        <div className='bg-white border-b shadow-sm'>
          <div className="px-4 py-3">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Shift Summary</h1>
                <p className="text-xs text-gray-500 mt-0.5">Monitor your current shift performance</p>
              </div>
              <div className='flex gap-2'>
                <EndShiftLogoutButton />
              </div>
            </div>
          </div>
        </div>
    )
}

export default ShiftReportHeader
