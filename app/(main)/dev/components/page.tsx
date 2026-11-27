import { notFound } from "next/navigation";
import ComponentsHarness from "./ComponentsHarness";

export default function ComponentsPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <ComponentsHarness />;
}
