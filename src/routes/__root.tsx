import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { StoreProvider } from "@/components/store-provider";
import appCss from "../styles.css?url";

const APP_NAME = "Pinjem100";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      {
        name: "description",
        content:
          "Laboratorium Virtual Simulasi Kas Proyek Konstruksi",
      },
      { name: "theme-color", content: "#2156A5" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: RootDocument,
});

function RootDocument() {
  return (
    <html lang="id" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="bg-background text-foreground font-sans">
        <PreviewHostBridge />
        <AuthProvider>
          <StoreProvider>
            <Outlet />
          </StoreProvider>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
