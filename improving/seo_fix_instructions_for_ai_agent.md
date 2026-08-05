# Инструкция для AI-агента: исправление SEO-проблем сайта shebercraft.kz

**Версия:** 1.0 | **Дата аудита:** 31 июля 2026 г.  
**Назначение:** пошаговое руководство для AI-агента с доступом к исходному коду сайта shebercraft.kz (Netlify/Next.js или аналог).  
**Язык разработки:** определить по репозиторию; ниже примеры для Next.js/React с поддержкой Hugo/статических генераторов там, где применимо.

---

## ПЕРЕД НАЧАЛОМ РАБОТЫ

### Что обязательно сделать первым шагом

1. **Изучи структуру проекта** — определи фреймворк (Next.js, Gatsby, Hugo, чистый HTML и т.д.), расположение файлов шаблонов, конфигурационные файлы.
2. **Найди файлы**, в которых прописаны мета-теги: `<head>`, layout-компоненты, файлы `_document.js` / `layout.tsx` / `base.html` / `head.html`.
3. **Найди файлы шрифтов** — где подключаются Google Fonts (скорее всего в `<head>` или CSS).
4. **Найди `robots.txt`** и **`sitemap.xml`** (или генератор sitemap).
5. **Найди Schema.org JSON-LD блоки** — скорее всего в layout-файлах или в скриптах.
6. Прежде чем вносить изменения — **создай резервную ветку** (`git checkout -b seo-fixes`) или убедись, что есть возможность откатиться.

---

## БЛОК 1 — ВЫСОКИЙ ПРИОРИТЕТ 🔴

### Задача 1.1: Добавить Open Graph и Twitter Cards мета-теги

**Проблема:** отсутствуют `og:image`, `og:url`, `og:site_name` и все Twitter Cards. При отправке ссылки в Telegram, WhatsApp, Instagram и других платформах — нет превью-картинки. Это самый слабый раздел аудита (23/100).

#### Шаг 1 — Подготовить OG-изображение

- Создай или попроси предоставить изображение размером **1200×630 px** (JPG или PNG, не более 1 МБ).
- Назови файл `og-image.jpg` (или `og-image.png`).
- Размести файл в публичной директории: `/public/og-image.jpg` (для Next.js) или `/static/og-image.jpg` (для Hugo/Gatsby).
- Убедись, что файл доступен по абсолютному URL: `https://placehold.co/1200x600/e2e8f0/1e293b?text=Open_Graph_social_media_preview_image_sized_1200x6`.

#### Шаг 2 — Добавить мета-теги на главную страницу и в базовый layout

Найди файл базового layout (например, `app/layout.tsx`, `pages/_app.js`, `layouts/base.html`) и добавь следующие теги внутрь `<head>`:

```html
<!-- Open Graph / Facebook / Telegram / WhatsApp -->
<meta property="og:type" content="website" />
<meta property="og:url" content="https://shebercraft.kz/" />
<meta property="og:site_name" content="Shebercraft" />
<meta property="og:title" content="Shebercraft — Цифровые решения для бизнеса Казахстана" />
<meta property="og:description" content="Создаём сайты, внедряем CRM Битрикс24 и разрабатываем AI чат-боты для бизнеса в Казахстане. Запуск от 49 000 ₸. Алматы, Астана." />
<meta property="og:image" content="https://placehold.co/1200x600/e2e8f0/1e293b?text=Shebercraft_branding_image_for_digital_business_so" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="Shebercraft — цифровые решения для бизнеса Казахстана" />
<meta property="og:locale" content="ru_RU" />

<!-- Twitter Cards -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@shebercraft" />
<meta name="twitter:title" content="Shebercraft — Цифровые решения для бизнеса Казахстана" />
<meta name="twitter:description" content="Создаём сайты, внедряем CRM Битрикс24 и разрабатываем AI чат-боты для бизнеса в Казахстане. Запуск от 49 000 ₸." />
<meta name="twitter:image" content="https://placehold.co/1200x600/e2e8f0/1e293b?text=Shebercraft_branding_image_representing_digital_bu" />
<meta name="twitter:image:alt" content="Shebercraft — цифровые решения для бизнеса Казахстана" />
```

> **Если используется Next.js 13+ с App Router** — используй объект `metadata` в `app/layout.tsx`:
>
> ```typescript
> export const metadata: Metadata = {
>   metadataBase: new URL('https://shebercraft.kz'),
>   openGraph: {
>     type: 'website',
>     url: 'https://shebercraft.kz/',
>     siteName: 'Shebercraft',
>     title: 'Shebercraft — Цифровые решения для бизнеса Казахстана',
>     description: 'Создаём сайты, внедряем CRM Битрикс24 и разрабатываем AI чат-боты...',
>     images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Shebercraft' }],
>     locale: 'ru_RU',
>   },
>   twitter: {
>     card: 'summary_large_image',
>     title: 'Shebercraft — Цифровые решения для бизнеса Казахстана',
>     description: 'Создаём сайты, внедряем CRM Битрикс24...',
>     images: ['/og-image.jpg'],
>   },
> }
> ```

#### Шаг 3 — Добавить уникальные OG-теги для ключевых подстраниц

Для каждой страницы-услуги (`og:url` и `og:title` должны совпадать с реальным URL и title страницы):

| Страница | og:url | og:title |
|---|---|---|
| `/landing-sait/` | `https://shebercraft.kz/landing-sait/` | «Создание Landing Page в Казахстане — Shebercraft» |
| `/korporativnyy-sait/` | `https://shebercraft.kz/korporativnyy-sait/` | «Корпоративный сайт под ключ — Shebercraft» |
| `/ai-chatbot/` | `https://shebercraft.kz/ai-chatbot/` | «AI чат-боты для WhatsApp и Telegram — Shebercraft» |
| `/seo-dashboard/` | `https://shebercraft.kz/seo-dashboard/` | «SEO-дашборд для бизнеса Казахстана — Shebercraft» |
| `/bitrix24-start/` | `https://shebercraft.kz/bitrix24-start/` | «Внедрение Битрикс24 — Shebercraft» |

Для каждой страницы `og:image` можно использовать общий `/og-image.jpg` или создать уникальные изображения (опционально, более высокое качество).

#### Шаг 4 — Проверка

После деплоя проверить через:
- https://developers.facebook.com/tools/debug/ (Open Graph Debugger)
- https://cards-dev.twitter.com/validator (Twitter Card Validator)
- https://t.me/username — отправить ссылку в Telegram и убедиться, что превью отображается

---

### Задача 1.2: Ускорить мобильную загрузку (LCP 4.2с → цель < 2.5с)

**Проблема:** мобильный Performance 74/100. LCP 4,2 с, FCP 4,0 с. Главная причина — **блокирующая загрузка шрифтов Google Fonts** (~2 750 мс потенциальной экономии). Три семейства: Inter, Plus Jakarta Sans, JetBrains Mono.

#### Шаг 1 — Самоsthost шрифтов (РЕКОМЕНДУЕМЫЙ способ)

Это самое эффективное решение — загружать шрифты с собственного сервера, без обращения к `fonts.googleapis.com`.

1. Перейди на https://google-webfonts-helper.herokuapp.com/ или https://gwfh.mranftl.com/fonts
2. Скачай файлы шрифтов Inter, Plus Jakarta Sans и JetBrains Mono (только нужные начертания, обычно Regular 400, Bold 700 — уточни, какие реально используются на сайте).
3. Размести `.woff2`-файлы (приоритет — woff2, woff опционально) в директории `/public/fonts/` или `/static/fonts/`.
4. В CSS замени `@import url('https://fonts.googleapis.com/...')` на локальные `@font-face`:

```css
/* Inter */
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-display: swap;  /* ОБЯЗАТЕЛЬНО — предотвращает блокировку рендеринга */
  src: url('/fonts/inter-v13-latin-regular.woff2') format('woff2');
}

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('/fonts/inter-v13-latin-700.woff2') format('woff2');
}

/* Повторить для Plus Jakarta Sans и JetBrains Mono */
```

5. **Удали** все `<link>` теги на `fonts.googleapis.com` и `fonts.gstatic.com` из `<head>`.
6. **Удали** `@import url('https://fonts.googleapis.com/...')` из CSS-файлов.

#### Шаг 2 — Добавить preload для критичных шрифтов

В `<head>` перед всеми стилями добавь preload для шрифта основного текста (Inter Regular):

```html
<link
  rel="preload"
  href="/fonts/inter-v13-latin-regular.woff2"
  as="font"
  type="font/woff2"
  crossorigin="anonymous"
/>
```

> Preload только для 1–2 самых критичных шрифтов. Не добавляй preload для всех — это замедлит загрузку.

#### Шаг 3 — Сократить количество начертаний

Проверь в коде, какие начертания (`font-weight`) реально используются. Типично нужны только 400 и 600 или 700. Удали загрузку всех лишних вариантов (300, 500, 800, 900 и italic-варианты, если они нигде не применяются). Каждое начертание — отдельный HTTP-запрос и лишние байты.

#### Шаг 4 — Откладывание некритичных стилей и скриптов

Найди в `<head>` любые `<link rel="stylesheet">` и `<script>` теги, которые не нужны для отрисовки первого экрана:

- CSS-файлы — если они не критичны для первого экрана, загружай через `media="print" onload="this.media='all'"`:
  ```html
  <link rel="stylesheet" href="/styles/non-critical.css" media="print" onload="this.media='all'" />
  <noscript><link rel="stylesheet" href="/styles/non-critical.css" /></noscript>
  ```
- Скрипты — добавь `defer` или `async`:
  ```html
  <script src="/scripts/analytics.js" defer></script>
  ```

#### Шаг 5 — Оптимизировать LCP-элемент первого экрана

Найди главное изображение-герой (hero image) или крупный текстовый блок первого экрана. Если это изображение:
- Добавь `<link rel="preload" as="image" href="/hero-image.webp" />` в `<head>`.
- Убедись, что у тега `<img>` есть атрибут `loading="eager"` (без lazy-loading для первого экрана) и `fetchpriority="high"`.
- Конвертируй изображение в формат WebP/AVIF (меньше байт).

#### Шаг 6 — Проверка

После деплоя запустить:
- https://pagespeed.web.dev/ → URL `https://shebercraft.kz` → Mobile
- Цель: Performance ≥ 90, LCP < 2,5 с, FCP < 1,8 с

---

## БЛОК 2 — СРЕДНИЙ ПРИОРИТЕТ 🟠

### Задача 2.1: Исправить структуру заголовков H1–H6

**Проблема:** на главной странице 2 тега H1 вместо одного. Нарушена последовательность уровней (Lighthouse: «Heading elements are not in a sequentially-descending order»).

#### Действия

1. **Найди все H1-теги на главной странице** (`index.html`, `pages/index.tsx`, `content/_index.md` и т.д.).
2. Оставь один H1 — тот, который описывает главную тему страницы. Предположительно: «Создаём сайты и системы, которые превращают...».
3. Второй H1 («Битрикс24 вне отдела продаж...») — замени на H2:
   ```html
   <!-- Было -->
   <h1>Битрикс24 вне отдела продаж...</h1>
   <!-- Стало -->
   <h2>Битрикс24 вне отдела продаж...</h2>
   ```
4. **Проверь всю иерархию заголовков** на главной — порядок должен быть строго: H1 → H2 → H3 → H4 (без пропусков уровней). Если после H2 сразу идёт H4 — замени H4 на H3.
5. Проверь подстраницы — там по одному H1 (уже ок по данным аудита, но перепроверь).

#### Инструмент проверки

После правок открой страницу в браузере → DevTools → Console → выполни:
```javascript
document.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach(h => console.log(h.tagName, h.textContent.trim().substring(0, 60)))
```
Убедись, что H1 встречается ровно один раз.

---

### Задача 2.2: Устранить замечания по доступности (Accessibility 90/100)

**Проблема:** 4 группы замечаний Lighthouse. Исправление поднимет балл и улучшит UX.

#### 2.2.1 — aria-hidden содержит фокусируемые элементы

Найди в коде элементы с атрибутом `aria-hidden="true"`, внутри которых есть `<a>`, `<button>`, `<input>` или другие интерактивные элементы.

```html
<!-- НЕПРАВИЛЬНО: кнопка внутри aria-hidden блока -->
<div aria-hidden="true">
  <button>Закрыть</button>
</div>

<!-- ПРАВИЛЬНО: убрать aria-hidden с родителя, или вынести кнопку, 
     или добавить tabindex="-1" к кнопке -->
<div aria-hidden="true">
  <button tabindex="-1">Закрыть</button>
</div>
```

Алгоритм поиска: в исходном коде найди все `aria-hidden="true"` и проверь, нет ли внутри `<a>`, `<button>`, `<input>`, `<select>`, `<textarea>`, элементов с `tabindex`.

#### 2.2.2 — Недостаточный цветовой контраст

1. Запусти аудит Lighthouse в DevTools (Accessibility) → он покажет конкретные элементы с низким контрастом.
2. Для каждого проблемного элемента: проверь цвет текста и фона, используй https://webaim.org/resources/contrastchecker/ для подбора.
3. Минимальный коэффициент контрастности по WCAG AA: **4.5:1** для мелкого текста, **3:1** для крупного (18pt+).
4. Исправь CSS — измени цвет текста или фона, чтобы достичь нужного контраста.

#### 2.2.3 — Непоследовательный порядок заголовков

Уже описано в Задаче 2.1 — исправляется там же.

#### 2.2.4 — Видимые текстовые подписи не совпадают с accessible name

Найди кнопки или ссылки, у которых видимый текст и `aria-label` расходятся:

```html
<!-- НЕПРАВИЛЬНО: текст "Заказать звонок", aria-label другой -->
<button aria-label="Форма обратного звонка">Заказать звонок</button>

<!-- ПРАВИЛЬНО: aria-label совпадает с видимым текстом (или не нужен вовсе) -->
<button>Заказать звонок</button>
<!-- ИЛИ -->
<button aria-label="Заказать звонок">Заказать звонок</button>
```

Найди все `aria-label` в коде и убедись, что они содержат видимый текст элемента (или его часть).

---

### Задача 2.3: Расширить разметку Schema.org

**Проблема:** есть LocalBusiness и FAQPage, но не хватает ряда важных полей. Добавление улучшит понимание сайта поисковиками и AI-системами.

#### 2.3.1 — Дополнить блок LocalBusiness

Найди JSON-LD блок Schema.org с `"@type": "LocalBusiness"` и добавь недостающие поля:

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Shebercraft",
  "url": "https://shebercraft.kz",
  "logo": {
    "@type": "ImageObject",
    "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/DeutschlandCard_Logo_12.2024.svg/3840px-DeutschlandCard_Logo_12.2024.svg.png",
    "width": 400,
    "height": 120
  },
  "image": "https://placehold.co/1200x600/e2e8f0/1e293b?text=Open_Graph_image_for_Shebercraft_featuring_website",
  "description": "Разработка сайтов, внедрение CRM Битрикс24 и AI чат-боты для бизнеса в Казахстане",
  "telephone": "+7-XXX-XXX-XXXX",
  "email": "info@shebercraft.kz",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "УТОЧНИТЬ АДРЕС",
    "addressLocality": "Алматы",
    "addressRegion": "Алматинская область",
    "postalCode": "050000",
    "addressCountry": "KZ"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 43.2220,
    "longitude": 76.8512
  },
  "openingHours": [
    "Mo-Fr 09:00-18:00"
  ],
  "priceRange": "от 49 000 ₸",
  "sameAs": [
    "https://t.me/shebercraft",
    "https://instagram.com/shebercraft",
    "https://tiktok.com/@shebercraft"
  ],
  "areaServed": {
    "@type": "Country",
    "name": "Kazakhstan"
  }
}
```

> Замени `УТОЧНИТЬ АДРЕС`, координаты, телефон и URL логотипа на реальные данные.

#### 2.3.2 — Добавить BreadcrumbList на подстраницы

На каждой странице-услуге добавь JSON-LD хлебных крошек. Пример для `/landing-sait/`:

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Главная",
      "item": "https://shebercraft.kz/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Создание Landing Page",
      "item": "https://shebercraft.kz/landing-sait/"
    }
  ]
}
```

#### 2.3.3 — Добавить разметку Service на страницах услуг

Пример для страницы `/ai-chatbot/`:

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Разработка AI чат-ботов",
  "description": "Создание AI чат-ботов на базе GPT для WhatsApp и Telegram для бизнеса в Казахстане",
  "provider": {
    "@type": "LocalBusiness",
    "name": "Shebercraft",
    "url": "https://shebercraft.kz"
  },
  "areaServed": "Kazakhstan",
  "offers": {
    "@type": "Offer",
    "priceCurrency": "KZT",
    "price": "49000",
    "priceSpecification": {
      "@type": "PriceSpecification",
      "minPrice": "49000",
      "priceCurrency": "KZT",
      "description": "от 49 000 ₸"
    }
  }
}
```

Повтори аналогично для `/landing-sait/`, `/korporativnyy-sait/`, `/seo-dashboard/`, `/bitrix24-start/`.

---

### Задача 2.4: Проверить полноту sitemap.xml

**Проблема:** в `sitemap.xml` 17 URL, но аудит обнаружил страницы блога вне sitemap.

#### Действия

1. Открой файл `sitemap.xml` (или конфигурацию генератора sitemap).
2. Получи список всех страниц сайта (особенно из `/blog/`).
3. Убедись, что все страницы блога включены в sitemap:
   - `/blog/`
   - `/blog/skolko-stoit-sayt-v-kazakhstane/`
   - `/blog/lending-vs-korporativnyy-sayt/`
   - ...все остальные статьи

4. Если sitemap генерируется автоматически — проверь, не исключены ли страницы блога в конфигурации.

5. После обновления sitemap — отправить его в поисковые системы:
   - Google Search Console: `Индексирование → Файлы Sitemap → Добавить URL`
   - Яндекс.Вебмастер: `Индексирование → Sitemap-файлы`
   - URL для отправки: `https://shebercraft.kz/sitemap.xml`

6. Убедись, что sitemap указан в `robots.txt`:
   ```
   Sitemap: https://shebercraft.kz/sitemap.xml
   ```

---

### Задача 2.5: Исправить ответ 500 на HEAD-запрос главной страницы

**Проблема:** HTTP HEAD-запрос к `https://shebercraft.kz/` возвращает 500, хотя GET-запрос корректно возвращает 200. Это особенность конфигурации Netlify. Вызывает ложные алерты в системах мониторинга.

#### Действия для Netlify

1. Открой файл `netlify.toml` в корне проекта.
2. Добавь или проверь наличие обработки функций/редиректов:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
```

3. Если используются Netlify Functions — проверь, не выбрасывают ли они ошибку при HEAD-методе. Добавь обработку HEAD в функцию:

```javascript
// netlify/functions/example.js
exports.handler = async (event) => {
  if (event.httpMethod === 'HEAD') {
    return { statusCode: 200, body: '' };
  }
  // остальная логика...
};
```

4. Если проблема в редиректах — проверь файл `_redirects` на наличие правил, которые могут вызывать ошибку при HEAD.

5. После деплоя проверить командой:
   ```bash
   curl -I https://shebercraft.kz/
   # Ожидаемый ответ: HTTP/2 200
   ```

---

## БЛОК 3 — НИЗКИЙ ПРИОРИТЕТ / РАЗВИТИЕ 🔵

### Задача 3.1: Явно указать правила для AI-краулеров в robots.txt

**Цель:** управлять тем, какие AI-системы могут обучаться на контенте сайта.

Текущий `robots.txt` разрешает всё всем. Добавь явные правила (выбери нужный вариант):

**Вариант А — разрешить всем (оставить как есть, явно указав):**
```
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: PerplexityBot
Allow: /
```

**Вариант Б — запретить обучение AI на контенте:**
```
User-agent: GPTBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: PerplexityBot
Disallow: /

User-agent: Amazonbot
Disallow: /
```

**Вариант В — запретить только конкретные разделы:**
```
User-agent: GPTBot
Disallow: /blog/

User-agent: GPTBot
Allow: /
```

> **Рекомендация:** для компании, продающей AI-услуги, разрешение AI-краулерам (Вариант А) может быть стратегически выгодно — контент сайта будет доступен в AI-ответах. Но это решение за владельцем.

---

### Задача 3.2: Усилить внутреннюю перелинковку

**Цель:** улучшить распределение ссылочного веса и удержание пользователей.

1. В текстах блога добавь контекстные ссылки на страницы услуг. Например, в статье «Сколько стоит сайт» — ссылки на `/landing-sait/` и `/korporativnyy-sait/`.
2. На страницах услуг добавь блок «Читайте также» с релевантными статьями блога.
3. На главной странице проверь, что все основные услуги имеют ссылки с главной (уже 22 внутренних ссылки — проверь покрытие всех услуг).

---

### Задача 3.3: Верификация в Search Console и Яндекс.Вебмастере

1. **Google Search Console** (https://search.google.com/search-console):
   - Если сайт ещё не верифицирован — добавить через HTML-файл или DNS-запись.
   - Отправить sitemap: `https://shebercraft.kz/sitemap.xml`.
   - Проверить отчёт «Покрытие/Страницы» — нет ли ошибок индексации.
   - Проверить Core Web Vitals-отчёт.

2. **Яндекс.Вебмастер** (https://webmaster.yandex.ru):
   - Верифицировать сайт.
   - Добавить sitemap.
   - Настроить регион — указать Казахстан / Алматы.

---

## ПОРЯДОК ВЫПОЛНЕНИЯ (РЕКОМЕНДУЕМАЯ ПОСЛЕДОВАТЕЛЬНОСТЬ)

```
1. Задача 1.1  —  OG + Twitter Cards (1–2 часа)
2. Задача 1.2  —  Self-host шрифты + font-display: swap (2–4 часа)
3. Задача 2.1  —  Исправить H1 и иерархию заголовков (30 мин)
4. Задача 2.3  —  Расширить Schema.org (1–2 часа)
5. Задача 2.4  —  Обновить sitemap + отправить в GSC/Яндекс (30 мин)
6. Задача 2.2  —  Доступность (1–3 часа — зависит от кол-ва проблем)
7. Задача 2.5  —  Netlify HEAD 500 (30 мин)
8. Задача 3.1  —  robots.txt для AI (15 мин)
9. Задача 3.2  —  Перелинковка (1–2 часа)
10. Задача 3.3  — Search Console (30 мин)
```

---

## ПРОВЕРКА РЕЗУЛЬТАТОВ ПОСЛЕ ВСЕХ ПРАВОК

Запусти следующие проверки и убедись в успехе каждой:

| Проверка | Инструмент | Цель |
|---|---|---|
| OG-теги | https://developers.facebook.com/tools/debug/ | Картинка + описание в превью |
| Twitter Cards | https://cards-dev.twitter.com/validator | `summary_large_image` |
| Мобильный Performance | https://pagespeed.web.dev/ | ≥ 90 (было 74) |
| LCP мобайл | PageSpeed Insights | < 2,5 с (было 4,2 с) |
| H1 на главной | DevTools Console | Ровно 1 тег H1 |
| Доступность | Lighthouse DevTools | ≥ 95 (было 90) |
| Schema.org | https://validator.schema.org/ | Нет ошибок |
| Sitemap | https://www.xml-sitemaps.com/validate-xml-sitemap.html | Все страницы включены |
| HEAD-запрос | `curl -I https://shebercraft.kz/` | HTTP 200 |

---

*Инструкция подготовлена на основе SEO-аудита shebercraft.kz от 31 июля 2026 г.*  
*Все изменения вносить в отдельной git-ветке с последующим code review перед деплоем.*
