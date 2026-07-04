-- =========================================================================
-- SUPABASE POSTGRESQL ENTERPRISE DATA SEEDING SCRIPT
-- Generated for: Harendra Lamsal - Portfolio & CMS Admin Portal
-- Date: 2026-07-04
-- Objective: Ensure full bilingual support and populate all content tables
-- Use: Run this script directly inside the Supabase SQL Editor
-- =========================================================================

-- 1. UPGRADE SCHEMA FOR 100% BILINGUAL COMPATIBILITY (FRONTEND / BACKEND SYNC)
-- =========================================================================

-- News Articles Table upgrades
ALTER TABLE public.news_articles ADD COLUMN IF NOT EXISTS title_en TEXT;
ALTER TABLE public.news_articles ADD COLUMN IF NOT EXISTS title_np TEXT;
ALTER TABLE public.news_articles ADD COLUMN IF NOT EXISTS summary_en TEXT;
ALTER TABLE public.news_articles ADD COLUMN IF NOT EXISTS summary_np TEXT;
ALTER TABLE public.news_articles ADD COLUMN IF NOT EXISTS content_en TEXT;
ALTER TABLE public.news_articles ADD COLUMN IF NOT EXISTS content_np TEXT;

-- Blog Posts Table upgrades
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS title_en TEXT;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS title_np TEXT;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS summary_en TEXT;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS summary_np TEXT;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS content_en TEXT;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS content_np TEXT;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS author TEXT DEFAULT 'Harendra Lamsal';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]';

-- Tutorials Table upgrades
ALTER TABLE public.tutorials ADD COLUMN IF NOT EXISTS title_en TEXT;
ALTER TABLE public.tutorials ADD COLUMN IF NOT EXISTS title_np TEXT;
ALTER TABLE public.tutorials ADD COLUMN IF NOT EXISTS steps JSONB DEFAULT '[]';
ALTER TABLE public.tutorials ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]';
ALTER TABLE public.tutorials ADD COLUMN IF NOT EXISTS author TEXT DEFAULT 'Harendra Lamsal';
ALTER TABLE public.tutorials ADD COLUMN IF NOT EXISTS live_url TEXT;
ALTER TABLE public.tutorials ADD COLUMN IF NOT EXISTS download_url TEXT;

-- Projects Table upgrades
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS title_en TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS title_np TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS desc_en TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS desc_np TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS tech_stack JSONB DEFAULT '[]';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS features_en JSONB DEFAULT '[]';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS features_np JSONB DEFAULT '[]';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS live_url TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS demo_details TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS category TEXT;

-- Certificates Table upgrades
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS title_en TEXT;
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS title_np TEXT;
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS year VARCHAR(10);
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Code Snippets Table upgrades (Creating table if not exists)
CREATE TABLE IF NOT EXISTS public.snippets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    title_en TEXT,
    title_np TEXT,
    code TEXT NOT NULL,
    language VARCHAR(50) DEFAULT 'typescript' NOT NULL,
    category VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure RLS on snippets
ALTER TABLE public.snippets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view snippets" ON public.snippets;
DROP POLICY IF EXISTS "Anyone can insert snippets" ON public.snippets;
DROP POLICY IF EXISTS "Anyone can update snippets" ON public.snippets;
DROP POLICY IF EXISTS "Anyone can delete snippets" ON public.snippets;
CREATE POLICY "Anyone can view snippets" ON public.snippets FOR SELECT USING (true);
CREATE POLICY "Anyone can insert snippets" ON public.snippets FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update snippets" ON public.snippets FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete snippets" ON public.snippets FOR DELETE USING (true);


-- 2. POPULATE TAXONOMIES (CATEGORIES & TAGS)
-- =========================================================================

INSERT INTO public.categories (name, slug, description, icon) VALUES
('React & Frontend', 'react-frontend', 'Advanced tutorials on React 19, TypeScript, and modern frontend frameworks', 'Layers'),
('Backend & Databases', 'backend-databases', 'Deep dives into Node.js, Express, PostgreSQL, and database design', 'Cpu'),
('Artificial Intelligence', 'artificial-intelligence', 'Enterprise AI automation, Gemini integrations, and machine learning', 'Sparkles'),
('CSS & Web Design', 'css-web-design', 'Modern styling techniques with Tailwind CSS and CSS Variables', 'Globe')
ON CONFLICT (slug) DO UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon;

INSERT INTO public.tags (name, slug) VALUES
('React 19', 'react-19'),
('WebSockets', 'websockets'),
('Enterprise', 'enterprise'),
('Real-Time', 'real-time'),
('Gemini API', 'gemini-api'),
('AI Automation', 'ai-automation'),
('Node.js', 'node-js'),
('Tailwind CSS', 'tailwind-css'),
('CSS Variables', 'css-variables'),
('Vite Plugin', 'vite-plugin'),
('Web Dev', 'web-dev'),
('TypeScript', 'typescript')
ON CONFLICT (slug) DO UPDATE SET 
    name = EXCLUDED.name;


-- 3. SEED BLOG POSTS
-- =========================================================================

INSERT INTO public.blog_posts (
    id, title, title_en, title_np, slug, summary, summary_en, summary_np, 
    content, content_en, content_np, status, views, reading_time, author, category, tags
) VALUES
(
    '22222222-2222-2222-2222-111111111111',
    'Building Enterprise Real-Time Applications with React 19 and WebSockets',
    'Building Enterprise Real-Time Applications with React 19 and WebSockets',
    'रिएक्ट १९ र वेबसकेटको साथ एन्टरप्राइज रियल-टाइम अनुप्रयोगहरू निर्माण गर्दै',
    'building-enterprise-real-time-applications-with-react-19-and-websockets',
    'Real-time web applications play a massive role in today''s digital world. React 19 brings streamlined state management and improved server components...',
    'Real-time web applications play a massive role in today''s digital world. React 19 brings streamlined state management and improved server components...',
    'रियल-टाइम वेब अनुप्रयोगहरूले आजको डिजिटल संसारमा ठूलो भूमिका खेल्छन्। रिएक्ट १९ ले थप सुव्यवस्थित स्टेट व्यवस्थापन र सुधारिएको सर्भर कम्पोनेन्ट्स ल्याएको छ...',
    'Real-time web applications play a massive role in today''s digital world. React 19 brings streamlined state management and improved server components...',
    'Real-time web applications play a massive role in today''s digital world. React 19 brings streamlined state management and improved server components, making WebSocket integration easier and more efficient than ever.

### Why React 19 and WebSockets?
1. **Outstanding Performance**: React 19''s concurrent features render rapid data streams from WebSockets smoothly without freezing the browser interface.
2. **Improved useEffect Lifecycle**: Better control of re-render cycles prevents connections from dropping and reconnecting unnecessarily.
3. **Server Actions Integration**: Dispatching user data directly via Server Actions while listening to a persistent WebSocket stream creates highly responsive applications.

### Establishing the Connection:
When handling WebSockets in React 19, a custom wrapper hook is ideal:
```typescript
const socket = new WebSocket("wss://api.harendralamsal.name.np/realtime");
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Update React State
};
```

Using this standard architecture ensures stellar performance for financial dashboards, live messaging platforms, and collaborative workspaces.',
    'रियल-टाइम वेब अनुप्रयोगहरूले आजको डिजिटल संसारमा ठूलो भूमिका खेल्छन्। रिएक्ट १९ ले थप सुव्यवस्थित स्टेट व्यवस्थापन र सुधारिएको सर्भर कम्पोनेन्ट्स ल्याएको छ, जसले वेबसकेटसँग एकीकरण गर्न पहिलेभन्दा धेरै सजिलो र प्रभावकारी बनाएको छ।

### किन रिएक्ट १९ र वेबसकेट?
१. **उत्कृष्ट पर्फर्मेन्स**: रिएक्ट १९ को कन्सरेन्ट सुविधाहरूले वेबसकेटबाट प्राप्त तीव्र गतिको डेटा स्ट्रिमलाई ब्राउजर फ्रिज नगरी सहजै रेन्डर गर्छ।
२. **सुधारिएको युज-इफेक्ट (useEffect)**: रि-रेन्डर चक्रको राम्रो व्यवस्थापनले वेबसकेट जडान अनावश्यक रूपमा बन्द हुने र खुल्ने समस्या हल गर्छ।
३. **सर्भर एक्शनहरू (Server Actions)**: प्रयोगकर्ताका इनपुटहरू सर्भरमा पठाउन र तत्काल रियल-टाइम फिडब्याक प्राप्त गर्न सर्भर एक्शनहरू निकै प्रभावकारी साबित भएका छन्।

### वेबसकेट जडान स्थापना गर्ने सरल तरिका:
रिएक्ट १९ मा वेबसकेट जडान गर्दा निम्न ढाँचा पछ्याउनु उपयोगी हुन्छ:
```typescript
const socket = new WebSocket("wss://api.harendralamsal.name.np/realtime");
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // राज्य अपडेट गर्नुहोस्
};
```

यो प्रविधिले वित्तीय ड्यासबोर्डहरू, प्रत्यक्ष कुराकानी (chat) अनुप्रयोगहरू, र सहकार्यात्मक प्लेटफर्महरू (collaborative platforms) मा उत्कृष्ट नतिजा दिन्छ।',
    'Published', 1240, 8, 'Harendra Lamsal', 'React & Frontend', '["React 19", "WebSockets", "Enterprise", "Real-Time"]'::jsonb
),
(
    '22222222-2222-2222-2222-222222222222',
    'Unlocking Gemini 3.5 Flash for Enterprise Business Automation',
    'Unlocking Gemini 3.5 Flash for Enterprise Business Automation',
    'व्यापार स्वचालनको लागि जेमिनी ३.५ फ्ल्यास अनलक गर्दै',
    'unlocking-gemini-3-5-flash-for-enterprise-business-automation',
    'The release of the Gemini 3.5 Flash model has revolutionized business automation. Its high speed, low cost, and massive context window make it the...',
    'The release of the Gemini 3.5 Flash model has revolutionized business automation. Its high speed, low cost, and massive context window make it the...',
    'नयाँ जेमिनी ३.५ फ्ल्यास मोडलले व्यवसायिक स्वचालनमा क्रान्ति ल्याएको छ। यसको उच्च गति, कम लागत, र ठूलो कन्टेक्स्ट विन्डोले धेरै मात्रामा डेटा विश्लेषण...',
    'The release of the Gemini 3.5 Flash model has revolutionized business automation. Its high speed, low cost, and massive context window make it the...',
    'The release of the Gemini 3.5 Flash model has revolutionized business automation. Its high speed, low cost, and massive context window make it the premier choice for processing voluminous data and automating overhead tasks.

### Key Advantages of Gemini 3.5 Flash:
- **Sub-second Latency**: Highly suitable for real-time customer service interactions and live telemetry analysis.
- **Cost Efficiency**: Dramatic reduction in token costs, making enterprise-wide deployments highly sustainable.
- **Multi-modality**: Native understanding of text, images, audio, and video content without intermediate pipelines.

### Primary Use-Cases:
1. **Document Classification**: Automating the ingest and sorting of emails, invoices, and legal contracts.
2. **Autonomous AI Agents**: Directing customer queries to correct departments and solving issues live.
3. **Developer Acceleration**: Generating auxiliary maintenance scripts and diagnosing stack traces instantly.',
    'नयाँ जेमिनी ३.५ फ्ल्यास मोडलले व्यवसायिक स्वचालनमा क्रान्ति ल्याएको छ। यसको उच्च गति, कम लागत, र ठूलो कन्टेक्स्ट विन्डोले धेरै मात्रामा डेटा विश्लेषण र प्रशासनिक कामहरूलाई स्वचालित बनाउन मद्दत गर्दछ।

### जेमिनी ३.५ फ्ल्यासका मुख्य सुविधाहरू:
- **तीव्र गति (Sub-second Latency)**: ग्राहक सेवा कुराकानी र रियल-टाइम विश्लेषणको लागि अत्यन्तै उपयुक्त।
- **लागत प्रभावकारी**: ठूला उद्यमहरूका लागि ठूलो परिमाणमा काम गर्दा बजेट बचत हुन्छ।
- **बहु-उपयोगिता (Multimodality)**: पाठ मात्र होइन, तस्बिर, अडियो, र भिडियो पनि उत्तिकै कुशलतापूर्वक बुझ्न सक्छ।

### उद्यम स्वचालनमा प्रयोग हुने क्षेत्रहरू:
१. **दस्तावेज वर्गीकरण**: ईमेल, चलानी (invoices), र सम्झौता पत्रहरू स्वचालित रूपमा स्क्यान र विश्लेषण गर्ने।
२. **एआई एजेन्टहरू**: ग्राहकका जिज्ञासाहरूको तुरुन्तै सही र सान्दर्भिक जवाफ दिने।
३. **코드 जेनेरेसन**: विकासकर्ताहरूका लागि स्वचालन स्क्रिप्ट र कोड फिक्स गर्ने कार्यमा सहयोग गर्ने।',
    'Published', 980, 6, 'Harendra Lamsal', 'AI & Machine Learning', '["Gemini API", "AI Automation", "Enterprise", "Node.js"]'::jsonb
),
(
    '22222222-2222-2222-2222-333333333333',
    'Tailwind CSS v4.0: Revolutionizing Styling with @theme directive',
    'Tailwind CSS v4.0: Revolutionizing Styling with @theme directive',
    'टेलविन्ड सीएसएस v४.०: `@theme` को साथ स्टाइलिङमा नयाँ क्रान्ति',
    'tailwind-css-v4-0-revolutionizing-styling-with-theme-directive',
    'Tailwind CSS v4.0 represents a clean break from the past, introducing an incredibly fast Rust compiler and native CSS-variable-based customization...',
    'Tailwind CSS v4.0 represents a clean break from the past, introducing an incredibly fast Rust compiler and native CSS-variable-based customization...',
    'टेलविन्ड सीएसएस v४.० ले आफ्नो नयाँ कम्पाइलर र आधुनिक सीएसएस सुविधाहरूसँगै वेब स्टाइलिङको संसारलाई पूर्ण रूपमा बदलेको छ। यस संस्करणमा tailwind.config.js...',
    'Tailwind CSS v4.0 represents a clean break from the past, introducing an incredibly fast Rust compiler and native CSS-variable-based customization...',
    'Tailwind CSS v4.0 represents a clean break from the past, introducing an incredibly fast Rust compiler and native CSS-variable-based customization that replaces the old JS-based configuration files entirely.

### Key Advancements in v4.0:
- **Ultra-Fast Compiler**: A completely redesigned build engine written in Rust that runs up to 10x faster than v3.
- **Pure CSS Configuration**: Say goodbye to `tailwind.config.js`. Customize custom theme colors and fonts directly inside your stylesheet.
- **Zero-Config Integrations**: Deep integration with modern build tools like Vite using CSS imports.

### Example Using the `@theme` Directive:
```css
@import "tailwindcss";

@theme {
  --color-brand-cyan: #00f0ff;
  --font-display: "Space Grotesk", sans-serif;
}
```

You can instantly use classes like `bg-brand-cyan` or `font-display` anywhere in your HTML or JSX markup, providing a much cleaner authoring experience.',
    'टेलविन्ड सीएसएस v४.० ले आफ्नो नयाँ कम्पाइलर र आधुनिक सीएसएस सुविधाहरूसँगै वेब स्टाइलिङको संसारलाई पूर्ण रूपमा बदलेको छ। यस संस्करणमा `tailwind.config.js` फाइल पूर्ण रूपमा हटेको छ र यसको ठाउँ नयाँ `@theme` निर्देशिकाले लिएको छ।

### के नयाँ छ v४.० मा?
- **अल्ट्रा-फास्ट कम्पाइलर**: रस्ट (Rust) मा आधारित नयाँ कम्पाइलर पहिलेभन्दा १० गुणा चाँडो छ।
- **शुद्ध सीएसएस कन्फिगुरेसन**: अब तपाइँले सिधै आफ्नो मुख्य सीएसएस फाइलमा `@theme` प्रयोग गरेर रङ र फन्टहरू अनुकूलित गर्न सक्नुहुन्छ।
- **शून्य कन्फिग सेटअप**: भिट (Vite) सँग उत्कृष्ट अनुकूलता, अतिरिक्त प्लगइनहरूको आवश्यकता नै पर्दैन।

### `@theme` को प्रयोग कसरी गर्ने?
```css
@import "tailwindcss";

@theme {
  --color-brand-cyan: #00f0ff;
  --font-display: "Space Grotesk", sans-serif;
}
```

अब तपाइँले क्लासमा सिधै `bg-brand-cyan` र `font-display` प्रयोग गर्न सक्नुहुन्छ। यो परिवर्तनले विकास प्रक्रियालाई थप छिटो र व्यवस्थित बनाउँछ।',
    'Published', 1560, 5, 'Harendra Lamsal', 'CSS & Web Design', '["Tailwind CSS", "CSS Variables", "Vite Plugin", "Web Dev"]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    title_en = EXCLUDED.title_en,
    title_np = EXCLUDED.title_np,
    slug = EXCLUDED.slug,
    summary = EXCLUDED.summary,
    summary_en = EXCLUDED.summary_en,
    summary_np = EXCLUDED.summary_np,
    content = EXCLUDED.content,
    content_en = EXCLUDED.content_en,
    content_np = EXCLUDED.content_np,
    status = EXCLUDED.status,
    views = EXCLUDED.views,
    reading_time = EXCLUDED.reading_time,
    author = EXCLUDED.author,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags;

-- Associate Category UUIDs to seeded Blog Posts
UPDATE public.blog_posts SET category_id = (SELECT id FROM public.categories WHERE name = 'React & Frontend' LIMIT 1) WHERE id = '22222222-2222-2222-2222-111111111111';
UPDATE public.blog_posts SET category_id = (SELECT id FROM public.categories WHERE name = 'Artificial Intelligence' LIMIT 1) WHERE id = '22222222-2222-2222-2222-222222222222';
UPDATE public.blog_posts SET category_id = (SELECT id FROM public.categories WHERE name = 'CSS & Web Design' LIMIT 1) WHERE id = '22222222-2222-2222-2222-333333333333';


-- 4. SEED NEWS ARTICLES
-- =========================================================================

INSERT INTO public.news_articles (
    id, title, title_en, title_np, slug, summary, summary_en, summary_np, 
    content, content_en, content_np, source, status, reading_time, language
) VALUES
(
    '11111111-1111-1111-1111-111111111111',
    'The Rapid Rise of Agentic AI in Modern Software Development',
    'The Rapid Rise of Agentic AI in Modern Software Development',
    'सफ्टवेयर विकासमा एजेन्टिक एआई (Agentic AI) को तीव्र लहर',
    'the-rapid-rise-of-agentic-ai-in-modern-software-development',
    'AI Agents are evolving past simple chat interfaces into autonomous operators capable of identifying bugs, writing tests, and deploying code directly.',
    'AI Agents are evolving past simple chat interfaces into autonomous operators capable of identifying bugs, writing tests, and deploying code directly.',
    'एआई एजेन्टहरू अब केवल च्याट गर्ने साधन मात्र रहेनन्, उनीहरूले सफ्टवेयरको बग पत्ता लगाउने र कोड सुधार गर्ने काम स्वायत्त रूपमा गरिरहेका छन्।',
    'San Francisco — Technology giants are steering AI development toward "Agentic AI" architectures...',
    'San Francisco — Technology giants are steering AI development toward "Agentic AI" architectures. These agents don''t merely generate passive text; they construct multi-step plans, invoke tools, and execute full workflows autonomously with minimal human guidance.

A growing wave of AI coding agents is analyzing legacy codebases, refactoring slow algorithms, generating test suites, and managing CI/CD pipelines. Industry reports show developer throughput raising by over 40% when paired with specialized autonomous developer systems.

For software creators like Harendra Lamsal, integrating agentic workflows in enterprise settings provides a massive leap in agility and product delivery times.',
    'सान फ्रान्सिस्को — विश्वभरका प्रविधि दिग्गजहरू अब ''एजेन्टिक एआई'' (Agentic AI) को विकासमा केन्द्रित भएका छन्। एजेन्टिक एआईले मानिसको थोरै निर्देशनमा ठूला र जटिल कार्यहरू आफैं योजना बनाएर पूरा गर्न सक्छ।

डेभलपर उपकरणहरू जस्तै को-पाइलट, एआई कोडिङ एजेन्टहरूले अब ठूला कोडबेसहरू आफैं विश्लेषण गर्ने, परीक्षणहरू (unit tests) लेख्ने र सीधै क्लाउड सर्भरमा अनुप्रयोगहरू डिप्लोय गर्ने क्षमता हासिल गरेका छन्। यसले विकासकर्ताहरूको उत्पादकत्व ४० प्रतिशतभन्दा बढी बढाएको एक अध्ययनले देखाएको छ।

नेपालमा पनि युवा विकासकर्ताहरूले आफ्ना स्थानीय र व्यावसायिक परियोजनाहरूमा एआई एजेन्टहरूको प्रयोग बढाउन थालेका छन्, जसले नेपाली प्रविधि क्षेत्रलाई अन्तर्राष्ट्रिय स्तरमा प्रतिस्पर्धा गर्न मद्दत पुर्याउने अपेक्षा गरिएको छ।',
    'TechCrunch Global', 'Published', 4, 'en'
),
(
    '11111111-1111-1111-1111-222222222222',
    'Next.js 15 vs Vite 6: Strategic Evaluation for Production Builds',
    'Next.js 15 vs Vite 6: Strategic Evaluation for Production Builds',
    'नेक्स्ट.जेएस १५ र भिट ६: उत्पादनको लागि कुन सेटअप उत्तम?',
    'next-js-15-vs-vite-6-strategic-evaluation-for-production-builds',
    'Developers face an architectural fork when building enterprise web systems, contrasting Next.js 15''s robust SSR and Vite 6''s optimized client bundler.',
    'Developers face an architectural fork when building enterprise web systems, contrasting Next.js 15''s robust SSR and Vite 6''s optimized client bundler.',
    'नयाँ परियोजनाहरू सुरु गर्दा विकासकर्ताहरू नेक्स्ट.जेएस १५ को सर्भर-साइड शक्ति र भिट ६ को द्रुत क्लाइन्ट-साइड क्षमता बीच तुलना गरिरहेका छन्।',
    'The modern web landscape has reached a mature milestone with the release of Next.js 15 and Vite 6...',
    'The modern web landscape has reached a milestone with the release of Next.js 15 and Vite 6, giving teams two distinct, powerful directions for building highly optimized applications.

Next.js 15 leverages React Server Components and fine-grained server-side caching to build dynamic portals, search-engine-optimized commerce sites, and content dashboards with zero-bundle overhead.

Vite 6, conversely, solidifies its position as the ultimate client-side single-page-application (SPA) builder. Offering sub-millisecond hot module replacement and a unified plugin architecture, Vite 6 is the standard choice for interactive apps, data-rich dashboards, and rapid prototype loops.',
    'वेब विकासको क्षेत्र द्रुत गतिमा परिवर्तन भइरहेको छ, र यसैबीच नेक्स्ट.जेएस १५ (Next.js 15) र भिट ६ (Vite 6) बीचको प्रतिस्पर्धा झन् रोमान्चक बनेको छ।

नेक्स्ट.जेएस १५ ले सर्भर कम्पोनेन्ट्स र सर्भर एक्शनहरूको माध्यमबाट ब्याकइन्ड-फ्रन्टइन्ड जडानलाई अत्यन्तै सुरक्षित र छिटो बनाएको छ, जुन ई-कमर्स र ठूला कर्पोरेट पोर्टलहरूका लागि उत्तम मानिन्छ।

अर्कोतर्फ, भिट ६ ले क्लाइन्ट-साइड सिंगल पेज एप्लिकेसन (SPA) को लागि नयाँ रेकर्ड कायम गरेको छ। यसको एचएमआर (Hot Module Replacement) गति र न्यूनतम बिल समयले गर्दा विकासकर्ताहरू यसलाई ड्यासबोर्ड र सास (SaaS) उत्पादनहरू विकास गर्न अत्यधिक रुचाउँछन्। यस द्वन्द्वले अन्ततः विकासकर्ताहरूलाई आफ्नो आवश्यकता अनुसार सही प्रविधि रोज्ने अवसर दिएको छ।',
    'Wired Tech Portal', 'Published', 5, 'en'
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    title_en = EXCLUDED.title_en,
    title_np = EXCLUDED.title_np,
    slug = EXCLUDED.slug,
    summary = EXCLUDED.summary,
    summary_en = EXCLUDED.summary_en,
    summary_np = EXCLUDED.summary_np,
    content = EXCLUDED.content,
    content_en = EXCLUDED.content_en,
    content_np = EXCLUDED.content_np,
    source = EXCLUDED.source,
    status = EXCLUDED.status,
    reading_time = EXCLUDED.reading_time,
    language = EXCLUDED.language;

-- Associate Category UUIDs to seeded News Articles
UPDATE public.news_articles SET category_id = (SELECT id FROM public.categories WHERE name = 'Artificial Intelligence' LIMIT 1) WHERE id = '11111111-1111-1111-1111-111111111111';
UPDATE public.news_articles SET category_id = (SELECT id FROM public.categories WHERE name = 'React & Frontend' LIMIT 1) WHERE id = '11111111-1111-1111-1111-222222222222';


-- 5. SEED TUTORIALS
-- =========================================================================

INSERT INTO public.tutorials (
    id, title, title_en, title_np, slug, summary, content, difficulty_level, status, reading_time, author, live_url, download_url, steps, tags
) VALUES
(
    '55555555-5555-5555-5555-111111111111',
    'Supabase Auto-Sync Guide: Mastering React 19 & Supabase',
    'Supabase Auto-Sync Guide: Mastering React 19 & Supabase',
    'सुपाबेस अटो-सिंक गाइड: रिएक्ट १९ र सुपाबेसको आधारभूत कुराहरू',
    'supabase-auto-sync-guide-mastering-react-19-supabase',
    'Learn how to leverage Supabase real-time database channels to build dynamic components synced automatically.',
    'Master real-time synchronization in React 19 with a robust step-by-step custom hook integration implementation.',
    'Intermediate', 'Published', 12, 'Harendra Lamsal',
    'https://harendralamsal.name.np/tutorials/supabase-sync',
    'https://harendralamsal.name.np/resources/supabase-sync.zip',
    '[
        {
            "title_en": "Setting up your Supabase Client",
            "title_np": "सुपाबेस क्लाइन्ट सेटअप गर्दै",
            "content_en": "To implement real-time synchronization, we start by constructing our Supabase client with proper database web socket bindings.",
            "content_np": "वास्तविक-समय सिङ्क्रोनाइजेसन लागू गर्न, हामी उपयुक्त डाटाबेस वेब सकेट बाइन्डिङको साथ सुपाबेस क्लाइन्ट निर्माण गरेर सुरु गर्छौं।",
            "codeSnippet": "import { createClient } from ''@supabase/supabase-js'';\n\nconst supabaseUrl = ''https://your-project.supabase.co'';\nconst supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;\n\nexport const supabase = createClient(supabaseUrl, supabaseKey);",
            "language": "typescript"
        },
        {
            "title_en": "Subscribing to Real-Time Changes",
            "title_np": "वास्तविक-समय परिवर्तनहरू सदस्यता लिँदै",
            "content_en": "We create a custom React hook that subscribes to INSERT/UPDATE database events on our target table.",
            "content_np": "हामी एउटा कस्टम रिएक्ट हुक बनाउँछौं जसले लक्षित तालिकामा INSERT/UPDATE डाटाबेस घटनाहरूको सदस्यता लिन्छ।",
            "codeSnippet": "import { useEffect, useState } from ''react'';\nimport { supabase } from ''./supabaseClient'';\n\nexport function useSupabaseSync<T>(table: string) {\n  const [data, setData] = useState<T[]>([]);\n\n  useEffect(() => {\n    // Initial fetch\n    supabase.from(table).select(''*'').then(({ data }) => {\n      if (data) setData(data);\n    });\n\n    // Realtime channel\n    const channel = supabase\n      .channel(''schema-db-changes'')\n      .on(''postgres_changes'', { event: ''*'', schema: ''public'', table }, (payload) => {\n        console.log(''Realtime change received!'', payload);\n        // Sync algorithms here...\n      })\n      .subscribe();\n\n    return () => {\n      supabase.removeChannel(channel);\n    };\n  }, [table]);\n\n  return data;\n}",
            "language": "typescript"
        }
    ]'::jsonb,
    '["React 19", "Supabase", "Auto-Sync", "Webhooks"]'::jsonb
),
(
    '55555555-5555-5555-5555-222222222222',
    'Enterprise API Security: Node & Express Best Practices',
    'Enterprise API Security: Node & Express Best Practices',
    'एन्टरप्राइज एपीआई सेक्युरिटी: नोड र एक्सप्रेस बेस्ट प्राक्टिसहरू',
    'enterprise-api-security-node-express-best-practices',
    'Secure your server endpoints using modern industry standards including rate limiting, CORS safeguards, and Helmet headers.',
    'Implement hardened industry standards to protect your Express Node.js servers from remote threat vectors and injection loops.',
    'Expert', 'Published', 15, 'Harendra Lamsal',
    'https://harendralamsal.name.np/tutorials/api-security',
    'https://harendralamsal.name.np/resources/api-security.zip',
    '[
        {
            "title_en": "Enforcing Helmet and Rate Limiting",
            "title_np": "हेल्मेट र दर सीमितता लागू गर्दै",
            "content_en": "Lock down your Express API headers with Helmet and introduce rate limiting to prevent DDoS or brute-force scanning.",
            "content_np": "हेल्मेटको साथ तपाईंको एक्सप्रेस एपीआई हेडरहरू सुरक्षित गर्नुहोस् र DDoS वा ब्रूट-फोर्स स्क्यानिङ रोक्नको लागि दर सीमितता लागू गर्नुहोस्।",
            "codeSnippet": "import express from ''express'';\nimport helmet from ''helmet'';\nimport rateLimit from ''express-rate-limit'';\n\nconst app = express();\napp.use(helmet());\n\nconst limiter = rateLimit({\n  windowMs: 15 * 60 * 1000, // 15 minutes\n  max: 100, // Limit each IP to 100 requests per window\n  message: { error: \"\"Too many requests from this endpoint.\"\" }\n});\napp.use(''/api/'', limiter);",
            "language": "typescript"
        }
    ]'::jsonb,
    '["Security", "API", "Express", "Node.js", "OAuth"]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    title_en = EXCLUDED.title_en,
    title_np = EXCLUDED.title_np,
    slug = EXCLUDED.slug,
    summary = EXCLUDED.summary,
    content = EXCLUDED.content,
    difficulty_level = EXCLUDED.difficulty_level,
    status = EXCLUDED.status,
    reading_time = EXCLUDED.reading_time,
    author = EXCLUDED.author,
    live_url = EXCLUDED.live_url,
    download_url = EXCLUDED.download_url,
    steps = EXCLUDED.steps,
    tags = EXCLUDED.tags;

-- Associate Category UUIDs to seeded Tutorials
UPDATE public.tutorials SET category_id = (SELECT id FROM public.categories WHERE name = 'React & Frontend' LIMIT 1) WHERE id = '55555555-5555-5555-5555-111111111111';
UPDATE public.tutorials SET category_id = (SELECT id FROM public.categories WHERE name = 'Backend & Databases' LIMIT 1) WHERE id = '55555555-5555-5555-5555-222222222222';


-- 6. SEED PROJECTS
-- =========================================================================

INSERT INTO public.projects (
    id, project_name, title_en, title_np, slug, description, desc_en, desc_np, 
    technologies, tech_stack, github_url, live_demo_url, live_url, demo_details, status, featured, category, features_en, features_np
) VALUES
(
    '33333333-3333-3333-3333-111111111111',
    'Bilingual AI-Powered Enterprise Content Engine',
    'Bilingual AI-Powered Enterprise Content Engine',
    'द्विभाषिक एआई-संचालित पेशेवर प्रकाशन इन्जिन',
    'bilingual-ai-powered-enterprise-content-engine',
    'An elite content management system with native Nepali and English localization. Powered by Gemini, the system facilitates instant translation...',
    'An elite content management system with native Nepali and English localization. Powered by Gemini, the system facilitates instant translation...',
    'नेपाली र अंग्रेजी दुबै भाषामा पूर्ण रूपमा सञ्चालित हुने एक अत्याधुनिक एआई सीएमएस। यसमा जेमिनी एआईको प्रयोग गरेर लेख लेख्ने, संक्षेप बनाउने...',
    '{"React 19", "Express", "Vite 6", "Tailwind CSS", "Gemini API"}',
    '["React 19", "Express", "Vite 6", "Tailwind CSS", "Gemini API"]'::jsonb,
    'https://github.com/harendra-lamsal/bilingual-ai-cms',
    'https://harendralamsal.name.np/cms',
    'https://harendralamsal.name.np/cms',
    'Contains a professional administrative backend which uses the Gemini 3.5 Flash model to translate articles from English to Nepali with absolute structural accuracy.',
    'Completed', true, 'Full Stack AI',
    '["Real-time dual-language drafting and storage", "One-click bilingual translation via server-side Gemini 3.5 Flash proxy", "Dynamic tagging and SEO category assignment", "Responsive layout optimized with high contrast typography"]'::jsonb,
    '["वास्तविक-समय द्विभाषी ड्राफ्टिङ र भण्डारण", "सर्भर-साइड जेमिनी ३.५ फ्ल्यास प्रोक्सी मार्फत एक-क्लिक अनुवाद", "गतिशील ट्यागिङ र SEO श्रेणी असाइनमेन्ट", "उच्च कन्ट्रास्ट टाइपोग्राफी संग अनुकूलित उत्तरदायी लेआउट"]'::jsonb
),
(
    '33333333-3333-3333-3333-222222222222',
    'Secure FinTech Ledger & Microservice Suite',
    'Secure FinTech Ledger & Microservice Suite',
    'सुरक्षित फिनटेक लेजर र माइक्रोसर्भिस ब्याकइन्ड',
    'secure-fintech-ledger-microservice-suite',
    'An enterprise-grade financial ledger system built with microservices. Employs advanced cryptographic signing, automated reconciliation...',
    'An enterprise-grade financial ledger system built with microservices. Employs advanced cryptographic signing, automated reconciliation...',
    'वित्तीय लेनदेनहरू सुरक्षित र छिटो रेकर्ड गर्ने एक उद्यम-स्तरको ब्याकइन्ड प्रणाली। यसमा कमर्सियल सेक्युरिटी, टोकन प्रमाणीकरण र...',
    '{"Node.js", "TypeScript", "PostgreSQL", "Express", "Docker"}',
    '["Node.js", "TypeScript", "PostgreSQL", "Express", "Docker"]'::jsonb,
    'https://github.com/harendra-lamsal/fintech-secure-ledger',
    'https://api.harendralamsal.name.np/ledger',
    'https://api.harendralamsal.name.np/ledger',
    'Demonstrates secure OAuth endpoints, real-time auditing, and database optimization handling up to 10,000 transactions per second.',
    'Completed', true, 'Backend Security',
    '["Cryptographically sealed ledger transaction logging", "OAuth 2.0 role-based authorization hierarchy", "Automated cross-account ledger reconciliations", "High-throughput transactional queue with PostgreSQL clustering"]'::jsonb,
    '["क्रिप्टोग्राफिक रूपमा सिल गरिएको लेजर लेनदेन लगिङ", "OAuth २.० भूमिका-आधारित प्रमाणीकरण पदानुक्रम", "स्वचालित क्रस-खाता बहीखाता मिलान", "PostgreSQL क्लस्टरिङको साथ उच्च-थ्रुपुट लेनदेन लाम"]'::jsonb
),
(
    '33333333-3333-3333-3333-333333333333',
    'IoT Server Connect & Live Telemetry Dashboard',
    'IoT Server Connect & Live Telemetry Dashboard',
    'आईओटी सर्भर जडान र प्रत्यक्ष ड्यासबोर्ड',
    'iot-server-connect-live-telemetry-dashboard',
    'A real-time IoT visualization dashboard that streams live hardware data using persistent WebSocket connections...',
    'A real-time IoT visualization dashboard that streams live hardware data using persistent WebSocket connections...',
    'आईओटी उपकरणहरूबाट आउने प्रत्यक्ष डेटालाई वेबसकेट मार्फत ड्यासबोर्डमा देखाउने प्रणाली। यसले बिजुली खपत, तापक्रम र...',
    '{"React", "WebSockets", "D3.js", "Express", "Tailwind CSS"}',
    '["React", "WebSockets", "D3.js", "Express", "Tailwind CSS"]'::jsonb,
    'https://github.com/harendra-lamsal/iot-telemetry-live',
    'https://iot.harendralamsal.name.np',
    'https://iot.harendralamsal.name.np',
    'Features custom responsive D3 canvas chart rendering live microsecond signals without any paint degradation.',
    'Completed', true, 'Real-Time Systems',
    '["Persistent WebSocket connection with automated retry backoff", "Live microsecond telemetry stream visualization using D3.js", "Threshold anomaly detection with native browser desktop notifications", "Multi-node hardware tracking interface"]'::jsonb,
    '["स्वचालित पुन: प्रयास ब्याकअफको साथ निरन्तर वेबसकेट जडान", "D3.js प्रयोग गरेर लाइभ माइक्रोसेकेन्ड टेलिमेट्री स्ट्रिम भिजुअलाइजेशन", "देशी ब्राउजर डेस्कटप सूचनाहरूको साथ थ्रेसहोल्ड विसंगति पत्ता लगाउने", "बहु-नोड हार्डवेयर ट्र्याकिङ इन्टरफेस"]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    project_name = EXCLUDED.project_name,
    title_en = EXCLUDED.title_en,
    title_np = EXCLUDED.title_np,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    desc_en = EXCLUDED.desc_en,
    desc_np = EXCLUDED.desc_np,
    technologies = EXCLUDED.technologies,
    tech_stack = EXCLUDED.tech_stack,
    github_url = EXCLUDED.github_url,
    live_demo_url = EXCLUDED.live_demo_url,
    live_url = EXCLUDED.live_url,
    demo_details = EXCLUDED.demo_details,
    status = EXCLUDED.status,
    featured = EXCLUDED.featured,
    category = EXCLUDED.category,
    features_en = EXCLUDED.features_en,
    features_np = EXCLUDED.features_np;


-- 7. SEED CERTIFICATES
-- =========================================================================

INSERT INTO public.certificates (
    id, certificate_name, title_en, title_np, issuing_organization, platform, 
    credential_id, verification_url, issue_date, year, category, image_url
) VALUES
(
    '44444444-4444-4444-4444-111111111111',
    'Complete Web Development Course',
    'Complete Web Development Course',
    'पूर्ण वेब विकास कोर्स',
    'Udemy', 'Udemy',
    'UC-b44c0cd2-6616-478b-95aa-e50de3973c3f (Ref: 0004)',
    'https://ude.my/UC-b44c0cd2-6616-478b-95aa-e50de3973c3f',
    '2026-06-28', '2026', 'Web Development',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&auto=format&fit=crop'
),
(
    '44444444-4444-4444-4444-222222222222',
    'Build a Free Website with WordPress',
    'Build a Free Website with WordPress',
    'वर्डप्रेसमार्फत नि:शुल्क वेबसाइट निर्माण',
    'Coursera', 'Coursera',
    'YYQ4WCFDL2IA',
    'https://coursera.org/verify/YYQ4WCFDL2IA',
    '2026-06-28', '2026', 'Web Development',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&auto=format&fit=crop'
),
(
    '44444444-4444-4444-4444-333333333333',
    'Advanced Node.js Developer - OpenJS Foundation',
    'Advanced Node.js Developer - OpenJS Foundation',
    'उन्नत नोड.जेएस विकासकर्ता प्रमाणीकरण',
    'OpenJS Foundation', 'OpenJS Foundation',
    'OPENJS-NODE-4819',
    'https://openjsf.org/certification',
    '2026-02-15', '2026', 'Backend',
    'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=500&auto=format&fit=crop'
)
ON CONFLICT (id) DO UPDATE SET
    certificate_name = EXCLUDED.certificate_name,
    title_en = EXCLUDED.title_en,
    title_np = EXCLUDED.title_np,
    issuing_organization = EXCLUDED.issuing_organization,
    platform = EXCLUDED.platform,
    credential_id = EXCLUDED.credential_id,
    verification_url = EXCLUDED.verification_url,
    issue_date = EXCLUDED.issue_date,
    year = EXCLUDED.year,
    category = EXCLUDED.category,
    image_url = EXCLUDED.image_url;


-- 8. SEED CODE SNIPPETS
-- =========================================================================

INSERT INTO public.snippets (
    id, title, title_en, title_np, code, language, category
) VALUES
(
    '66666666-6666-6666-6666-111111111111',
    'Debounced Value Custom Hook in React',
    'Debounced Value Custom Hook in React',
    'रिएक्टमा डिबाउन्स गरिएको कस्टम हुक',
    'import { useState, useEffect } from ''react'';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}',
    'typescript', 'React Hook'
),
(
    '66666666-6666-6666-6666-222222222222',
    'Express Server Graceful Shutdown Handler',
    'Express Server Graceful Shutdown Handler',
    'एक्सप्रेस सर्भरको सुरक्षित शटडाउन ह्यान्डलर',
    'import { Server } from ''http'';

export function setupGracefulShutdown(server: Server) {
  const shutdown = (signal: string) => {
    console.log(`Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      console.log(''HTTP server closed. Exiting process.'');
      process.exit(0);
    });

    // If server takes too long to close, force exit
    setTimeout(() => {
      console.error(''Forced shutdown due to timeout.'');
      process.exit(1);
    }, 10000);
  };

  process.on(''SIGTERM'', () => shutdown(''SIGTERM''));
  process.on(''SIGINT'', () => shutdown(''SIGINT''));
}',
    'typescript', 'Node Backend'
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    title_en = EXCLUDED.title_en,
    title_np = EXCLUDED.title_np,
    code = EXCLUDED.code,
    language = EXCLUDED.language,
    category = EXCLUDED.category;


-- 9. SEED WEBSITE GLOBAL SETTINGS
-- =========================================================================

INSERT INTO public.website_settings (key, value) VALUES
(
    'global_config',
    '{
        "websiteName": "Harendra Lamsal Portfolio & CMS",
        "logo": "HL",
        "favicon": "/favicon.ico",
        "contactEmail": "harendralamsal4140@gmail.com",
        "contactPhone": "+977 9823587535",
        "facebookUrl": "https://web.facebook.com/harendra.lamsala/",
        "linkedinUrl": "https://www.linkedin.com/in/harendra-lamsal-728a6122b",
        "theme": "Cosmic Slate Theme",
        "homepageTitle_en": "Elite Full Stack Developer",
        "homepageTitle_np": "कुशल फुल स्ट्याक विकासकर्ता",
        "footerCopyright_en": "© 2026 Harendra Lamsal. All Rights Reserved.",
        "footerCopyright_np": "© २०२६ सर्वाधिकार सुरक्षित। हरेन्द्र लाम्साल।"
    }'::jsonb
)
ON CONFLICT (key) DO UPDATE SET 
    value = EXCLUDED.value;

-- =========================================================================
-- SEEDING SUCCESSFUL! YOUR ENTERPRISE PORTAL IS NOW FULLY PROVISIONED.
-- =========================================================================
