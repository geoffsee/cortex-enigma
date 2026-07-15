import { useState, useCallback, useEffect } from 'react';
import {
  ONBOARDING_KEY,
  ONBOARDING_SCHEMA_VERSION,
  OnboardingEnvelopeSchema,
} from '../../infrastructure/storageSchema';

function loadDismissed(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const raw = window.localStorage.getItem(ONBOARDING_KEY);
    if (!raw) return false;
    const result = OnboardingEnvelopeSchema.safeParse(JSON.parse(raw));
    return result.success ? result.data.dismissed : false;
  } catch {
    return false;
  }
}

function saveDismissed(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      ONBOARDING_KEY,
      JSON.stringify({ version: ONBOARDING_SCHEMA_VERSION, dismissed: true }),
    );
  } catch {
    // ignore quota / privacy-mode errors
  }
}

export function useOnboarding() {
  // Start hidden so SSR markup never includes the guide; a returning user who
  // already dismissed it therefore sees zero flash and zero added steps.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!loadDismissed()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- post-mount hydration keeps SSR markup stable
      setVisible(true);
    }
  }, []);

  const dismiss = useCallback(() => {
    setVisible(false);
    saveDismissed();
  }, []);

  return { onboardingVisible: visible, dismissOnboarding: dismiss };
}
