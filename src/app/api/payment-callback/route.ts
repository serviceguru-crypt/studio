
import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/data';

async function verifyTransaction(transactionId: string) {
    const url = `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`;
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Flutterwave API responded with status: ${response.status}`);
        }
        
        return await response.json();
    } catch(error) {
        console.error("Error verifying transaction with Flutterwave:", error);
        throw error;
    }
}


export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const tx_ref = searchParams.get('tx_ref');
  const transaction_id = searchParams.get('transaction_id');

  if (status === 'cancelled') {
    return NextResponse.redirect(new URL('/pricing?status=cancelled', request.url));
  }

  if (status === 'successful' && transaction_id) {
    try {
      const response = await verifyTransaction(transaction_id);

      if (
        response.status === "success" &&
        response.data.status === "successful" &&
        response.data.tx_ref === tx_ref
      ) {
        // Payment is successful and verified
        const signupDataEncoded = response.data.meta?.signupData;
        if (!signupDataEncoded) {
            throw new Error('Signup data not found in transaction metadata.');
        }

        const signupData = JSON.parse(Buffer.from(signupDataEncoded, 'base64').toString('utf-8'));
        
        await registerUser(signupData);

        return NextResponse.redirect(new URL('/login?payment=success', request.url));

      } else {
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
