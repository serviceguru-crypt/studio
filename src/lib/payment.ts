
'use server';

import Flutterwave from 'flutterwave-node-v3';
import { Tier } from './data';
import { redirect } from 'next/navigation';

const flw = new Flutterwave(
  process.env.FLUTTERWAVE_PUBLIC_KEY!,
  process.env.FLUTTERWAVE_SECRET_KEY!
);

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
    // We are embedding the signup data into the transaction reference so we can
    // retrieve it in the webhook after payment is complete.
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

    const response = await flw.Payment.initiate(payload);

    if (response.status === 'success') {
      return response.data.link;
    } else {
      throw new Error('Failed to initiate payment with Flutterwave.');
    }
  } catch (error) {
    console.error('Flutterwave Error:', error);
    // It's good practice to re-throw or handle the error appropriately
    if (error instanceof Error) {
        throw new Error(`Payment initiation failed: ${error.message}`);
    }
    throw new Error('An unknown error occurred during payment initiation.');
  }
}
