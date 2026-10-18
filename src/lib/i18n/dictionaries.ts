/**
 * Bilingual dictionaries (English + Arabic). Keep both objects in sync:
 * `ar` must expose exactly the same keys as `en`.
 */
export const dictionaries = {
  en: {
    common: {
      store: "Our Store",
      secureCheckout: "Secure checkout powered by PayPal",
      buyNow: "Buy now",
      learnMore: "See how it works",
      only: "Only",
      was: "was",
      free: "Free",
      back: "Back",
      close: "Close",
    },
    nav: {
      howItWorks: "How it works",
      features: "Features",
      reviews: "Reviews",
      faq: "FAQ",
      overview: "Overview",
      products: "Products",
      orders: "Orders",
      telegram: "Telegram Bot",
      chatbot: "Chatbot",
      payments: "Payments",
      settings: "Settings",
      signOut: "Sign out",
      dashboard: "Dashboard",
    },
    trust: {
      secure: "Secure PayPal checkout",
      shipping: "Fast worldwide shipping",
      returns: "30-day money-back guarantee",
      support: "Real human support",
    },
    hero: {
      save: "Save",
      limited: "Limited time offer",
      ratingFrom: "from happy customers",
      guaranteeShort: "Money-back guarantee",
    },
    benefits: {
      title: "Why shoppers love it",
      subtitle: "Everything you need, nothing you don't.",
      b1Title: "Premium quality",
      b1Text: "Built with carefully selected materials and strict quality control.",
      b2Title: "Fast & tracked delivery",
      b2Text: "Every order ships with tracking and arrives ready to enjoy.",
      b3Title: "Risk-free purchase",
      b3Text: "If you are not satisfied, return it within 30 days for a full refund.",
      b4Title: "Loved by thousands",
      b4Text: "Rated highly by customers who bought and kept coming back.",
    },
    how: {
      title: "Get yours in 3 easy steps",
      subtitle: "Ordering takes less than a minute.",
      s1Title: "Choose your product",
      s1Text: "Review the details above and confirm it is the right fit for you.",
      s2Title: "Pay securely",
      s2Text: "Complete your details and pay safely with PayPal or card.",
      s3Title: "Fast delivery",
      s3Text: "We ship within 24 hours and send you tracking right away.",
    },
    reviews: {
      title: "What our customers say",
      subtitle: "Real feedback from real buyers.",
      r1: "Exactly as described. Arrived faster than I expected and the quality is excellent.",
      r1Name: "Sarah M.",
      r2: "I was hesitant at first, but it exceeded my expectations. Already recommended it to friends.",
      r2Name: "Omar K.",
      r3: "Great value for the price. Support answered my question within minutes.",
      r3Name: "Lina T.",
      verified: "Verified buyer",
    },
    faq: {
      title: "Frequently asked questions",
      q1: "How long does shipping take?",
      a1: "Orders are dispatched within 24 hours. Delivery usually takes 3-7 business days with tracking.",
      q2: "Is my payment secure?",
      a2: "Yes. Payments are processed by PayPal. We never see or store your card details.",
      q3: "Can I return it?",
      a3: "Absolutely. You have 30 days to return the product for a full refund.",
      q4: "How do I contact support?",
      a4: "Use the chat button on this page and we will reply as soon as possible.",
    },
    guarantee: {
      title: "Shop with total confidence",
      text: "Your purchase is protected by our 30-day money-back guarantee. If anything is wrong, we make it right.",
    },
    finalCta: {
      title: "Ready to get yours?",
      text: "Join thousands of happy customers today.",
      button: "Order now",
    },
    checkout: {
      title: "Complete your order",
      fullName: "Full name",
      email: "Email",
      phone: "Phone",
      address: "Shipping address",
      total: "Total",
      processing: "Processing payment...",
      paypalMissing:
        "PayPal is not configured yet. Add your PayPal keys to the environment or dashboard to enable checkout.",
      secureNote: "Your payment is processed securely by PayPal.",
      confirmedTitle: "Order confirmed!",
      confirmedText: "Your payment was received and the store has been notified.",
      orderRef: "Order reference",
      nameRequired: "Name is required",
      emailRequired: "Valid email is required",
      phoneRequired: "Phone is required",
      addressRequired: "Shipping address is required",
      completeFirst: "Please complete your details first.",
    },
    preparing: {
      title: "Our store is being prepared",
      text: "The owner is setting up a new product. Please check back in a little while.",
    },
    footer: {
      rights: "All rights reserved.",
      payments: "Payments secured by PayPal",
    },
    lp: {
      eyebrow: "Naturally made quality",
      category: "Category",
      explore: "Explore More",
      trustHeadline: "Trusted by shoppers worldwide",
      rating: "Average rating",
      orders: "Orders delivered",
      storyTitle: "Our story",
      storyText:
        "We built this store around one belief: a single great product beats a hundred average ones. Every item is chosen for quality, tested by real customers, and backed by a promise we stand behind.",
      storyMore: "Add item",
      storyBrowse: "View details",
      collectionTitle: "Explore the collection",
      collectionSubtitle: "Hand-picked products from our store.",
      view: "View",
      whatMakesTitle: "What makes it special",
      closingTitle: "100% quality you can trust",
      closingText:
        "Our commitment is to give you real value: honest materials, careful making, and support that answers when you call.",
      closingCta: "Order now",
      story: "Story",
      products: "Products",
      contact: "Contact",
    },
  },
  ar: {
    common: {
      store: "متجرنا",
      secureCheckout: "دفع آمن بواسطة بايبال",
      buyNow: "اشتر الآن",
      learnMore: "كيف يعمل",
      only: "فقط",
      was: "كان",
      free: "مجانا",
      back: "رجوع",
      close: "إغلاق",
    },
    nav: {
      howItWorks: "كيف يعمل",
      features: "المميزات",
      reviews: "آراء العملاء",
      faq: "الأسئلة الشائعة",
      overview: "النظرة العامة",
      products: "المنتجات",
      orders: "الطلبات",
      telegram: "بوت تلغرام",
      chatbot: "الشات بوت",
      payments: "المدفوعات",
      settings: "الإعدادات",
      signOut: "تسجيل الخروج",
      dashboard: "لوحة التحكم",
    },
    trust: {
      secure: "دفع آمن عبر بايبال",
      shipping: "شحن سريع لكل العالم",
      returns: "استرجاع المال خلال 30 يوما",
      support: "دعم بشري حقيقي",
    },
    hero: {
      save: "وفّر",
      limited: "عرض لفترة محدودة",
      ratingFrom: "من عملاء سعداء",
      guaranteeShort: "ضمان استرجاع المال",
    },
    benefits: {
      title: "لماذا يعشقه العملاء",
      subtitle: "كل ما تحتاجه، ولا شيء زائد.",
      b1Title: "جودة فاخرة",
      b1Text: "مصنوع من مواد منتقاة بعناية مع رقابة صارمة على الجودة.",
      b2Title: "توصيل سريع ومتتبع",
      b2Text: "كل طلب يُشحن مع رقم تتبع ويصل جاهزا للاستعمال.",
      b3Title: "شراء بلا مخاطرة",
      b3Text: "إن لم تقتنع، أرجعه خلال 30 يوما واسترجع مالك كاملا.",
      b4Title: "محبوب من الآلاف",
      b4Text: "تقييمات عالية من عملاء اشتروا وعادوا مرة بعد مرة.",
    },
    how: {
      title: "احصل عليه في 3 خطوات سهلة",
      subtitle: "الطلب يستغرق أقل من دقيقة.",
      s1Title: "اختر منتجك",
      s1Text: "راجع التفاصيل أعلاه وتأكد أنه المناسب لك.",
      s2Title: "ادفع بأمان",
      s2Text: "أكمل بياناتك وادفع بأمان عبر بايبال أو البطاقة.",
      s3Title: "توصيل سريع",
      s3Text: "نشحن خلال 24 ساعة ونرسل لك رقم التتبع فورا.",
    },
    reviews: {
      title: "ماذا يقول عملاؤنا",
      subtitle: "آراء حقيقية من مشترين حقيقيين.",
      r1: "مطابق تماما للوصف. وصل أسرع مما توقعت والجودة ممتازة.",
      r1Name: "سارة م.",
      r2: "ترددت في البداية، لكنه فاق توقعاتي. رشحته لأصدقائي بالفعل.",
      r2Name: "عمر ك.",
      r3: "قيمة رائعة مقابل السعر. أجاب الدعم على سؤالي في دقائق.",
      r3Name: "لينا ت.",
      verified: "مشتر موثق",
    },
    faq: {
      title: "الأسئلة الشائعة",
      q1: "كم يستغرق الشحن؟",
      a1: "تُشحن الطلبات خلال 24 ساعة. ويستغرق التوصيل عادة من 3 إلى 7 أيام عمل مع التتبع.",
      q2: "هل دفعي آمن؟",
      a2: "نعم. تتم معالجة المدفوعات عبر بايبال، ولا نرى بيانات بطاقتك ولا نخزنها.",
      q3: "هل يمكنني الإرجاع؟",
      a3: "بالتأكيد. لديك 30 يوما لإرجاع المنتج واسترجاع مالك كاملا.",
      q4: "كيف أتواصل مع الدعم؟",
      a4: "استعمل زر المحادثة في هذه الصفحة وسنرد عليك في أقرب وقت.",
    },
    guarantee: {
      title: "اشتر بثقة تامة",
      text: "مشتريك محمي بضمان استرجاع المال خلال 30 يوما. وإن كان في الأمر خلل، نصلحه لك.",
    },
    finalCta: {
      title: "جاهز لتحصل عليه؟",
      text: "انضم إلى آلاف العملاء السعداء اليوم.",
      button: "اطلب الآن",
    },
    checkout: {
      title: "أكمل طلبك",
      fullName: "الاسم الكامل",
      email: "البريد الإلكتروني",
      phone: "الهاتف",
      address: "عنوان الشحن",
      total: "المجموع",
      processing: "جارٍ معالجة الدفع...",
      paypalMissing:
        "لم يتم ضبط بايبال بعد. أضف مفاتيح بايبال في البيئة أو في لوحة التحكم لتفعيل الدفع.",
      secureNote: "تتم معالجة دفعتك بأمان عبر بايبال.",
      confirmedTitle: "تم تأكيد الطلب!",
      confirmedText: "تم استلام دفعتك وتم إشعار المتجر.",
      orderRef: "مرجع الطلب",
      nameRequired: "الاسم مطلوب",
      emailRequired: "بريد إلكتروني صحيح مطلوب",
      phoneRequired: "الهاتف مطلوب",
      addressRequired: "عنوان الشحن مطلوب",
      completeFirst: "أكمل بياناتك أولا من فضلك.",
    },
    preparing: {
      title: "متجرنا قيد التجهيز",
      text: "المالك يجهّز منتجا جديدا. عد إلينا بعد قليل.",
    },
    footer: {
      rights: "جميع الحقوق محفوظة.",
      payments: "مدفوعات مؤمنة بواسطة بايبال",
    },
    lp: {
      eyebrow: "جودة طبيعية أصيلة",
      category: "الفئة",
      explore: "اكتشف المزيد",
      trustHeadline: "موثوق من المتسوقين حول العالم",
      rating: "متوسط التقييم",
      orders: "طلب تم توصيله",
      storyTitle: "قصتنا",
      storyText:
        "بنينا هذا المتجر على يقين واحد: منتج واحد ممتاز خير من مئة منتج عادي. كل قطعة تُختار لجودتها، ويجربها عملاء حقيقيون، ويسندها وعد نفي به.",
      storyMore: "أضف عنصرا",
      storyBrowse: "عرض التفاصيل",
      collectionTitle: "استكشف التشكيلة",
      collectionSubtitle: "منتجات منتقاة بعناية من متجرنا.",
      view: "عرض",
      whatMakesTitle: "ما الذي يميزه",
      closingTitle: "جودة 100% تثق بها",
      closingText:
        "التزامنا أن نمنحك قيمة حقيقية: مواد صادقة، وصناعة متقنة، ودعم يجيبك حين تنادي.",
      closingCta: "اطلب الآن",
      story: "قصتنا",
      products: "المنتجات",
      contact: "تواصل",
    },
  },
} as const;

export type Lang = keyof typeof dictionaries;
export type Dict = (typeof dictionaries)["en"];

export const LANGS: Lang[] = ["en", "ar"];

export function getDictionary(lang: Lang): Dict {
  return (dictionaries[lang] ?? dictionaries.en) as Dict;
}

/** Resolve a dot path such as "checkout.total" against a dictionary. */
export function lookup(dict: Dict, path: string): string {
  const value = path
    .split(".")
    .reduce<unknown>(
      (acc, key) =>
        acc && typeof acc === "object"
          ? (acc as Record<string, unknown>)[key]
          : undefined,
      dict,
    );
  return typeof value === "string" ? value : path;
}
