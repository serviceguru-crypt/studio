
import { NextRequest, NextResponse } from 'next/server';
import Flutterwave from 'flutterwave-node-v3';
import { registerUser } from '@/lib/data';

const flw = new Flutterwave(
  process.env.FLUTTERWAVE_PUBLIC_KEY!,
  process.env.FLUTTERWAVE_SECRET_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const tx_ref = searchParams.get('tx_ref');
  const transaction_id = searchParams.get('transaction_id');

  if (status === 'cancelled') {
    // Redirect to pricing page with a cancellation message
    return NextResponse.redirect(new URL('/pricing?status=cancelled', request.url));
  }

  if (status === 'successful' && transaction_id) {
    try {
      const response = await flw.Transaction.verify({ id: transaction_id });

      if (
        response.data.status === "successful" &&
        response.data.tx_ref === tx_ref
      ) {
        // Payment is successful and verified
        const signupDataEncoded = response.data.meta?.signupData;
        if (!signupDataEncoded) {
            throw new Error('Signup data not found in transaction metadata.');
        }

        const signupData = JSON.parse(Buffer.from(signupDataEncoded, 'base64').toString('utf-8'));
        
        // Register the user
        await registerUser(signupData);

        // Redirect to login page after successful registration
        return NextResponse.redirect(new URL('/login?payment=success', request.url));

      } else {
        // Verification failed
        return NextResponse.redirect(new URL('/pricing?status=failed', request.url));
      }
    } catch (error) {
      console.error('Webhook Error:', error);
       if (error instanceof Error) {
           return NextResponse.redirect(new URL(`/pricing?status=error&message=${encodeURIComponent(error.message)}`, request.url));
       }
       return NextResponse.redirect(new URL('/pricing?status=error', request.url));
    }
  }

  // Fallback for any other status
  return NextResponse.redirect(new URL('/pricing', request.url));
}
