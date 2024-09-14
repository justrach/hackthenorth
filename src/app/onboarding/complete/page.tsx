"use client";
import { useOnboardingStore } from '@/src/app/store/onboardingStore';
import { BreadcrumbDemo } from '@/components/breadcrumbs/ui';
import Link from 'next/link';

import { useEffect } from 'react';
interface OnboardingData {
    birthYear: number;
    username: string;
    gender: string;
    isRestaurantOwner: boolean;
    pseudoUsername: string;
    dietaryRestrictions: string[];
    country: string;
    resetOnboarding: () => void;
  }
  

export default function Complete() {
    const { birthYear, username, gender, isRestaurantOwner, pseudoUsername, dietaryRestrictions, country, resetOnboarding } = useOnboardingStore() as OnboardingData;


  useEffect(() => {
    // Here you can handle the submission of the onboarding data to your backend

    // Reset the onboarding state
    resetOnboarding();
  }, []);

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center">
      <BreadcrumbDemo />
      <div className="space-y-6">
        <h1>Onboarding Complete</h1>
        <p>Thank you for providing your information!</p>
        <pre>
          {JSON.stringify(
            { birthYear, username, gender, isRestaurantOwner, pseudoUsername, dietaryRestrictions, country },
            null,
            2
          )}
        </pre>
        <Link href={'/'}>Go to Home</Link>
      </div>
    </main>
  );
}
