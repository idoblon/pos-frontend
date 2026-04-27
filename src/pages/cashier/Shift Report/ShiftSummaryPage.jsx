import React from 'react'
import ShiftReportHeader from './ShiftReportHeader'
import ShiftInformation from './ShiftInformation'
import SalesSummaryCard from './SalesSummaryCard'
import PaymentSummaryCard from './PaymentSummaryCard'
import TopSellingItems from './TopSellingItems'
import RecentOrdersTable from './RecentOrdersTable'
import RefundsTable from './RefundsTable'

const ShiftSummaryPage = () => {
    return (
        <div className = 'h-full flex flex-col'>
        <ShiftReportHeader/>
        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-clos-1 md:grid-cols-2 gap-4 mb-6">
            <ShiftInformation/>
            <SalesSummaryCard/>
            </div>
             <div className="grid grid-clos-1 md:grid-cols-2 gap-4 mb-6">
            </div>
            <PaymentSummaryCard/>
            <TopSellingItems/>
             <div className="grid grid-clos-1 md:grid-cols-2 gap-4 mb-6">
            </div>
            <RecentOrdersTable/>
            <RefundsTable/>
          </div>
        </div>
    )
}

export default ShiftSummaryPage