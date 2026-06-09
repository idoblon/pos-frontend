import api from '@/util/api';

class EmailService {
  getPlanPrice(plan) {
    switch (plan) {
      case 'BASIC': return '3,500';
      case 'PROFESSIONAL': return '7,000';
      case 'ENTERPRISE': return '10,000';
      default: return '3,500';
    }
  }

  async sendApprovalEmail(requestData) {
    const payload = {
      to: requestData.email,
      fullName: requestData.ownerName || requestData.fullName || 'Store Owner',
      storeName: requestData.storeName,
      subscriptionPlan: requestData.subscriptionPlan,
      planPrice: this.getPlanPrice(requestData.subscriptionPlan),
      paymentLink: `http://localhost:5173/payment/${requestData.id}`
    };

    try {
      const res = await api.post('/api/email/store-approval', payload);
      console.log(`✅ Approval email sent to ${requestData.email}`);
      return res.data;
    } catch (error) {
      console.error('Approval email failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async sendCredentialsEmail(storeData, credentials) {
    const payload = {
      to: storeData.email,
      fullName: storeData.ownerName || storeData.fullName,
      storeName: storeData.storeName,
      email: storeData.email,
      tempPassword: credentials.tempPassword,
      status: 'APPROVED'
    };

    try {
      const res = await api.post('/api/email/store-credentials', payload);
      console.log(`✅ Login credentials sent to ${storeData.email}`);
      return res.data;
    } catch (error) {
      console.error('Credentials email failed:', error.response?.data || error.message);
      throw error;
    }
  }
  async sendRejectionEmail(requestData, reason) {
    const payload = {
      to: requestData.email,
      fullName: requestData.ownerName || requestData.fullName,
      storeName: requestData.storeName,
      reason,
    };

    try {
      const res = await api.post('/api/email/store-rejection', payload);
      console.log(`✅ Rejection email sent to ${requestData.email}`);
      return res.data;
    } catch (error) {
      console.error('Rejection email failed:', error.response?.data || error.message);
      throw error;
    }
  }
}

export default new EmailService();