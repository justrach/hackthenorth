// stores/onboardingStore.ts
import create from 'zustand';

interface OnboardingState {
  userId: string;
  isOnboardingComplete: boolean;
  birthYear: string;
  username: string;
  gender: string;
  isRestaurantOwner: boolean;
  pseudoUsername: string;
  dietaryRestrictions: string[];
  country: string;
  setUserId: (userId: string) => void;
  setIsOnboardingComplete: (isOnboardingComplete: boolean) => void;
  setBirthYear: (birthYear: string) => void;
  setUsername: (username: string) => void;
  setGender: (gender: string) => void;
  setIsRestaurantOwner: (isRestaurantOwner: boolean) => void;
  setPseudoUsername: (pseudoUsername: string) => void;
  setDietaryRestrictions: (dietaryRestrictions: string[]) => void;
  setCountry: (country: string) => void;
  resetOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  userId: '',
  isOnboardingComplete: false,
  birthYear: '',
  username: '',
  gender: '',
  isRestaurantOwner: false,
  pseudoUsername: '',
  dietaryRestrictions: [],
  country: '',
  setUserId: (userId) => set({ userId }),
  setIsOnboardingComplete: (isOnboardingComplete) => set({ isOnboardingComplete }),
  setBirthYear: (birthYear) => set({ birthYear }),
  setUsername: (username) => set({ username }),
  setGender: (gender) => set({ gender }),
  setIsRestaurantOwner: (isRestaurantOwner) => set({ isRestaurantOwner }),
  setPseudoUsername: (pseudoUsername) => set({ pseudoUsername }),
  setDietaryRestrictions: (dietaryRestrictions) => set({ dietaryRestrictions }),
  setCountry: (country) => set({ country }),
  resetOnboarding: () =>
    set({
      userId: '',
      isOnboardingComplete: false,
      birthYear: '',
      username: '',
      gender: '',
      isRestaurantOwner: false,
      pseudoUsername: '',
      dietaryRestrictions: [],
      country: '',
    }),
}));
