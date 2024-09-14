"use client"
import { useOnboardingStore } from '@/src/app/store/onboardingStore';
import { BreadcrumbDemo } from '@/components/breadcrumbs/ui';
import Link from 'next/link';

export default function Step4() {
    const { country, setCountry } = useOnboardingStore() as { country: string, setCountry: (value: string) => void };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center">
          <BreadcrumbDemo />
      <div className="space-y-6">
        <div className="space-y-1.5">
          <label htmlFor="country">Country</label>
          <select
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            <option value="">Select your country</option>
            <option value="United States">United States</option>
            <option value="Canada">Canada</option>
            <option value="Mexico">Mexico</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Germany">Germany</option>
            <option value="France">France</option>
            <option value="Spain">Spain</option>
            <option value="Italy">Italy</option>
            <option value="Australia">Australia</option>
            <option value="Japan">Japan</option>
          </select>
        </div>
        <Link href="/onboarding/step3">
          <button>Previous</button>
        </Link>
        <Link href="/onboarding/complete">
          <button>Complete Onboarding</button>
        </Link>
      </div>
    </main>
  );
}
