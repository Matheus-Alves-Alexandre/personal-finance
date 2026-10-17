import { forwardRef, useImperativeHandle } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, expect, it, vi } from "vitest";
import OnboardingPage from "./onboarding-page";

const mocks = vi.hoisted(() => ({ updateSettings: vi.fn().mockResolvedValue(undefined) }));
vi.mock("@/lib/connect-config", () => ({ CONNECT_ENABLED: false }));
vi.mock("@/hooks/use-settings", () => ({
  useSettings: () => ({ data: { onboardingCompleted: false }, isLoading: false }),
}));
vi.mock("@/hooks/use-platform", () => ({ usePlatform: () => ({ isMobile: false }) }));
vi.mock("@/lib/settings-provider", () => ({
  useSettingsContext: () => ({ updateSettings: mocks.updateSettings }),
}));
vi.mock("@/features/wealthfolio-connect/hooks/use-connect-url", () => ({
  useConnectUrl: () => "https://connect.example.test",
}));
vi.mock("./onboarding-step1", () => ({ OnboardingStep1: () => <div>Introduction</div> }));
vi.mock("./onboarding-step2", () => ({
  OnboardingStep2: forwardRef(function SettingsStep({ onNext }: { onNext: () => void }, ref) {
    useImperativeHandle(ref, () => ({ submitForm: onNext }));
    return <div>Language and currency</div>;
  }),
}));
vi.mock("./onboarding-appearance", () => ({
  OnboardingAppearance: forwardRef(function AppearanceStep(_, ref) {
    useImperativeHandle(ref, () => ({ submitForm: vi.fn() }));
    return <div>Appearance</div>;
  }),
}));
vi.mock("./onboarding-connect", () => ({
  OnboardingConnect: () => <div>Subscribe to Connect</div>,
}));

beforeEach(() => {
  mocks.updateSettings.mockClear();
});

it("finishes desktop setup after appearance without subscription offers when Connect is disabled", async () => {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <OnboardingPage />
    </MemoryRouter>,
  );
  await user.click(screen.getByTestId("onboarding-continue-button"));
  await screen.findByText("Language and currency");
  await user.click(screen.getByTestId("onboarding-continue-button"));
  await screen.findByText("Appearance");
  expect(screen.queryByText("Subscribe to Connect")).not.toBeInTheDocument();
  expect(screen.queryByRole("link", { name: /subscribe/i })).not.toBeInTheDocument();
  await user.click(screen.getByTestId("onboarding-finish-button"));
  expect(mocks.updateSettings).toHaveBeenCalledWith({ onboardingCompleted: true });
});
