"use client";

import Link from 'next/link';
import { CardTitle, CardDescription, CardHeader, CardContent, Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useOnboardingStore } from '@/src/app/store/onboardingStore';
import { BreadcrumbDemo } from '@/components/breadcrumbs/ui';

export default function Step1() {
  const { birthYear, setBirthYear, username, setUsername } = useOnboardingStore();

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-yellow-100 via-yellow-50 to-yellow-200 px-4 py-12 dark:from-yellow-900 dark:via-yellow-800 dark:to-yellow-700">
      <BreadcrumbDemo />
      <div className="mx-auto w-full max-w-md space-y-6">
        <Card className="space-y-6">
          <CardHeader>
            <CardTitle className="text-center">We are excited to follow your journey!</CardTitle>
            <CardDescription className="text-center text-gray-600 dark:text-gray-400">
              But we would like to know more about you!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-gray-800 dark:text-gray-200" htmlFor="birthYear">
                    Birth Year
                  </Label>
                  <Input id="birthYear" placeholder="Enter your birth year" type="number" value={birthYear} onChange={(e) => setBirthYear(e.target.value)} />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    We use this to personalize your experience.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-gray-800 dark:text-gray-200" htmlFor="username">
                    Username
                  </Label>
                  <Input id="username" placeholder="Enter your username" value={username} onChange={(e) => setUsername(e.target.value)} />
                  <p className="text-sm text-gray-500 dark:text-gray-400">This will be your public profile name.</p>
                </div>
              </div>
              <Link href="/onboarding/step2">
                <Button className="w-full bg-yellow-500 text-white hover:bg-yellow-600 dark:bg-yellow-700 dark:hover:bg-yellow-800">
                  Next
                </Button>
              </Link>
            </form>
          </CardContent>
        </Card>
        <div className="flex justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link className="underline" href="#">
            Privacy Policy
          </Link>
          <span>|</span>
          <Link className="underline" href="#">
            Terms of Use
          </Link>
        </div>
      </div>
    </main>
  );
}
