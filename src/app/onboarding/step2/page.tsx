"use client"
import Link from 'next/link';


import { CardTitle, CardDescription, CardHeader, CardContent, Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { SelectValue, SelectTrigger, SelectItem, SelectContent, Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useOnboardingStore } from '@/src/app/store/onboardingStore';
import { BreadcrumbDemo } from '@/components/breadcrumbs/ui';

export default function Step2() {
  const { gender, setGender, isRestaurantOwner, setIsRestaurantOwner } = useOnboardingStore();

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-yellow-100 via-yellow-50 to-yellow-200 px-4 py-12 dark:from-yellow-900 dark:via-yellow-800 dark:to-yellow-700">
      <BreadcrumbDemo />
{gender}{isRestaurantOwner}
      <div className="mx-auto w-full max-w-md space-y-6">
        <Card className="space-y-6">
          <CardHeader>
            <CardTitle className="text-center">We are excited to follow your journey!</CardTitle>
            {gender}{isRestaurantOwner.toString()}
            <CardDescription className="text-center text-gray-600 dark:text-gray-400">
              But we would like to know more about you!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-gray-800 dark:text-gray-200" htmlFor="gender">
                    Preferred Gender
                  </Label>
                  <Select value={gender} onValueChange={(value)=>setGender(value)}>
                    <SelectTrigger className="w-full" id="gender" >
                      <SelectValue placeholder="Select your preferred gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male" onSelect={() => setGender('male')}>Male</SelectItem>
                      <SelectItem value="female" onSelect={() => setGender('female')}>Female</SelectItem>
                      <SelectItem value="other" onSelect={() => setGender('other')}>Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-4">
                  <Label className="text-gray-800 dark:text-gray-200" htmlFor="restaurant">
                    Restaurant Owner
                  </Label>
                  <Switch id="restaurant" checked={isRestaurantOwner} onCheckedChange={(checked) => {
                    setIsRestaurantOwner(checked)
                    console.log(checked)} }>
                    {/* <div>Yes</div>
                    <div>No</div> */}
                  </Switch>
                </div>
              </div>
              <div className="flex justify-between">
                <Link href="/onboarding/step1">
                  <Button className="bg-gray-500 text-white hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-800">
                    Previous
                  </Button>
                </Link>
                <Link href="/onboarding/step3">
                  <Button className="bg-yellow-500 text-white hover:bg-yellow-600 dark:bg-yellow-700 dark:hover:bg-yellow-800">
                    Next
                  </Button>
                </Link>
              </div>
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
