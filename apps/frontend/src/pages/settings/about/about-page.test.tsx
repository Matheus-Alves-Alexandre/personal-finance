import { render, screen, waitFor } from "@/test/render";
import { MemoryRouter } from "react-router-dom";
import { expect, it, vi } from "vitest";
import AboutSettingsPage from "./about-page";

vi.mock("@/adapters", () => ({
  getAppInfo: vi.fn().mockResolvedValue({ version: "3.10.0", dbPath: "", logsDir: "" }),
  openUrlInBrowser: vi.fn(),
}));
vi.mock("@/hooks/use-platform", () => ({ usePlatform: () => ({ isMobile: false }) }));
vi.mock("@/hooks/use-updater", () => ({
  useCheckForUpdates: () => ({ mutate: vi.fn(), isPending: false }),
}));

it("identifies the personal fork, routes support to its repository and retains upstream credit", async () => {
  render(
    <MemoryRouter>
      <AboutSettingsPage />
    </MemoryRouter>,
  );
  expect(screen.getByText("Personal Finance", { exact: true })).toBeInTheDocument();
  const project = "https://github.com/Matheus-Alves-Alexandre/personal-finance";
  await waitFor(() => expect(screen.getByText(/3\.10\.0/)).toBeInTheDocument());
  expect(screen.getByRole("link", { name: "Report Issue" })).toHaveAttribute(
    "href",
    `${project}/issues`,
  );
  expect(screen.getByRole("link", { name: "Wealthfolio" })).toHaveAttribute(
    "href",
    "https://github.com/wealthfolio/wealthfolio",
  );
  expect(screen.getByRole("link", { name: "AGPL-3.0" })).toHaveAttribute(
    "href",
    `${project}/blob/main/LICENSE`,
  );
  expect(screen.queryByRole("link", { name: "Email Us" })).not.toBeInTheDocument();
});
