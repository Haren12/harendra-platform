/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BlogPost, NewsArticle, Project, Certificate, CodeSnippet, Tutorial } from "../types.js";

export const initialBlogs: BlogPost[] = [
  {
    id: "blog-1",
    title_np: "रिएक्ट १९ र वेबसकेटको साथ एन्टरप्राइज रियल-टाइम अनुप्रयोगहरू निर्माण गर्दै",
    title_en: "Building Enterprise Real-Time Applications with React 19 and WebSockets",
    category: "React & Frontend",
    tags: ["React 19", "WebSockets", "Enterprise", "Real-Time"],
    date: "2026-06-25",
    views: 1240,
    readTime: "8 min read",
    author: "Harendra Lamsal",
    content_np: `रियल-टाइम वेब अनुप्रयोगहरूले आजको डिजिटल संसारमा ठूलो भूमिका खेल्छन्। रिएक्ट १९ ले थप सुव्यवस्थित स्टेट व्यवस्थापन र सुधारिएको सर्भर कम्पोनेन्ट्स ल्याएको छ, जसले वेबसकेटसँग एकीकरण गर्न पहिलेभन्दा धेरै सजिलो र प्रभावकारी बनाएको छ।

### किन रिएक्ट १९ र वेबसकेट?
१. **उत्कृष्ट पर्फर्मेन्स**: रिएक्ट १९ को कन्सरेन्ट सुविधाहरूले वेबसकेटबाट प्राप्त तीव्र गतिको डेटा स्ट्रिमलाई ब्राउजर फ्रिज नगरी सहजै रेन्डर गर्छ।
२. **सुधारिएको युज-इफेक्ट (useEffect)**: रि-रेन्डर चक्रको राम्रो व्यवस्थापनले वेबसकेट जडान अनावश्यक रूपमा बन्द हुने र खुल्ने समस्या हल गर्छ।
३. **सर्भर एक्शनहरू (Server Actions)**: प्रयोगकर्ताका इनपुटहरू सर्भरमा पठाउन र तत्काल रियल-टाइम फिडब्याक प्राप्त गर्न सर्भर एक्शनहरू निकै प्रभावकारी साबित भएका छन्।

### वेबसकेट जडान स्थापना गर्ने सरल तरिका:
रिएक्ट १९ मा वेबसकेट जडान गर्दा निम्न ढाँचा पछ्याउनु उपयोगी हुन्छ:
\`\`\`typescript
const socket = new WebSocket("wss://api.harendralamsal.name.np/realtime");
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // राज्य अपडेट गर्नुहोस्
};
\`\`\`

यो प्रविधिले वित्तीय ड्यासबोर्डहरू, प्रत्यक्ष कुराकानी (chat) अनुप्रयोगहरू, र सहकार्यात्मक प्लेटफर्महरू (collaborative platforms) मा उत्कृष्ट नतिजा दिन्छ।`,
    content_en: `Real-time web applications play a massive role in today's digital world. React 19 brings streamlined state management and improved server components, making WebSocket integration easier and more efficient than ever.

### Why React 19 and WebSockets?
1. **Outstanding Performance**: React 19's concurrent features render rapid data streams from WebSockets smoothly without freezing the browser interface.
2. **Improved useEffect Lifecycle**: Better control of re-render cycles prevents connections from dropping and reconnecting unnecessarily.
3. **Server Actions Integration**: Dispatching user data directly via Server Actions while listening to a persistent WebSocket stream creates highly responsive applications.

### Establishing the Connection:
When handling WebSockets in React 19, a custom wrapper hook is ideal:
\`\`\`typescript
const socket = new WebSocket("wss://api.harendralamsal.name.np/realtime");
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Update React State
};
\`\`\`

Using this standard architecture ensures stellar performance for financial dashboards, live messaging platforms, and collaborative workspaces.`
  },
  {
    id: "blog-2",
    title_np: "व्यापार स्वचालनको लागि जेमिनी ३.५ फ्ल्यास अनलक गर्दै",
    title_en: "Unlocking Gemini 3.5 Flash for Enterprise Business Automation",
    category: "AI & Machine Learning",
    tags: ["Gemini API", "AI Automation", "Enterprise", "Node.js"],
    date: "2026-06-18",
    views: 980,
    readTime: "6 min read",
    author: "Harendra Lamsal",
    content_np: `नयाँ जेमिनी ३.५ फ्ल्यास मोडलले व्यवसायिक स्वचालनमा क्रान्ति ल्याएको छ। यसको उच्च गति, कम लागत, र ठूलो कन्टेक्स्ट विन्डोले धेरै मात्रामा डेटा विश्लेषण र प्रशासनिक कामहरूलाई स्वचालित बनाउन मद्दत गर्दछ।

### जेमिनी ३.५ फ्ल्यासका मुख्य सुविधाहरू:
- **तीव्र गति (Sub-second Latency)**: ग्राहक सेवा कुराकानी र रियल-टाइम विश्लेषणको लागि अत्यन्तै उपयुक्त।
- **लागत प्रभावकारी**: ठूला उद्यमहरूका लागि ठूलो परिमाणमा काम गर्दा बजेट बचत हुन्छ।
- **बहु-उपयोगिता (Multimodality)**: पाठ मात्र होइन, तस्बिर, अडियो, र भिडियो पनि उत्तिकै कुशलतापूर्वक बुझ्न सक्छ।

### उद्यम स्वचालनमा प्रयोग हुने क्षेत्रहरू:
१. **दस्तावेज वर्गीकरण**: ईमेल, चलानी (invoices), र सम्झौता पत्रहरू स्वचालित रूपमा स्क्यान र विश्लेषण गर्ने।
२. **एआई एजेन्टहरू**: ग्राहकका जिज्ञासाहरूको तुरुन्तै सही र सान्दर्भिक जवाफ दिने।
३. **कोड जेनेरेसन**: विकासकर्ताहरूका लागि स्वचालन स्क्रिप्ट र कोड फिक्स गर्ने कार्यमा सहयोग गर्ने।`,
    content_en: `The release of the Gemini 3.5 Flash model has revolutionized business automation. Its high speed, low cost, and massive context window make it the premier choice for processing voluminous data and automating overhead tasks.

### Key Advantages of Gemini 3.5 Flash:
- **Sub-second Latency**: Highly suitable for real-time customer service interactions and live telemetry analysis.
- **Cost Efficiency**: Dramatic reduction in token costs, making enterprise-wide deployments highly sustainable.
- **Multi-modality**: Native understanding of text, images, audio, and video content without intermediate pipelines.

### Primary Use-Cases:
1. **Document Classification**: Automating the ingest and sorting of emails, invoices, and legal contracts.
2. **Autonomous AI Agents**: Directing customer queries to correct departments and solving issues live.
3. **Developer Acceleration**: Generating auxiliary maintenance scripts and diagnosing stack traces instantly.`
  },
  {
    id: "blog-3",
    title_np: "टेलविन्ड सीएसएस v४.०: `@theme` को साथ स्टाइलिङमा नयाँ क्रान्ति",
    title_en: "Tailwind CSS v4.0: Revolutionizing Styling with `@theme` directive",
    category: "CSS & Web Design",
    tags: ["Tailwind CSS", "CSS Variables", "Vite Plugin", "Web Dev"],
    date: "2026-06-10",
    views: 1560,
    readTime: "5 min read",
    author: "Harendra Lamsal",
    content_np: `टेलविन्ड सीएसएस v४.० ले आफ्नो नयाँ कम्पाइलर र आधुनिक सीएसएस सुविधाहरूसँगै वेब स्टाइलिङको संसारलाई पूर्ण रूपमा बदलेको छ। यस संस्करणमा \`tailwind.config.js\` फाइल पूर्ण रूपमा हटेको छ र यसको ठाउँ नयाँ \`@theme\` निर्देशिकाले लिएको छ।

### के नयाँ छ v४.० मा?
- **अल्ट्रा-फास्ट कम्पाइलर**: रस्ट (Rust) मा आधारित नयाँ कम्पाइलर पहिलेभन्दा १० गुणा चाँडो छ।
- **शुद्ध सीएसएस कन्फिगुरेसन**: अब तपाइँले सिधै आफ्नो मुख्य सीएसएस फाइलमा \`@theme\` प्रयोग गरेर रङ र फन्टहरू अनुकूलित गर्न सक्नुहुन्छ।
- **शून्य कन्फिग सेटअप**: भिट (Vite) सँग उत्कृष्ट अनुकूलता, अतिरिक्त प्लगइनहरूको आवश्यकता नै पर्दैन।

### \`@theme\` को प्रयोग कसरी गर्ने?
\`\`\`css
@import "tailwindcss";

@theme {
  --color-brand-cyan: #00f0ff;
  --font-display: "Space Grotesk", sans-serif;
}
\`\`\`

अब तपाइँले क्लासमा सिधै \`bg-brand-cyan\` र \`font-display\` प्रयोग गर्न सक्नुहुन्छ। यो परिवर्तनले विकास प्रक्रियालाई थप छिटो र व्यवस्थित बनाउँछ।`,
    content_en: `Tailwind CSS v4.0 represents a clean break from the past, introducing an incredibly fast Rust compiler and native CSS-variable-based customization that replaces the old JS-based configuration files entirely.

### Key Advancements in v4.0:
- **Ultra-Fast Compiler**: A completely redesigned build engine written in Rust that runs up to 10x faster than v3.
- **Pure CSS Configuration**: Say goodbye to \`tailwind.config.js\`. Customize custom theme colors and fonts directly inside your stylesheet.
- **Zero-Config Integrations**: Deep integration with modern build tools like Vite using CSS imports.

### Example Using the \`@theme\` Directive:
\`\`\`css
@import "tailwindcss";

@theme {
  --color-brand-cyan: #00f0ff;
  --font-display: "Space Grotesk", sans-serif;
}
\`\`\`

You can instantly use classes like \`bg-brand-cyan\` or \`font-display\` anywhere in your HTML or JSX markup, providing a much cleaner authoring experience.`
  }
];

export const initialNews: NewsArticle[] = [
  {
    id: "news-1",
    title_np: "सफ्टवेयर विकासमा एजेन्टिक एआई (Agentic AI) को तीव्र लहर",
    title_en: "The Rapid Rise of Agentic AI in Modern Software Development",
    summary_np: "एआई एजेन्टहरू अब केवल च्याट गर्ने साधन मात्र रहेनन्, उनीहरूले सफ्टवेयरको बग पत्ता लगाउने र कोड सुधार गर्ने काम स्वायत्त रूपमा गरिरहेका छन्।",
    summary_en: "AI Agents are evolving past simple chat interfaces into autonomous operators capable of identifying bugs, writing tests, and deploying code directly.",
    content_np: `सान फ्रान्सिस्को — विश्वभरका प्रविधि दिग्गजहरू अब 'एजेन्टिक एआई' (Agentic AI) को विकासमा केन्द्रित भएका छन्। एजेन्टिक एआईले मानिसको थोरै निर्देशनमा ठूला र जटिल कार्यहरू आफैं योजना बनाएर पूरा गर्न सक्छ।

डेभलपर उपकरणहरू जस्तै को-पाइलट, एआई कोडिङ एजेन्टहरूले अब ठूला कोडबेसहरू आफैं विश्लेषण गर्ने, परीक्षणहरू (unit tests) लेख्ने र सीधै क्लाउड सर्भरमा अनुप्रयोगहरू डिप्लोय गर्ने क्षमता हासिल गरेका छन्। यसले विकासकर्ताहरूको उत्पादकत्व ४० प्रतिशतभन्दा बढी बढाएको एक अध्ययनले देखाएको छ।

नेपालमा पनि युवा विकासकर्ताहरूले आफ्ना स्थानीय र व्यावसायिक परियोजनाहरूमा एआई एजेन्टहरूको प्रयोग बढाउन थालेका छन्, जसले नेपाली प्रविधि क्षेत्रलाई अन्तर्राष्ट्रिय स्तरमा प्रतिस्पर्धा गर्न मद्दत पुर्याउने अपेक्षा गरिएको छ।`,
    content_en: `San Francisco — Technology giants are steering AI development toward "Agentic AI" architectures. These agents don't merely generate passive text; they construct multi-step plans, invoke tools, and execute full workflows autonomously with minimal human guidance.

A growing wave of AI coding agents is analyzing legacy codebases, refactoring slow algorithms, generating test suites, and managing CI/CD pipelines. Industry reports show developer throughput raising by over 40% when paired with specialized autonomous developer systems.

For software creators like Harendra Lamsal, integrating agentic workflows in enterprise settings provides a massive leap in agility and product delivery times.`,
    source: "TechCrunch Global",
    date: "2026-06-29",
    category: "Artificial Intelligence"
  },
  {
    id: "news-2",
    title_np: "नेक्स्ट.जेएस १५ र भिट ६: उत्पादनको लागि कुन सेटअप उत्तम?",
    title_en: "Next.js 15 vs Vite 6: Strategic Evaluation for Production Builds",
    summary_np: "नयाँ परियोजनाहरू सुरु गर्दा विकासकर्ताहरू नेक्स्ट.जेएस १५ को सर्भर-साइड शक्ति र भिट ६ को द्रुत क्लाइन्ट-साइड क्षमता बीच तुलना गरिरहेका छन्।",
    summary_en: "Developers face an architectural fork when building enterprise web systems, contrasting Next.js 15's robust SSR and Vite 6's optimized client bundler.",
    content_np: `वेब विकासको क्षेत्र द्रुत गतिमा परिवर्तन भइरहेको छ, र यसैबीच नेक्स्ट.जेएस १५ (Next.js 15) र भिट ६ (Vite 6) बीचको प्रतिस्पर्धा झन् रोमान्चक बनेको छ।

नेक्स्ट.जेएस १५ ले सर्भर कम्पोनेन्ट्स र सर्भर एक्शनहरूको माध्यमबाट ब्याकइन्ड-फ्रन्टइन्ड जडानलाई अत्यन्तै सुरक्षित र छिटो बनाएको छ, जुन ई-कमर्स र ठूला कर्पोरेट पोर्टलहरूका लागि उत्तम मानिन्छ।

अर्कोतर्फ, भिट ६ ले क्लाइन्ट-साइड सिंगल पेज एप्लिकेसन (SPA) को लागि नयाँ रेकर्ड कायम गरेको छ। यसको एचएमआर (Hot Module Replacement) गति र न्यूनतम बिल समयले गर्दा विकासकर्ताहरू यसलाई ड्यासबोर्ड र सास (SaaS) उत्पादनहरू विकास गर्न अत्यधिक रुचाउँछन्। यस द्वन्द्वले अन्ततः विकासकर्ताहरूलाई आफ्नो आवश्यकता अनुसार सही प्रविधि रोज्ने अवसर दिएको छ।`,
    content_en: `The modern web landscape has reached a mature milestone with the release of Next.js 15 and Vite 6, giving teams two distinct, powerful directions for building highly optimized applications.

Next.js 15 leverages React Server Components and fine-grained server-side caching to build dynamic portals, search-engine-optimized commerce sites, and content dashboards with zero-bundle overhead.

Vite 6, conversely, solidifies its position as the ultimate client-side single-page-application (SPA) builder. Offering sub-millisecond hot module replacement and a unified plugin architecture, Vite 6 is the standard choice for interactive apps, data-rich dashboards, and rapid prototype loops.`,
    source: "Wired Tech Portal",
    date: "2026-06-22",
    category: "Web Development"
  }
];

export const initialProjects: Project[] = [
  {
    id: "proj-1",
    title_np: "द्विभाषिक एआई-संचालित पेशेवर प्रकाशन इन्जिन",
    title_en: "Bilingual AI-Powered Enterprise Content Engine",
    desc_np: "नेपाली र अंग्रेजी दुबै भाषामा पूर्ण रूपमा सञ्चालित हुने एक अत्याधुनिक एआई सीएमएस। यसमा जेमिनी एआईको प्रयोग गरेर लेख लेख्ने, संक्षेप बनाउने र स्वचालित अनुवाद गर्ने सुविधाहरू छन्।",
    desc_en: "An elite content management system with native Nepali and English localization. Powered by Gemini, the system facilitates instant translation, AI article expansion, and smart tag categorization.",
    techStack: ["React 19", "Express", "Vite 6", "Tailwind CSS", "Gemini API"],
    category: "Full Stack AI",
    githubUrl: "https://github.com/harendra-lamsal/bilingual-ai-cms",
    liveUrl: "https://harendralamsal.name.np/cms",
    demoDetails: "Contains a professional administrative backend which uses the Gemini 3.5 Flash model to translate articles from English to Nepali with absolute structural accuracy.",
    features_en: [
      "Real-time dual-language drafting and storage",
      "One-click bilingual translation via server-side Gemini 3.5 Flash proxy",
      "Dynamic tagging and SEO category assignment",
      "Responsive layout optimized with high contrast typography"
    ],
    features_np: [
      "वास्तविक-समय द्विभाषी ड्राफ्टिङ र भण्डारण",
      "सर्भर-साइड जेमिनी ३.५ फ्ल्यास प्रोक्सी मार्फत एक-क्लिक अनुवाद",
      "गतिशील ट्यागिङ र SEO श्रेणी असाइनमेन्ट",
      "उच्च कन्ट्रास्ट टाइपोग्राफी संग अनुकूलित उत्तरदायी लेआउट"
    ],
    caseStudy_en: "This CMS was designed to solve the friction of maintaining bilingual blogs for localized audiences. By using Gemini APIs server-side, it streamlines Nepalese and English content generation seamlessly.",
    caseStudy_np: "यो CMS स्थानीयकृत दर्शकहरूको लागि द्विभाषी ब्लगहरू कायम राख्ने समस्या समाधान गर्न डिजाइन गरिएको हो। सर्भर-साइड जेमिनी एपीआई प्रयोग गरेर, यसले नेपाली र अंग्रेजी सामग्री उत्पादनलाई सहज बनाउँछ।",
    challenges_en: "Handling complex Nepali technical terms accurately without sounding unnatural.",
    challenges_np: "अप्राकृतिक नदेखिने गरी जटिल नेपाली प्राविधिक शब्दहरू सही रूपमा ह्यान्डल गर्ने चुनौती।",
    solutions_en: "Implemented detailed context-enhanced system instructions for the Gemini translation model.",
    solutions_np: "जेमिनी अनुवाद मोडेलको लागि विस्तृत सन्दर्भ-बढाइएको प्रणाली निर्देशनहरू लागू गरियो।"
  },
  {
    id: "proj-2",
    title_np: "सुरक्षित फिनटेक लेजर र माइक्रोसर्भिस ब्याकइन्ड",
    title_en: "Secure FinTech Ledger & Microservice Suite",
    desc_np: "वित्तीय लेनदेनहरू सुरक्षित र छिटो रेकर्ड गर्ने एक उद्यम-स्तरको ब्याकइन्ड प्रणाली। यसमा कमर्सियल सेक्युरिटी, टोकन प्रमाणीकरण र स्वचालित अक्विजिशन सुविधाहरू छन्।",
    desc_en: "An enterprise-grade financial ledger system built with microservices. Employs advanced cryptographic signing, automated reconciliation, and highly performant request queuing.",
    techStack: ["Node.js", "TypeScript", "PostgreSQL", "Express", "Docker"],
    category: "Backend Security",
    githubUrl: "https://github.com/harendra-lamsal/fintech-secure-ledger",
    liveUrl: "https://api.harendralamsal.name.np/ledger",
    demoDetails: "Demonstrates secure OAuth endpoints, real-time auditing, and database optimization handling up to 10,000 transactions per second.",
    features_en: [
      "Cryptographically sealed ledger transaction logging",
      "OAuth 2.0 role-based authorization hierarchy",
      "Automated cross-account ledger reconciliations",
      "High-throughput transactional queue with PostgreSQL clustering"
    ],
    features_np: [
      "क्रिप्टोग्राफिक रूपमा सिल गरिएको लेजर लेनदेन लगिङ",
      "OAuth २.० भूमिका-आधारित प्रमाणीकरण पदानुक्रम",
      "स्वचालित क्रस-खाता बहीखाता मिलान",
      "PostgreSQL क्लस्टरिङको साथ उच्च-थ्रुपुट लेनदेन लाम"
    ],
    caseStudy_en: "Engineered to satisfy stringent compliance demands for double-entry financial bookkeeping with atomic transactions guarantees.",
    caseStudy_np: "परमाणु लेनदेन ग्यारेन्टीहरूको साथ दोहोरो-प्रविष्टि वित्तीय बहीखाताको लागि कडा अनुपालन मागहरू पूरा गर्न ईन्जिनियर गरिएको।",
    challenges_en: "Preventing race conditions during concurrent high-volume debit/credit events.",
    challenges_np: "समवर्ती उच्च-भोल्युम डेबिट/क्रेडिट घटनाहरूको समयमा रेस अवस्थाहरू रोक्न।",
    solutions_en: "Utilized PostgreSQL row-level locking (SELECT ... FOR UPDATE) inside serialized database transaction scopes.",
    solutions_np: "क्रमबद्ध डाटाबेस लेनदेन दायरा भित्र PostgreSQL पङ्क्ति-स्तर लक (SELECT ... FOR UPDATE) प्रयोग गरियो।"
  },
  {
    id: "proj-3",
    title_np: "आईओटी सर्भर जडान र प्रत्यक्ष ड्यासबोर्ड",
    title_en: "IoT Server Connect & Live Telemetry Dashboard",
    desc_np: "आईओटी उपकरणहरूबाट आउने प्रत्यक्ष डेटालाई वेबसकेट मार्फत ड्यासबोर्डमा देखाउने प्रणाली। यसले बिजुली खपत, तापक्रम र नेटवर्क स्थिति प्रत्यक्ष अनुगमन गर्दछ।",
    desc_en: "A real-time IoT visualization dashboard that streams live hardware data using persistent WebSocket connections. Renders sub-second telemetry, voltage charts, and network alerts.",
    techStack: ["React", "WebSockets", "D3.js", "Express", "Tailwind CSS"],
    category: "Real-Time Systems",
    githubUrl: "https://github.com/harendra-lamsal/iot-telemetry-live",
    liveUrl: "https://iot.harendralamsal.name.np",
    demoDetails: "Features custom responsive D3 canvas chart rendering live microsecond signals without any paint degradation.",
    features_en: [
      "Persistent WebSocket connection with automated retry backoff",
      "Live microsecond telemetry stream visualization using D3.js",
      "Threshold anomaly detection with native browser desktop notifications",
      "Multi-node hardware tracking interface"
    ],
    features_np: [
      "स्वचालित पुन: प्रयास ब्याकअफको साथ निरन्तर वेबसकेट जडान",
      "D3.js प्रयोग गरेर लाइभ माइक्रोसेकेन्ड टेलिमेट्री स्ट्रिम भिजुअलाइजेशन",
      "देशी ब्राउजर डेस्कटप सूचनाहरूको साथ थ्रेसहोल्ड विसंगति पत्ता लगाउने",
      "बहु-नोड हार्डवेयर ट्र्याकिङ इन्टरफेस"
    ],
    caseStudy_en: "Designed for industrial telemetry, this system processes and displays high-frequency sensor feeds without causing layout drops or browser memory leaks.",
    caseStudy_np: "औद्योगिक टेलिमेट्रीको लागि डिजाइन गरिएको, यो प्रणालीले लेआउट ड्रप वा ब्राउजर मेमोरी चुहावट बिना उच्च-आवृत्ति सेन्सर फिडहरू प्रक्रिया र प्रदर्शन गर्दछ।",
    challenges_en: "Handling DOM bloating and performance lag during rapid continuous React re-renders.",
    challenges_np: "तीव्र निरन्तर रिएक्ट रि-रेन्डरको समयमा DOM ब्लोटिंग र प्रदर्शन ढिलाइ ह्यान्डल गर्ने।",
    solutions_en: "Bypassed React state for rendering by drawing directly onto an HTML5 Canvas node via D3.",
    solutions_np: "D3 मार्फत सीधै HTML5 क्यानभास नोडमा ड्र गरेर रेन्डरिङको लागि रिएक्ट स्टेट बाईपास गरियो।"
  }
];

export const initialCertificates: Certificate[] = [
  {
    id: "cert-1",
    title_np: "पूर्ण वेब विकास कोर्स",
    title_en: "Complete Web Development Course",
    issuer: "Udemy",
    date: "2026-06-28",
    credentialId: "UC-b44c0cd2-6616-478b-95aa-e50de3973c3f (Ref: 0004)",
    verificationUrl: "https://ude.my/UC-b44c0cd2-6616-478b-95aa-e50de3973c3f",
    platform: "Udemy",
    category: "Web Development",
    year: "2026"
  },
  {
    id: "cert-2",
    title_np: "वर्डप्रेसमार्फत नि:शुल्क वेबसाइट निर्माण",
    title_en: "Build a Free Website with WordPress",
    issuer: "Coursera",
    date: "2026-06-28",
    credentialId: "YYQ4WCFDL2IA",
    verificationUrl: "https://coursera.org/verify/YYQ4WCFDL2IA",
    platform: "Coursera",
    category: "Web Development",
    year: "2026"
  },
  {
    id: "cert-3",
    title_np: "उन्नत नोड.जेएस विकासकर्ता प्रमाणीकरण",
    title_en: "Advanced Node.js Developer - OpenJS Foundation",
    issuer: "OpenJS Foundation",
    date: "2026-02-15",
    credentialId: "OPENJS-NODE-4819",
    verificationUrl: "https://openjsf.org/certification",
    platform: "OpenJS Foundation",
    category: "Backend",
    year: "2026"
  }
];

export const initialSnippets: CodeSnippet[] = [
  {
    id: "snip-1",
    title_np: "रिएक्टमा डिबाउन्स गरिएको कस्टम हुक",
    title_en: "Debounced Value Custom Hook in React",
    code: `import { useState, useEffect } from 'react';

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
}`,
    language: "typescript",
    category: "React Hook"
  },
  {
    id: "snip-2",
    title_np: "एक्सप्रेस सर्भरको सुरक्षित शटडाउन ह्यान्डलर",
    title_en: "Express Server Graceful Shutdown Handler",
    code: `import { Server } from 'http';

export function setupGracefulShutdown(server: Server) {
  const shutdown = (signal: string) => {
    console.log(\`Received \${signal}. Shutting down gracefully...\`);
    server.close(() => {
      console.log('HTTP server closed. Exiting process.');
      process.exit(0);
    });

    // If server takes too long to close, force exit
    setTimeout(() => {
      console.error('Forced shutdown due to timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}`,
    language: "typescript",
    category: "Node Backend"
  }
];

export const initialTutorials: Tutorial[] = [
  {
    id: "tut-1",
    title_np: "सुपाबेस अटो-सिंक गाइड: रिएक्ट १९ र सुपाबेसको आधारभूत कुराहरू",
    title_en: "Supabase Auto-Sync Guide: Mastering React 19 & Supabase",
    category: "Supabase Tutorials",
    tags: ["React 19", "Supabase", "Auto-Sync", "Webhooks"],
    date: "2026-06-29",
    views: 890,
    readTime: "12 min read",
    author: "Harendra Lamsal",
    liveUrl: "https://harendralamsal.name.np/tutorials/supabase-sync",
    downloadUrl: "https://harendralamsal.name.np/resources/supabase-sync.zip",
    steps: [
      {
        title_en: "Setting up your Supabase Client",
        title_np: "सुपाबेस क्लाइन्ट सेटअप गर्दै",
        content_en: "To implement real-time synchronization, we start by constructing our Supabase client with proper database web socket bindings.",
        content_np: "वास्तविक-समय सिङ्क्रोनाइजेसन लागू गर्न, हामी उपयुक्त डाटाबेस वेब सकेट बाइन्डिङको साथ सुपाबेस क्लाइन्ट निर्माण गरेर सुरु गर्छौं।",
        codeSnippet: `import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);`,
        language: "typescript"
      },
      {
        title_en: "Subscribing to Real-Time Changes",
        title_np: "वास्तविक-समय परिवर्तनहरू सदस्यता लिँदै",
        content_en: "We create a custom React hook that subscribes to INSERT/UPDATE database events on our target table.",
        content_np: "हामी एउटा कस्टम रिएक्ट हुक बनाउँछौं जसले लक्षित तालिकामा INSERT/UPDATE डाटाबेस घटनाहरूको सदस्यता लिन्छ।",
        codeSnippet: `import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export function useSupabaseSync<T>(table: string) {
  const [data, setData] = useState<T[]>([]);

  useEffect(() => {
    // Initial fetch
    supabase.from(table).select('*').then(({ data }) => {
      if (data) setData(data);
    });

    // Realtime channel
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
        console.log('Realtime change received!', payload);
        // Sync algorithms here...
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table]);

  return data;
}`,
        language: "typescript"
      }
    ],
    comments: [
      {
        id: "comm-1",
        authorName: "Ramesh Thapa",
        authorEmail: "ramesh@gmail.com",
        content: "अत्यन्तै उपयोगी र विस्तृत ट्युटोरियल! यसले मेरो अर्को परियोजनामा धेरै मद्दत गर्नेछ।",
        date: "2026-06-30"
      }
    ]
  },
  {
    id: "tut-2",
    title_np: "एन्टरप्राइज एपीआई सेक्युरिटी: नोड र एक्सप्रेस बेस्ट प्राक्टिसहरू",
    title_en: "Enterprise API Security: Node & Express Best Practices",
    category: "API Development",
    tags: ["Security", "API", "Express", "Node.js", "OAuth"],
    date: "2026-06-15",
    views: 1120,
    readTime: "15 min read",
    author: "Harendra Lamsal",
    liveUrl: "https://harendralamsal.name.np/tutorials/api-security",
    downloadUrl: "https://harendralamsal.name.np/resources/api-security.zip",
    steps: [
      {
        title_en: "Enforcing Helmet and Rate Limiting",
        title_np: "हेल्मेट र दर सीमितता लागू गर्दै",
        content_en: "Lock down your Express API headers with Helmet and introduce rate limiting to prevent DDoS or brute-force scanning.",
        content_np: "हेल्मेटको साथ तपाईंको एक्सप्रेस एपीआई हेडरहरू सुरक्षित गर्नुहोस् र DDoS वा ब्रूट-फोर्स स्क्यानिङ रोक्नको लागि दर सीमितता लागू गर्नुहोस्।",
        codeSnippet: `import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { error: "Too many requests from this endpoint." }
});
app.use('/api/', limiter);`,
        language: "typescript"
      }
    ]
  }
];
