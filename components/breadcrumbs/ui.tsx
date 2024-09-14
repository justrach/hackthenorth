"use client"
import { useParams, usePathname } from 'next/navigation'
import React from "react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../ui/breadcrumb';
  
  const steps = [
    { path: '/onboarding/step1', label: 'Step 1' },
    { path: '/onboarding/step2', label: 'Step 2' },
    { path: '/onboarding/step3', label: 'Step 3' },
    { path: '/onboarding/step4', label: 'Step 4' },
    { path: '/onboarding/complete', label: 'Complete' },
  ];
  
  export function BreadcrumbDemo() {
    const params = usePathname()
    const currentStep = steps.findIndex(step => step.path === params.toString());
  
    return (
        <>
        {/* {JSON.stringify(params)} */}
        {currentStep}
      <Breadcrumb>
        <BreadcrumbList>
          {steps.map((step, index) => (
            <React.Fragment key={step.path}>
              <BreadcrumbItem>
                {index <= currentStep ? (
                  <BreadcrumbLink href={step.path}>{step.label}</BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{step.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {index < steps.length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb></>
    );
  }
  