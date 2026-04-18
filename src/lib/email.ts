import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendDepositApproved(email: string, amount: string, userName: string) {
  try {
    await resend.emails.send({
      from: 'Vertex Wealth <noreply@vertexwealth.com>',
      to: email,
      subject: '✅ Your Deposit Has Been Approved',
      html: `
        <h2>Dear ${userName},</h2>
        <p>Your deposit of <strong>$${amount} USDT</strong> has been successfully approved and added to your balance.</p>
        <p>You can now start earning daily interest.</p>
        <p>Thank you for trusting Vertex Wealth Group.</p>
      `,
    });
  } catch (error) {
    console.error('Deposit email failed:', error);
  }
}

export async function sendWithdrawalApproved(email: string, amount: string, userName: string, wallet: string) {
  try {
    await resend.emails.send({
      from: 'Vertex Wealth <noreply@vertexwealth.com>',
      to: email,
      subject: '✅ Your Withdrawal Has Been Approved',
      html: `
        <h2>Dear ${userName},</h2>
        <p>Your withdrawal request of <strong>$${amount} USDT</strong> has been approved.</p>
        <p>It has been sent to: <strong>${wallet}</strong></p>
        <p>Funds should arrive in your wallet within 24-48 hours.</p>
      `,
    });
  } catch (error) {
    console.error('Withdrawal approved email failed:', error);
  }
}

export async function sendWithdrawalRejected(email: string, amount: string, userName: string, reason: string) {
  try {
    await resend.emails.send({
      from: 'Vertex Wealth <noreply@vertexwealth.com>',
      to: email,
      subject: '❌ Your Withdrawal Request Was Rejected',
      html: `
        <h2>Dear ${userName},</h2>
        <p>Your withdrawal request of <strong>$${amount} USDT</strong> was rejected.</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>Please contact support if you have any questions.</p>
      `,
    });
  } catch (error) {
    console.error('Withdrawal rejected email failed:', error);
  }
}

export async function sendDepositRejected(email: string, amount: string, userName: string, reason: string) {
  try {
    await resend.emails.send({
      from: 'Vertex Wealth <noreply@vertexwealth.com>',
      to: email,
      subject: '❌ Your Deposit Was Rejected',
      html: `
        <h2>Dear ${userName},</h2>
        <p>Your deposit of <strong>$${amount} USDT</strong> was rejected by the admin.</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>Please contact support if you have any questions or want to submit again.</p>
      `,
    });
  } catch (error) {
    console.error('Deposit rejected email failed:', error);
  }
}