import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { endShift } from '@/Redux Toolkit/Features/shiftReport/shiftReportThunk'
import { logout } from '@/Redux Toolkit/Features/auth/authSlice'
import { toast } from 'sonner'

const ShiftReportHeader = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)

    const handleEndShiftAndLogout = async () => {
        setLoading(true)
        try {
            await dispatch(endShift()).unwrap()
            toast.success('Shift ended successfully')
        } catch (error) {
            toast.error(error || 'Failed to end shift')
        } finally {
            setLoading(false)
            dispatch(logout())
            navigate('/login')
        }
    }

    return (
        <div className='bg-white border-b shadow-sm'>
          <div className="px-4 py-3">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Shift Summary</h1>
                <p className="text-xs text-gray-500 mt-0.5">Monitor your current shift performance</p>
              </div>
              <div className='flex gap-2'>
                <Button variant={"destructive"} size="sm" onClick={handleEndShiftAndLogout} disabled={loading}>
                  {loading ? 'Ending Shift...' : 'End Shift & Logout'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>  
        </div>
    )
}

export default ShiftReportHeader
