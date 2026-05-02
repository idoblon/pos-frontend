import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import React from 'react'

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
                <Button variant={"destructive"} size="sm">
                  End Shift & Logout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>  
        </div>
    )
}

export default ShiftReportHeader