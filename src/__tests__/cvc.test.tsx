import { fireEvent, render, screen } from "@testing-library/react";
import App from "../App";

describe("CVC Tests", () => {
  it("should show error text if invalid CVC is provided", () => {
    render(<App />);
    const inputEl: HTMLInputElement = screen.getByTestId("cvcEl");
    fireEvent.change(inputEl, { target: { value: "12" } });

    const errorEl = screen.getByTestId("cvcErrorEl");
    expect(errorEl).toBeInTheDocument();
  });

  it("should show error text if CVC is not provided", () => {
    render(<App />);
    const inputEl: HTMLInputElement = screen.getByTestId("cvcEl");
    fireEvent.change(inputEl, { target: { value: "" } });

    const errorEl = screen.getByTestId("cvcErrorEl");
    expect(errorEl).toBeInTheDocument();
  });
});
