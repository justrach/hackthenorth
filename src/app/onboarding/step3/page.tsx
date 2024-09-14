"use client"
import { useOnboardingStore } from '@/src/app/store/onboardingStore';
import { BreadcrumbDemo } from '@/components/breadcrumbs/ui';
import Link from 'next/link';

export default function Step3() {
    const { gender,pseudoUsername, setPseudoUsername, dietaryRestrictions, setDietaryRestrictions } = useOnboardingStore()
  const handleDietaryRestrictionsChange = (e:any) => {
    const { value } = e.target;
    setDietaryRestrictions((prev:any) =>
      prev.includes(value)
        ? prev.filter((item:any) => item !== value)
        : [...prev, value]
    );
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center">
          <BreadcrumbDemo />
          {gender}
      <div className="space-y-6">
        <div className="space-y-1.5">
          <label htmlFor="pseudo">Pseudo Username</label>
          <input
            id="pseudo"
            placeholder="Enter your pseudo username"
            value={pseudoUsername}
            onChange={(e) => setPseudoUsername(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="dietary">Dietary Restrictions</label>
          <div>
            <label>
              <input
                type="checkbox"
                value="vegan"
                checked={dietaryRestrictions.includes('vegan')}
                onChange={handleDietaryRestrictionsChange}
              />
              Vegan
            </label>
            <label>
              <input
                type="checkbox"
                value="vegetarian"
                checked={dietaryRestrictions.includes('vegetarian')}
                onChange={handleDietaryRestrictionsChange}
              />
              Vegetarian
            </label>
            <label>
              <input
                type="checkbox"
                value="gluten-free"
                checked={dietaryRestrictions.includes('gluten-free')}
                onChange={handleDietaryRestrictionsChange}
              />
              Gluten-Free
            </label>
            <label>
              <input
                type="checkbox"
                value="nut-free"
                checked={dietaryRestrictions.includes('nut-free')}
                onChange={handleDietaryRestrictionsChange}
              />
              Nut-Free
            </label>
            <label>
              <input
                type="checkbox"
                value="other"
                checked={dietaryRestrictions.includes('other')}
                onChange={handleDietaryRestrictionsChange}
              />
              Other
            </label>
          </div>
        </div>
        <Link href="/onboarding/step2">
          <button>Previous</button>
        </Link>
        <Link href="/onboarding/step4">
          <button>Next</button>
        </Link>
      </div>
    </main>
  );
}
