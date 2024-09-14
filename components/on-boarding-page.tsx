
import { CardTitle, CardDescription, CardHeader, CardContent, Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { SelectValue, SelectTrigger, SelectItem, SelectContent, Select } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { PopoverTrigger, PopoverContent, Popover } from "@/components/ui/popover"
import { CommandInput, CommandEmpty, CommandItem, CommandGroup, Command } from "@/components/ui/command"
import Link from "next/link"

export function OnBoardingPage() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-yellow-100 via-yellow-50 to-yellow-200 px-4 py-12 dark:from-yellow-900 dark:via-yellow-800 dark:to-yellow-700">
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
                  <Input id="birthYear" placeholder="Enter your birth year" type="number" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    We use this to personalize your experience.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-gray-800 dark:text-gray-200" htmlFor="username">
                    Username
                  </Label>
                  <Input id="username" placeholder="Enter your username" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">This will be your public profile name.</p>
                </div>
                <div className="w-full space-y-1.5">
                  <Label className="text-gray-800 dark:text-gray-200" htmlFor="gender">
                    Preferred Gender
                  </Label>
                  <Select>
                    <SelectTrigger className="w-full" id="gender">
                      <SelectValue placeholder="Select your preferred gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-4">
                  <Label className="text-gray-800 dark:text-gray-200" htmlFor="restaurant">
                    Restaurant Owner
                  </Label>
                  <Switch id="restaurant">
                    <div>Yes</div>
                    <div>No</div>
                  </Switch>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-800 dark:text-gray-200" htmlFor="pseudo">
                  Pseudo Username
                </Label>
                <Input id="pseudo" placeholder="Enter your pseudo username" />
                <p className="text-sm text-gray-500 dark:text-gray-400">This will be your private username.</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-800 dark:text-gray-200" htmlFor="dietary">
                  Dietary Restrictions
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button className="w-full justify-between" role="combobox" variant="outline">
                      Select dietary restrictions...
                      <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput className="h-9" placeholder="Search dietary restrictions..." />
                      <CommandEmpty>No dietary restrictions found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem value="vegan">Vegan</CommandItem>
                        <CommandItem value="vegetarian">Vegetarian</CommandItem>
                        <CommandItem value="gluten-free">Gluten-Free</CommandItem>
                        <CommandItem value="nut-free">Nut-Free</CommandItem>
                        <CommandItem value="other">Other</CommandItem>
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <p className="text-sm text-gray-500 dark:text-gray-400">We'll use this to accommodate your needs.</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-800 dark:text-gray-200" htmlFor="country">
                  Country
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button className="w-full justify-between" role="combobox" variant="outline">
                      Select country...
                      <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput className="h-9" placeholder="Search country..." />
                      <CommandEmpty>No country found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem>United States</CommandItem>
                        <CommandItem>Canada</CommandItem>
                        <CommandItem>Mexico</CommandItem>
                        <CommandItem>United Kingdom</CommandItem>
                        <CommandItem>Germany</CommandItem>
                        <CommandItem>France</CommandItem>
                        <CommandItem>Spain</CommandItem>
                        <CommandItem>Italy</CommandItem>
                        <CommandItem>Australia</CommandItem>
                        <CommandItem>Japan</CommandItem>
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  We'll use this to provide relevant information.
                </p>
              </div>
              <div className="w-full space-y-1.5">
                <Label className="text-gray-800 dark:text-gray-200" htmlFor="gender">
                  Gender
                </Label>
                <Select>
                  <SelectTrigger className="w-full" id="gender">
                    <SelectValue placeholder="Select your gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full bg-yellow-500 text-white hover:bg-yellow-600 dark:bg-yellow-700 dark:hover:bg-yellow-800"
                type="submit"
              >
                Complete Onboarding
              </Button>
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
  )
}

function ChevronsUpDownIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m7 15 5 5 5-5" />
      <path d="m7 9 5-5 5 5" />
    </svg>
  )
}
