import { useState, useEffect } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { NextPageWithLayout } from '@/types';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PlanGrid from '@/components/dashboard/PlanGrid';
import SubscriptionService from '@/services/subscription.service';
import { loadStripe } from '@stripe/stripe-js';



const SubscriptionPage: NextPageWithLayout = () => {
  const { 
    currentSubscription, 
    subscriptionPlans,
    loading, 
    error, 
    verifyPaymentSession, 
    cancelActiveSubscription, 
    refetchSubscription 
  } = useSubscription();
  
  const router = useRouter();
  const [isCanceling, setIsCanceling] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  useEffect(() => {
    const { payment_success, session_id, payment_canceled } = router.query;

    if (payment_success && session_id) {
      const handleVerification = async () => {
        const toastId = toast.loading('Verifying payment...');
        try {
          await verifyPaymentSession(session_id as string);
          toast.success('Payment Successful! Your subscription has been activated.', { id: toastId });
          router.replace('/dashboard/subscription', undefined, { shallow: true });
        } catch (err: any) {
          toast.error(err.message || 'There was an issue verifying your payment.', { id: toastId });
        }
      };
      handleVerification();
    }

    if (payment_canceled) {
      toast.error('Your payment process was canceled.');
      router.replace('/dashboard/subscription', undefined, { shallow: true });
    }
  }, [router, verifyPaymentSession]);

  const handleSwitchPlan = async (planId: string) => {
    if (isSwitching || loading) return;
    setIsSwitching(true);
    const toastId = toast.loading('Updating your plan...');
    try {
      const response = await SubscriptionService.createCheckoutSession(planId);
      console.log('[handleSwitchPlan] Raw response from service:', response);

      // Handle direct upgrade/downgrade
      if (response.upgraded) {
        console.log('[onSuccess] Plan upgraded directly.');
        toast.success('Your plan has been upgraded successfully!', { id: toastId });
        await refetchSubscription();
      } 
      // Handle new subscription checkout
      else if (response.sessionId) {
        console.log(`[onSuccess] Received sessionId: ${response.sessionId}. Loading Stripe...`);
        const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
        console.log('[onSuccess] Stripe Publishable Key:', stripeKey);

        if (!stripeKey) {
          console.error('[onSuccess] Stripe Publishable Key is missing!');
          toast.error('Client configuration error. Please contact support.');
          return;
        }
        const stripe = await loadStripe(stripeKey);
        if (stripe) {
          console.log('[onSuccess] Stripe loaded. Redirecting to checkout...');
          await stripe.redirectToCheckout({ sessionId: response.sessionId });
        } else {
          console.error('[onSuccess] Failed to load Stripe.js.');
          toast.error('Could not connect to payment provider. Please try again.');
        }
      } 
      // Handle unexpected response
      else {
        console.warn('[onSuccess] Received unexpected data structure:', response);
        toast.error('An unexpected error occurred. Please try again.');
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred while processing your request.', { id: toastId });
    } finally {
      setIsSwitching(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (window.confirm('Are you sure you want to cancel your subscription? This will take effect at the end of your current billing period.')) {
      setIsCanceling(true);
      try {
        await cancelActiveSubscription();
        toast.success('Subscription cancellation requested.');
        refetchSubscription();
      } catch (err: any) {
        toast.error(err.message || 'Could not process cancellation request.');
      } finally {
        setIsCanceling(false);
      }
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  const planDetails = currentSubscription?.plan;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Subscription Management</h1>
      
      {currentSubscription && planDetails ? (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Current Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-lg">
                You are currently on the <strong>{typeof planDetails === 'object' ? planDetails.name : '...'}</strong> plan.
              </p>
              <div className="text-sm text-gray-500 space-y-1">
                {currentSubscription.startDate && (
                  <p>
                    <span className="font-semibold">Subscribed on:</span>{' '}
                    {new Date(currentSubscription.startDate).toLocaleDateString()}
                  </p>
                )}
                {(() => {
                  const endDate = currentSubscription.currentPeriodEnd ? new Date(currentSubscription.currentPeriodEnd) : null;
                  const isEndDateValid = endDate && !isNaN(endDate.getTime());

                  if (currentSubscription.status === 'pending_cancellation') {
                    return (
                      <p>
                        <span className="font-semibold text-yellow-600">Cancels on:</span>{' '}
                        <span className="text-yellow-600">
                          {isEndDateValid ? endDate.toLocaleDateString() : 'the end of the billing period'}
                        </span>
                      </p>
                    );
                  }
                  
                  if (isEndDateValid) {
                    return (
                      <p>
                        <span className="font-semibold">Renews on:</span>{' '}
                        {endDate.toLocaleDateString()}
                      </p>
                    );
                  }
                  return null;
                })()}
              </div>

              {currentSubscription.status === 'pending_cancellation' ? (
                <p className="text-sm text-yellow-600 bg-yellow-100 p-3 rounded-md mt-4">
                  Your subscription is scheduled to be canceled. You will have access until the end of the current billing period.
                </p>
              ) : (
                planDetails && typeof planDetails === 'object' && planDetails.price > 0 && (
                  <Button variant="destructive" disabled={isCanceling} onClick={handleCancelSubscription}>
                    {isCanceling ? 'Canceling...' : 'Cancel Subscription'}
                  </Button>
                )
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>No Active Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You do not have an active subscription. Please choose a plan to get started.</p>
          </CardContent>
        </Card>
      )}

      <PlanGrid
        plans={subscriptionPlans}
        onSwitchPlan={handleSwitchPlan}
        currentPlanId={typeof planDetails === 'object' ? planDetails._id : undefined}
        showActions={currentSubscription?.status !== 'pending_cancellation'}
        isSwitching={isSwitching}
      />
    </div>
  );
};

SubscriptionPage.getLayout = (page) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default SubscriptionPage;
