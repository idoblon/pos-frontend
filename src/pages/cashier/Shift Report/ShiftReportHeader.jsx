import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import React from 'react'

const ShiftReportHeader = () => {
    return (
        <div className='bg-white border-b shadow-sm'>
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Shift Summary</h1>
                <p className="text-sm text-gray-500 mt-1">Monitor your current shift performance</p>
              </div>
              <div className='flex gap-2'>
                <Button variant={"destructive"} size="lg">
                  <ArrowRight className="mr-2 h-4 w-4" />
                  End Shift & Logout
                </Button>
              </div>
            </div>
          </div>  
        </div>
    )
}

export default ShiftReportHeader