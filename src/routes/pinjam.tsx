import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/pinjam")({
  beforeLoad: () => {
    throw redirect({ to: "/keuangan" });
  },
});
