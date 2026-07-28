import type { MetadataRoute } from "next";

const baseUrl = "https://www.diasmath.com.br";

const routes = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" },
  { path: "/play", priority: 0.9, changeFrequency: "weekly" },
  { path: "/labs", priority: 0.9, changeFrequency: "weekly" },
  { path: "/atividades", priority: 0.8, changeFrequency: "weekly" },
  { path: "/contato", priority: 0.7, changeFrequency: "monthly" },

  { path: "/play/guardioes-multiplicacao", priority: 0.8, changeFrequency: "monthly" },
  { path: "/play/guardioes-divisao", priority: 0.8, changeFrequency: "monthly" },
  { path: "/play/arena-revisao", priority: 0.8, changeFrequency: "monthly" },

  { path: "/labs/subtracao", priority: 0.8, changeFrequency: "monthly" },
  { path: "/labs/divisao", priority: 0.8, changeFrequency: "monthly" },
  { path: "/labs/geotessela", priority: 0.8, changeFrequency: "monthly" },
  { path: "/labs/prancha-trigonometrica", priority: 0.8, changeFrequency: "monthly" },
  { path: "/labs/xadrez", priority: 0.8, changeFrequency: "monthly" },
  { path: "/labs/integraz", priority: 0.8, changeFrequency: "monthly" },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
