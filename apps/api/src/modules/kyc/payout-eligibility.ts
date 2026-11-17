import { VerificationStatus, SellerStatus, AccountStatus } from '@prisma/client';
import { paymentCapability } from '../../lib/payment-provider';
import { isKycVerifiedStatus } from './kyc.state-machine';

export type PayoutEligibilityBlockingReason =
  | 'PAYOUT_PROVIDER_DISABLED'
  | 'KYC_NOT_APPROVED'
  | 'SELLER_PROFILE_NOT_APPROVED'
  | 'ACCOUNT_NOT_ACTIVE'
  | 'STRIPE_CONNECT_ACCOUNT_MISSING';

export interface SellerPayoutEligibilityInput {
  sellerStatus: SellerStatus;
  verificationStatus: VerificationStatus;
  accountStatus: AccountStatus;
  hasStripeAccountId: boolean;
}

export interface SellerPayoutEligibility {
  // Read-only future integration contract: live payouts remain disabled in this milestone.
  eligibleForLivePayouts: boolean;
  kycSatisfied: boolean;
  sellerProfileApproved: boolean;
  accountActive: boolean;
  providerPayoutsEnabled: boolean;
  blockingReasons: PayoutEligibilityBlockingReason[];
  verificationStatus: VerificationStatus;
  evaluatedAt: string;
}

export function evaluateSellerPayoutEligibility(
  input: SellerPayoutEligibilityInput
): SellerPayoutEligibility {
  const capability = paymentCapability();
  const kycSatisfied = isKycVerifiedStatus(input.verificationStatus);
  const sellerProfileApproved = input.sellerStatus === 'APPROVED';
  const accountActive = input.accountStatus === 'ACTIVE';
  const providerPayoutsEnabled = Boolean(capability.externalPayoutsAvailable);

  const blockingReasons: PayoutEligibilityBlockingReason[] = [];
  if (!providerPayoutsEnabled) blockingReasons.push('PAYOUT_PROVIDER_DISABLED');
  if (!kycSatisfied) blockingReasons.push('KYC_NOT_APPROVED');
  if (!sellerProfileApproved) blockingReasons.push('SELLER_PROFILE_NOT_APPROVED');
  if (!accountActive) blockingReasons.push('ACCOUNT_NOT_ACTIVE');
  if (!input.hasStripeAccountId) blockingReasons.push('STRIPE_CONNECT_ACCOUNT_MISSING');

  return {
    eligibleForLivePayouts: false,
    kycSatisfied,
    sellerProfileApproved,
    accountActive,
    providerPayoutsEnabled,
    blockingReasons,
    verificationStatus: input.verificationStatus,
    evaluatedAt: new Date().toISOString(),
  };
}
