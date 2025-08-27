
'use server';

import { Tier } from './data';

export async function createPaymentLink(
  signupData: {
    name: string;
    email: string;
    password: string;
    organizationName: string;
    tier: Tier;
  },
  amount: number,
  tier: Tier
) {
  try {
    const tx_ref = `NCRM-${tier}-${Date.now()}`;
    const encodedSignupData = Buffer.from(JSON.stringify(signupData)).toString('base64');

    const payload = {
      tx_ref,
      amount,
      currency: 'NGN',
      redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment-callback`,
      customer: {
        email: signupData.email,
        name: signupData.name,
      },
      customizations: {
        title: 'N-CRM Subscription',
        description: `Payment for ${tier} plan`,
      },
      meta: {
        signupData: encodedSignupData
      }
    };
    
    const response = await fetch('https://api.flutterwave.com/v3/payments', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    
    const data = await response.json();

    if (data.status === 'success') {
      return data.data.link;
    } else {
      console.error('Flutterwave API Error:', data);
      throw new Error(data.message || 'Failed to initiate payment with Flutterwave.');
    }
  } catch (error) {
    console.error('Flutterwave Error:', error);
    if (error instanceof Error) {
        throw new Error(`Payment initiation failed: ${error.message}`);
    }
    throw new Error('An unknown error occurred during payment initiation.');
  }
}
