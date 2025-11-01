import "dotenv/config";
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function generateSitemap() {
  const baseUrl = "https://educamais1.netlify.app"; // troque pelo seu domínio
  const { data: courses, error } = await supabase
    .from("courses")
    .select("id, updated_at");

  if (error) {
    console.error("Erro ao buscar cursos:", error);
    return;
  }

  const staticRoutes = [
    "",
    "/sobre",
    "/categorias",
    "/contato",
  ];

  const urls = courses.map(
  (c) => `
  <url>
    <loc>${baseUrl}/course/${c.id}</loc>
    <lastmod>${new Date(c.updated_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>`
);

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls.join('')}
  </urlset>`;

  const outputPath = path.join(process.cwd(), "public", "sitemap.xml");
  fs.writeFileSync(outputPath, sitemap);

  console.log(`✅ Sitemap gerado em: ${outputPath}`);
}

generateSitemap();
