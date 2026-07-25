/**
 * OrbitSwap Pro - Component Tests
 *
 * Tests for UI components to verify they render correctly.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { Skeleton } from "../components/ui/Skeleton";

// ─── Button Tests ──────────────────────────────────────────────────────────

describe("Button", () => {
  it("renders with text", () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText("Click Me")).toBeDefined();
  });

  it("renders with loading state", () => {
    const { container } = render(<Button isLoading>Loading</Button>);
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeTruthy();
  });

  it("applies disabled state", () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByText("Disabled").closest("button");
    expect(button?.disabled).toBe(true);
  });

  it("renders with variant classes", () => {
    const { container } = render(<Button variant="primary">Primary</Button>);
    const button = container.querySelector("button");
    expect(button?.className).toContain("indigo");
  });

  it("renders with icon", () => {
    render(<Button icon={<span>💰</span>}>With Icon</Button>);
    expect(screen.getByText("💰")).toBeDefined();
  });
});

// ─── Badge Tests ───────────────────────────────────────────────────────────

describe("Badge", () => {
  it("renders with text", () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText("Active")).toBeDefined();
  });

  it("applies variant styles", () => {
    const { container } = render(<Badge variant="success">Success</Badge>);
    const badge = container.querySelector("span");
    const className = badge?.getAttribute("class") || "";
    expect(className).toContain("green");
  });

  it("renders dot indicator", () => {
    const { container } = render(<Badge dot>Live</Badge>);
    const dot = container.querySelector("span > span");
    expect(dot).toBeTruthy();
  });
});

// ─── Card Tests ────────────────────────────────────────────────────────────

describe("Card", () => {
  it("renders children", () => {
    render(<Card><p>Card Content</p></Card>);
    expect(screen.getByText("Card Content")).toBeDefined();
  });

  it("applies padding classes", () => {
    const { container } = render(<Card padding="lg">Large Card</Card>);
    const card = container.firstChild as HTMLElement;
    const className = card?.getAttribute("class") || "";
    expect(className).toContain("p-7");
  });

  it("is clickable with onClick", () => {
    const { container } = render(<Card onClick={() => {}}>Clickable</Card>);
    const card = container.firstChild as HTMLElement;
    const className = card?.getAttribute("class") || "";
    expect(className).toContain("cursor-pointer");
  });
});

// ─── LoadingSpinner Tests ──────────────────────────────────────────────────

describe("LoadingSpinner", () => {
  it("renders with default size", () => {
    const { container } = render(<LoadingSpinner />);
    const svg = container.querySelector("svg");
    const className = svg?.getAttribute("class") || "";
    expect(className).toContain("h-8");
  });

  it("renders with small size", () => {
    const { container } = render(<LoadingSpinner size="sm" />);
    const svg = container.querySelector("svg");
    const className = svg?.getAttribute("class") || "";
    expect(className).toContain("h-4");
  });

  it("has accessible label", () => {
    render(<LoadingSpinner label="Loading data..." />);
    expect(screen.getByText("Loading data...")).toBeDefined();
  });

  it("has role status", () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.firstChild;
    expect((spinner as HTMLElement)?.getAttribute("role")).toBe("status");
  });
});

// ─── Skeleton Tests ────────────────────────────────────────────────────────

describe("Skeleton", () => {
  it("renders with default variant", () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.firstChild as HTMLElement;
    const cls = skeleton?.getAttribute("class") || "";
    expect(cls).toContain("animate-pulse");
  });

  it("renders multiple skeletons", () => {
    const { container } = render(<Skeleton count={3} />);
    const skeletons = container.children;
    expect(skeletons.length).toBe(3);
  });

  it("applies circular variant", () => {
    const { container } = render(<Skeleton variant="circular" />);
    const skeleton = container.firstChild as HTMLElement;
    const className = skeleton?.getAttribute("class") || "";
    expect(className).toContain("rounded-full");
  });
});
