"use client";

import { Button } from "@/components/ui/button";
import {
  Authenticated,
  Unauthenticated,
  useMutation,
  useQuery,
} from "convex/react";
import { api } from "@/src/convex/_generated/api";
import { Code } from "@/components/typography/code";
import { Link } from "@/components/typography/link";
import { SignInButton, SignUpButton, UserButton } from "@clerk/clerk-react";
import { StickyHeader } from "@/components/layout/sticky-header";
import { Skeleton } from "@/components/ui/skeleton";
import { OnBoardingPage } from "@/components/on-boarding-page";
import { useEffect, useState } from "react";
import { useOnboardingStore } from "./store/onboardingStore";
import Step1 from "./onboarding/step1/page";

export default function Home() {
  const { setUserId, setIsOnboardingComplete, isOnboardingComplete } = useOnboardingStore();
  const { user_data } =
    useQuery(api.userFunctions.user_data, {
      count: 1,
    }) ?? {};
    const init_user = useMutation(api.userFunctions.init_user);
    useEffect(() => {
      if (user_data && user_data.length > 0) {
        const userId = user_data[0].id;
        const isOnboardingComplete = user_data[0].isOnboaded;
  
        setUserId(userId!);
        setIsOnboardingComplete(isOnboardingComplete!);
      } else {
        void init_user();
      }
    }, [user_data, setUserId, setIsOnboardingComplete, init_user]);
  return (
    <>
      <StickyHeader className="px-4 py-2">
        <div className="flex justify-between items-center">
          foodbook.ai
          <SignInAndSignUpButtons />
        </div>
      </StickyHeader>
      <main>
        <>
        {/* remove the tags from main and kept them out of here */}
        {/* <div  className="container max-w-2xl flex flex-col gap-8"></div> */}
        {/* <h1 className="text-4xl font-extrabold my-8 text-center">
          Convex + Next.js + Clerk Auth
        </h1> */}
<Authenticated>
          {isOnboardingComplete ? (
            <p>Welcome to Foodbook.ai!</p>
          ) : (
            <Step1 />
          // <OnBoardingPage></OnBoardingPage> 
          )}
        </Authenticated>

        {/* <Authenticated> */}
          {/* <SignedInContent /> */}
          {/* <OnBoardingPage></OnBoardingPage> */}
        {/* </Authenticated> */}
        <Unauthenticated>
          <p>Click one of the buttons in the top right corner to sign in.</p>
        </Unauthenticated></>
      </main>
    </>
  );
}

function SignInAndSignUpButtons() {
  return (
    <div className="flex gap-4">
      <Authenticated>
        <UserButton afterSignOutUrl="/" />
      </Authenticated>
      <Unauthenticated>
        <SignInButton mode="modal">
          <Button >Sign in</Button>
        </SignInButton>
        <SignUpButton mode="modal">
          <Button>Sign up</Button>
        </SignUpButton>
      </Unauthenticated>
    </div>
  );
}

function SignedInContent() {

  const { viewer, numbers, user } =
    useQuery(api.myFunctions.listNumbers, {
      count: 10,
    }) ?? {};
    const { restaurants } =
    useQuery(api.myFunctions.listRestaurants, {
      count: 10,
    }) ?? {};
    const { user_data } =
    useQuery(api.userFunctions.user_data, {
      count: 1,
    }) ?? {};
    const init_user = useMutation(api.userFunctions.init_user);
    useEffect(() => {
      void init_user();
    }
    , []);

  const addNumber = useMutation(api.myFunctions.addNumber);

  if ( viewer === undefined || numbers === undefined || restaurants === undefined) {
    return (
      <>
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
      </>
    );
  }

  return (
    <>
    {JSON.stringify(user_data![0].id)}
      <p>Welcome {viewer ?? "N/A"}!</p>
      <p>
        Click the button below and open this page in another window - this data
        is persisted in the Convex cloud database!
      </p>
      <p>
        <Button
          onClick={() => {
            void addNumber({ value: Math.floor(Math.random() * 10) });
          }}
        >
          Add a random number
        </Button>
      </p>
      <p>
        Numbers:{" "}
        {numbers?.length === 0
          ? "Click the button!"
          : numbers?.join(", ") ?? "..."}
      </p>
      <p>
        Edit <Code>convex/myFunctions.ts</Code> to change your backend
      </p>
      <p>
        Edit <Code>app/page.tsx</Code> to change your frontend
      </p>
      <p>
        Check out{" "}
        <Link target="_blank" href="https://docs.convex.dev/home">
          Convex docs
        </Link>
      </p>
      <p>
        To build a full page layout copy one of the included{" "}
        <Link target="_blank" href="/layouts">
          layouts
        </Link>
      </p>
    </>
  );
}
