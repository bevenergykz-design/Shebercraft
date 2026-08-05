/**
 * SEO Update Script for Shebercraft Subpages
 * Tasks:
 *   1. Replace Google Fonts links with self-hosted font preloads
 *   2. Add OG + Twitter meta tags to all subpages
 *   3. Add BreadcrumbList Schema.org to 5 service pages
 *   4. Fix aria-hidden accessibility on ai-chat-window (tabindex="-1")
 */

import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('.');

// ─── URL mapping for OG tags ───
const urlMap = {
  '404.html': 'https://shebercraft.kz/404',
  'ai-chatbot/index.html': 'https://shebercraft.kz/ai-chatbot/',
  'bitrix24-start/index.html': 'https://shebercraft.kz/bitrix24-start/',
  'bitrix24-avtomatizaciya-bp/index.html': 'https://shebercraft.kz/bitrix24-avtomatizaciya-bp/',
  'landing-sait/index.html': 'https://shebercraft.kz/landing-sait/',
  'korporativnyy-sait/index.html': 'https://shebercraft.kz/korporativnyy-sait/',
  'seo-dashboard/index.html': 'https://shebercraft.kz/seo-dashboard/',
  'sozdanie-saitov/index.html': 'https://shebercraft.kz/sozdanie-saitov/',
  'blog/index.html': 'https://shebercraft.kz/blog/',
  'blog/ai-chatbot-dlya-kazakhstana/index.html': 'https://shebercraft.kz/blog/ai-chatbot-dlya-kazakhstana/',
  'blog/bitrix24-bp-vne-otdela-prodazh/index.html': 'https://shebercraft.kz/blog/bitrix24-bp-vne-otdela-prodazh/',
  'blog/bitrix24-vnedrenie-almaty-astana/index.html': 'https://shebercraft.kz/blog/bitrix24-vnedrenie-almaty-astana/',
  'blog/landing-vs-korporativnyy-sait/index.html': 'https://shebercraft.kz/blog/landing-vs-korporativnyy-sait/',
  'blog/skolko-stoit-sayt-v-kazakhstane/index.html': 'https://shebercraft.kz/blog/skolko-stoit-sayt-v-kazakhstane/',
  'cases/index.html': 'https://shebercraft.kz/cases/',
  'cases/legal-company/index.html': 'https://shebercraft.kz/cases/legal-company/',
  'cases/restaurant-bot/index.html': 'https://shebercraft.kz/cases/restaurant-bot/',
};

// ─── BreadcrumbList data for 5 service pages ───
const breadcrumbPages = {
  'ai-chatbot/index.html': 'AI чат-бот',
  'bitrix24-start/index.html': 'Битрикс24 Старт',
  'bitrix24-avtomatizaciya-bp/index.html': 'Автоматизация бизнес-процессов',
  'korporativnyy-sait/index.html': 'Корпоративный сайт',
  'seo-dashboard/index.html': 'SEO-дашборд',
};

// All HTML files except index.html
const allSubpages = Object.keys(urlMap);

const log = { task1: [], task2: [], task3: [], task4: [] };

for (const relPath of allSubpages) {
  const filePath = path.join(ROOT, relPath);
  if (!fs.existsSync(filePath)) {
    console.log(`SKIP (not found): ${relPath}`);
    continue;
  }

  let html = fs.readFileSync(filePath, 'utf8');
  const original = html;

  // ═══════════════════════════════════════════════
  // TASK 1: Replace Google Fonts with self-hosted
  // ═══════════════════════════════════════════════

  const fontReplacement = `  <link rel="preload" href="/assets/fonts/inter-400-cyrillic.woff2" as="font" type="font/woff2" crossorigin="anonymous" />\n  <link rel="preload" href="/assets/fonts/inter-400-latin.woff2" as="font" type="font/woff2" crossorigin="anonymous" />`;

  // Remove preconnect lines (some pages may not have them)
  const preconnectRegex = /\s*<link\s+rel="preconnect"\s+href="https:\/\/fonts\.googleapis\.com"\s*\/?\s*>\s*\n?/g;
  const preconnectGstaticRegex = /\s*<link\s+rel="preconnect"\s+href="https:\/\/fonts\.gstatic\.com"\s+crossorigin\s*\/?\s*>\s*\n?/g;

  html = html.replace(preconnectRegex, '\n');
  html = html.replace(preconnectGstaticRegex, '');

  // Replace the Google Fonts stylesheet link
  const googleFontsRegex = /\s*<link\s+href="https:\/\/fonts\.googleapis\.com\/css2\?[^"]*"\s+rel="stylesheet"\s*\/?\s*>/g;

  if (googleFontsRegex.test(html)) {
    html = html.replace(googleFontsRegex, '\n' + fontReplacement);
    log.task1.push(relPath);
  }

  // ═══════════════════════════════════════════════
  // TASK 2: Add OG + Twitter meta tags
  // ═══════════════════════════════════════════════

  const pageUrl = urlMap[relPath];

  // Extract title and description from the page
  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/);

  if (titleMatch && descMatch && pageUrl) {
    const pageTitle = titleMatch[1];
    const pageDesc = descMatch[1];

    // Check if page already has OG tags (sozdanie-saitov case)
    const hasOgTitle = /<meta\s+property="og:title"/.test(html);

    if (hasOgTitle) {
      // sozdanie-saitov: already has og:title, og:description, og:type, og:url
      // Need to add: og:site_name, og:image, og:image:width, og:image:height, og:locale, twitter tags
      // Insert right after existing og:url line
      const ogUrlLine = html.match(/\s*<meta\s+property="og:url"\s+content="[^"]*"\s*>[ \t]*/);
      if (ogUrlLine) {
        const supplementTags = `
  <meta property="og:site_name" content="Shebercraft" />
  <meta property="og:image" content="https://shebercraft.kz/assets/og-image.jpg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:locale" content="ru_RU" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${pageTitle}" />
  <meta name="twitter:description" content="${pageDesc}" />
  <meta name="twitter:image" content="https://shebercraft.kz/assets/og-image.jpg" />`;

        html = html.replace(ogUrlLine[0], ogUrlLine[0].trimEnd() + '\n' + supplementTags);
        log.task2.push(`${relPath} (supplemented existing OG)`);
      }
    } else {
      // No OG tags at all — add full set after <meta name="description"> line
      const ogTags = `\n  <meta property="og:url" content="${pageUrl}" />\n  <meta property="og:site_name" content="Shebercraft" />\n  <meta property="og:title" content="${pageTitle}" />\n  <meta property="og:description" content="${pageDesc}" />\n  <meta property="og:type" content="website" />\n  <meta property="og:image" content="https://shebercraft.kz/assets/og-image.jpg" />\n  <meta property="og:image:width" content="1200" />\n  <meta property="og:image:height" content="630" />\n  <meta property="og:locale" content="ru_RU" />\n  <meta name="twitter:card" content="summary_large_image" />\n  <meta name="twitter:title" content="${pageTitle}" />\n  <meta name="twitter:description" content="${pageDesc}" />\n  <meta name="twitter:image" content="https://shebercraft.kz/assets/og-image.jpg" />`;

      // Insert after the description meta tag
      const descTag = descMatch[0];
      html = html.replace(descTag, descTag + ogTags);
      log.task2.push(relPath);
    }
  }

  // ═══════════════════════════════════════════════
  // TASK 3: Add BreadcrumbList schema (5 service pages)
  // ═══════════════════════════════════════════════

  if (breadcrumbPages[relPath]) {
    const breadcrumbName = breadcrumbPages[relPath];
    const pageUrlForBreadcrumb = urlMap[relPath];

    // Find the existing <script type="application/ld+json">{ ... }</script> block
    // These pages have a single JSON object (not array), we need to wrap it in array with BreadcrumbList
    const ldJsonRegex = /(<script\s+type="application\/ld\+json">)([\s\S]*?)(<\/script>)/;
    const ldMatch = html.match(ldJsonRegex);

    if (ldMatch) {
      const existingJson = ldMatch[2].trim();

      // Only add if not already an array (already has BreadcrumbList)
      if (!existingJson.startsWith('[')) {
        const breadcrumbJson = `{
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {"@type": "ListItem", "position": 1, "name": "Главная", "item": "https://shebercraft.kz/"},
      {"@type": "ListItem", "position": 2, "name": "${breadcrumbName}", "item": "${pageUrlForBreadcrumb}"}
    ]
  }`;

        const newContent = `${ldMatch[1]}[\n  ${breadcrumbJson},\n  ${existingJson}\n]${ldMatch[3]}`;
        html = html.replace(ldMatch[0], newContent);
        log.task3.push(relPath);
      }
    }
  }

  // ═══════════════════════════════════════════════
  // TASK 4: Fix aria-hidden accessibility (tabindex="-1")
  // ═══════════════════════════════════════════════

  if (html.includes('ai-chat-window')) {
    let modified = false;

    // Add tabindex="-1" to <button class="ai-chat-close" (if not already there)
    if (html.includes('<button class="ai-chat-close"') && !html.match(/<button\s+class="ai-chat-close"[^>]*tabindex/)) {
      html = html.replace(
        /(<button\s+class="ai-chat-close")/g,
        '$1 tabindex="-1"'
      );
      modified = true;
    }

    // Add tabindex="-1" to <button class="ai-prompt-chip"
    if (html.includes('<button class="ai-prompt-chip"') && !html.match(/<button\s+class="ai-prompt-chip"[^>]*tabindex/)) {
      html = html.replace(
        /(<button\s+class="ai-prompt-chip")/g,
        '$1 tabindex="-1"'
      );
      modified = true;
    }

    // Add tabindex="-1" to <input type="text" class="ai-chat-input"
    if (html.includes('class="ai-chat-input"') && !html.match(/<input[^>]*class="ai-chat-input"[^>]*tabindex/)) {
      html = html.replace(
        /(<input\s+type="text"\s+class="ai-chat-input")/g,
        '$1 tabindex="-1"'
      );
      modified = true;
    }

    // Add tabindex="-1" to <button type="submit" class="ai-chat-send"
    if (html.includes('class="ai-chat-send"') && !html.match(/<button[^>]*class="ai-chat-send"[^>]*tabindex/)) {
      html = html.replace(
        /(<button\s+type="submit"\s+class="ai-chat-send")/g,
        '$1 tabindex="-1"'
      );
      modified = true;
    }

    if (modified) {
      log.task4.push(relPath);
    }
  }

  // ═══════════════════════════════════════════════
  // Write back if changed
  // ═══════════════════════════════════════════════
  if (html !== original) {
    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`✅ Updated: ${relPath}`);
  } else {
    console.log(`⏭️  No changes: ${relPath}`);
  }
}

console.log('\n═══ SUMMARY ═══');
console.log(`Task 1 (Google Fonts → self-hosted): ${log.task1.length} files`);
log.task1.forEach(f => console.log(`  • ${f}`));
console.log(`Task 2 (OG/Twitter meta tags): ${log.task2.length} files`);
log.task2.forEach(f => console.log(`  • ${f}`));
console.log(`Task 3 (BreadcrumbList schema): ${log.task3.length} files`);
log.task3.forEach(f => console.log(`  • ${f}`));
console.log(`Task 4 (tabindex="-1" accessibility): ${log.task4.length} files`);
log.task4.forEach(f => console.log(`  • ${f}`));
console.log('\nDone!');
