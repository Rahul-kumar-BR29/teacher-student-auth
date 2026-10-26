import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders the RRID login page", () => {
  render(<App />);

  expect(
    screen.getByRole("heading", { name: /welcome back/i }),
  ).toBeInTheDocument();

  expect(
    screen.getByText(/log in to continue to your dashboard/i),
  ).toBeInTheDocument();
});
