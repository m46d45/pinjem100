import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/akumulasi")({
  beforeLoad: () => {
    throw redirect({ to: "/portofolio" });
  },
});
