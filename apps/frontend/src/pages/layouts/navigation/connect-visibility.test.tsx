import { render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import common from "@/i18n/locales/en/common.json";
import { AppSidebar } from "./app-sidebar";
import { FloatingNavigationBar } from "./floating-navigation-bar";
import { MobileNavBar } from "./mobile-navbar";
import { useNavigation } from "./app-navigation";

vi.mock("@/addons/addons-runtime-context", () => ({
  getDynamicNavItems: () => [],
  subscribeToNavigationUpdates: () => vi.fn(),
}));
vi.mock("./addon-navigation-pins", () => ({
  getAddonNavPinKey: (item: { href: string }) => item.href,
  useAddonNavigationPins: () => ({
    hasConfiguredAddonPins: false,
    pinnedAddonIdSet: new Set(),
    setPinnedAddonIds: vi.fn(),
  }),
}));

const config = vi.hoisted(() => ({ enabled: false }));
vi.mock("@/lib/connect-config", () => ({
  get CONNECT_ENABLED() {
    return config.enabled;
  },
}));
vi.mock("@/adapters", () => ({ isWeb: false }));
vi.mock("@/context/auth-context", () => ({
  useAuth: () => ({ requiresAuth: false, logout: vi.fn() }),
}));
vi.mock("@/features/profiles/profile-menu", () => ({ ProfileMenu: () => null }));
vi.mock("@/features/profiles/profile-context", () => ({ useProfile: () => null }));
vi.mock("@/features/profiles/mobile-profile-menu", () => ({ MobileProfileMenu: () => null }));
vi.mock("@/hooks/use-haptic-feedback", () => ({
  useHapticFeedback: () => ({ triggerHaptic: vi.fn() }),
}));
vi.mock("@/features/wealthfolio-connect/hooks", () => ({
  useAggregatedSyncStatus: () => ({ status: "not_connected", lastSyncTime: null }),
}));

const navigation = {
  primary: [{ title: "Dashboard", href: "/dashboard" }],
  secondary: [{ title: "Settings", href: "/settings" }],
};

beforeEach(() => {
  config.enabled = false;
});

describe("Connect visibility", () => {
  it("keeps financial navigation available without an assistant entry", () => {
    const { result } = renderHook(() => useNavigation());
    render(
      <MemoryRouter>
        <AppSidebar navigation={result.current} />
      </MemoryRouter>,
    );
    expect(screen.getByRole("link", { name: common.dashboard })).toHaveAttribute(
      "href",
      "/dashboard",
    );
    expect(screen.getByRole("link", { name: common.activities })).toHaveAttribute(
      "href",
      "/activities",
    );
    expect(screen.queryByRole("link", { name: common.assistant })).not.toBeInTheDocument();
  });
  it.each([
    ["sidebar", AppSidebar],
    ["floating bar", FloatingNavigationBar],
    ["phone menu", MobileNavBar],
  ])(
    "keeps local navigation available without a Connect promotion in the %s",
    async (_, Component) => {
      render(
        <MemoryRouter>
          <Component navigation={navigation} />
        </MemoryRouter>,
      );
      expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute("href", "/dashboard");
      if (Component === MobileNavBar) {
        await userEvent.click(screen.getByRole("button", { name: common.layout.more_options }));
      }
      expect(screen.getByRole("link", { name: "Settings" })).toHaveAttribute("href", "/settings");
      expect(screen.queryByRole("link", { name: /^Connect$/i })).not.toBeInTheDocument();
    },
  );

  it("retains the Connect entry for explicitly configured source builds", () => {
    config.enabled = true;
    render(
      <MemoryRouter>
        <FloatingNavigationBar navigation={navigation} />
      </MemoryRouter>,
    );
    expect(screen.getByRole("link", { name: /^Connect$/i })).toHaveAttribute("href", "/connect");
  });
});
