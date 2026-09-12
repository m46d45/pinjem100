export async function saveChartPng(root: HTMLElement | null, filename: string): Promise<void> {
  if (!root || typeof window === "undefined") return;
  const svg = root.querySelector("svg");
  if (!svg) return;

  const rect = svg.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));
  const styles = getComputedStyle(document.documentElement);
  const card = styles.getPropertyValue("--color-card").trim() || "#ffffff";

  let xml = new XMLSerializer().serializeToString(svg);
  xml = xml.replace(/var\((--[\w-]+)\)/g, (_, name: string) => {
    return styles.getPropertyValue(name).trim() || "#111111";
  });
  if (!xml.includes("xmlns=")) {
    xml = xml.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  const blob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  await new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = 2;
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("canvas"));
        return;
      }
      ctx.fillStyle = card;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((out) => {
        if (!out) {
          reject(new Error("blob"));
          return;
        }
        const href = URL.createObjectURL(out);
        const a = document.createElement("a");
        a.href = href;
        a.download = filename.endsWith(".png") ? filename : `${filename}.png`;
        a.click();
        URL.revokeObjectURL(href);
        resolve();
      }, "image/png");
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image"));
    };
    img.src = url;
  });
}
