import { startShift, getCurrentShiftProgress, endShift } from "@/Redux Toolkit/Features/shiftReport/shiftReportThunk";
import secureStorage from "./secureStorage";

/**
 * Shift Manager - Handles automatic shift creation and tracking
 */
class ShiftManager {
  constructor() {
    this.shiftCheckInterval = null;
    this.SHIFT_DURATION_HOURS = 10;
    this.CHECK_INTERVAL_MS = 60000; // Check every minute
  }

  /**
   * Start shift tracking for a user after login
   */
  async initializeShiftOnLogin(dispatch, userData) {
    try {
      console.log("🔄 Initializing shift for user:", userData);
      
      // Check if user already has an active shift
      const currentShift = await dispatch(getCurrentShiftProgress()).unwrap();
      
      if (currentShift && !currentShift.endTime) {
        console.log("✅ User already has active shift:", currentShift);
        this.startShiftMonitoring(dispatch, currentShift);
        return currentShift;
      }
      
      // Start new shift if no active shift exists
      console.log("🚀 Starting new shift for user");
      const newShift = await dispatch(startShift()).unwrap();
      console.log("✅ New shift started:", newShift);
      
      // Store shift start time in localStorage for persistence
      localStorage.setItem('currentShiftStart', new Date().toISOString());
      localStorage.setItem('currentShiftId', newShift.id);
      
      this.startShiftMonitoring(dispatch, newShift);
      return newShift;
      
    } catch (error) {
      console.error("❌ Failed to initialize shift:", error);
      
      // Fallback: create local shift tracking if API fails
      const fallbackShift = {
        id: `LOCAL_${Date.now()}`,
        startTime: new Date().toISOString(),
        endTime: null,
        cashierId: userData?.id || userData?.userId,
        cashierName: userData?.fullName || userData?.username,
        status: 'ACTIVE'
      };
      
      localStorage.setItem('currentShiftStart', fallbackShift.startTime);
      localStorage.setItem('currentShiftId', fallbackShift.id);
      localStorage.setItem('fallbackShift', JSON.stringify(fallbackShift));
      
      this.startShiftMonitoring(dispatch, fallbackShift);
      return fallbackShift;
    }
  }

  /**
   * Start monitoring shift duration
   */
  startShiftMonitoring(dispatch, shift) {
    // Clear any existing interval
    this.stopShiftMonitoring();
    
    console.log("⏰ Starting shift monitoring for:", shift.id);
    
    this.shiftCheckInterval = setInterval(() => {
      this.checkShiftDuration(dispatch, shift);
    }, this.CHECK_INTERVAL_MS);
    
    // Initial check
    this.checkShiftDuration(dispatch, shift);
  }

  /**
   * Check if shift has exceeded 10 hours
   */
  checkShiftDuration(dispatch, shift) {
    const startTime = new Date(shift.startTime || localStorage.getItem('currentShiftStart'));
    const now = new Date();
    const hoursWorked = (now - startTime) / (1000 * 60 * 60);
    
    console.log(`⏱️ Shift duration check: ${hoursWorked.toFixed(1)} hours`);
    
    if (hoursWorked >= this.SHIFT_DURATION_HOURS) {
      this.handleOvertimeAlert(dispatch, shift, hoursWorked);
    }
    
    // Update shift progress in localStorage
    localStorage.setItem('shiftHoursWorked', hoursWorked.toString());
  }

  /**
   * Handle overtime alert when shift exceeds 10 hours
   */
  handleOvertimeAlert(dispatch, shift, hoursWorked) {
    console.log("🚨 OVERTIME ALERT: Shift has exceeded 10 hours!");
    
    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification('Shift Overtime Alert', {
        body: `Your shift has exceeded ${this.SHIFT_DURATION_HOURS} hours (${hoursWorked.toFixed(1)}h). Consider ending your shift.`,
        icon: '/favicon.svg'
      });
    }
    
    // Store overtime status
    localStorage.setItem('shiftOvertime', 'true');
    localStorage.setItem('overtimeHours', (hoursWorked - this.SHIFT_DURATION_HOURS).toString());
    
    // Dispatch custom event for UI components to listen
    window.dispatchEvent(new CustomEvent('shiftOvertime', {
      detail: { shift, hoursWorked }
    }));
  }

  /**
   * Stop shift monitoring
   */
  stopShiftMonitoring() {
    if (this.shiftCheckInterval) {
      clearInterval(this.shiftCheckInterval);
      this.shiftCheckInterval = null;
      console.log("⏹️ Shift monitoring stopped");
    }
  }

  /**
   * End current shift
   */
  async endCurrentShift(dispatch) {
    try {
      console.log("🔚 Ending current shift");
      
      // Try to end shift via API
      await dispatch(endShift()).unwrap();
      
      // Clear local storage
      this.clearShiftData();
      this.stopShiftMonitoring();
      
      console.log("✅ Shift ended successfully");
      return true;
      
    } catch (error) {
      console.error("❌ Failed to end shift:", error);
      
      // Fallback: mark shift as ended locally
      const fallbackShift = JSON.parse(localStorage.getItem('fallbackShift') || '{}');
      if (fallbackShift.id) {
        fallbackShift.endTime = new Date().toISOString();
        fallbackShift.status = 'CLOSED';
        localStorage.setItem('fallbackShift', JSON.stringify(fallbackShift));
      }
      
      this.clearShiftData();
      this.stopShiftMonitoring();
      return false;
    }
  }

  /**
   * Clear shift data from localStorage
   */
  clearShiftData() {
    localStorage.removeItem('currentShiftStart');
    localStorage.removeItem('currentShiftId');
    localStorage.removeItem('shiftHoursWorked');
    localStorage.removeItem('shiftOvertime');
    localStorage.removeItem('overtimeHours');
    localStorage.removeItem('fallbackShift');
  }

  /**
   * Get current shift status
   */
  getCurrentShiftStatus() {
    const shiftStart = localStorage.getItem('currentShiftStart');
    const shiftId = localStorage.getItem('currentShiftId');
    const hoursWorked = parseFloat(localStorage.getItem('shiftHoursWorked') || '0');
    const isOvertime = localStorage.getItem('shiftOvertime') === 'true';
    
    if (!shiftStart || !shiftId) {
      return null;
    }
    
    return {
      id: shiftId,
      startTime: shiftStart,
      hoursWorked: hoursWorked.toFixed(1),
      isOvertime,
      remainingHours: Math.max(0, this.SHIFT_DURATION_HOURS - hoursWorked).toFixed(1)
    };
  }

  /**
   * Request notification permission
   */
  async requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }
}

// Export singleton instance
export default new ShiftManager();