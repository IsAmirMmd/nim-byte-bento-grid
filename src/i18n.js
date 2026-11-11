// The site's words in Persian (the default) and English. The README's own language is set apart,
// in the workspace's settings.
export const T = {
  fa: {
    dir: "rtl", other: "EN", brand: "نیم‌بایت", product: "README بنتو",
    nav: { build: "ساخت README", skill: "اسکیل", github: "گیت‌هاب" },
    hero: {
      title: "README گیت‌هابتان را بنتویی کنید",
      lead: "کاشی‌ها را بچینید، پهنایشان را عوض کنید و متن هر کدام را بنویسید. آخر کار یک پرامپت آماده می‌گیرید که به ایجنت هوش مصنوعی‌تان می‌دهید تا README را بسازد و روی پروفایلتان بگذارد.",
      start: "شروع چیدن", skill: "اسکیل در گیت‌هاب",
      steps: ["بچینید و اندازه کنید", "متن‌ها را بنویسید", "پرامپت را به ایجنت بدهید"], stepsLabel: "در سه قدم",
      agents: "با Claude Code، Codex، Cursor، Copilot و هر ایجنتی کار می‌کند", agentsLabel: "هر ایجنتی",
      sample: "نمونه: README امیرمحمد", sampleLabel: "پیش‌فرض",
    },
    ws: {
      title: "میز کار", hint: "کاشی‌ها را بکشید و جابه‌جا کنید، لبه‌شان را برای تغییر پهنا بکشید، و روی هر کدام بزنید تا متنش را ویرایش کنید.",
      library: "کاشی‌ها", libraryHint: "روی یکی بزنید یا آن را بکشید و در ردیف دلخواه بیندازید.",
      settings: "تنظیمات", github: "یوزرنیم گیت‌هاب", readmeLang: "زبان README", stats: "کاشی‌های آمار گیت‌هاب",
      prompt: "ساخت پرامپت", reset: "برگشت به نمونه", importJson: "وارد کردن profile.json", exportJson: "دانلود profile.json",
      newRow: "اینجا رها کنید تا ردیف تازه بسازد", width: "پهنا", remove: "حذف کاشی", close: "بستن", edit: "ویرایش کاشی",
      copy: "کپی پرامپت", copied: "کپی شد", promptTitle: "پرامپت برای ایجنت شما",
      promptHelp: "این متن را به Claude Code، Codex، Cursor یا هر ایجنتی که دارید بدهید. عکس‌هایی را که آپلود کرده‌اید هم کنارش بفرستید.",
      statsNote: "آمار نمونه است؛ عددهای واقعی بعد از ساخت از گیت‌هاب می‌آیند.", empty: "کاشی‌ای نمانده؛ از فهرست یکی اضافه کنید.",
    },
    footer: { line: "سایت، داشبورد، ربات تلگرام و مینی اپ تلگرام می‌سازیم.", made: "ساخته‌ی نیم‌بایت", visit: "nimbyte.ir" },
  },
  en: {
    dir: "ltr", other: "فا", brand: "nimbyte", product: "Bento README",
    nav: { build: "Build", skill: "Skill", github: "GitHub" },
    hero: {
      title: "Make your GitHub README a bento grid",
      lead: "Arrange the tiles, change their widths and write each one's text. At the end you get a ready prompt for your AI agent, which builds the README and puts it on your profile.",
      start: "Start arranging", skill: "The skill on GitHub",
      steps: ["Arrange and size", "Write the text", "Hand the prompt to your agent"], stepsLabel: "Three steps",
      agents: "Works with Claude Code, Codex, Cursor, Copilot and any agent", agentsLabel: "Any agent",
      sample: "Sample: Amirmohammad's README", sampleLabel: "Default",
    },
    ws: {
      title: "Workspace", hint: "Drag tiles to move them, drag their edge to change the width, and click one to edit its text.",
      library: "Tiles", libraryHint: "Click one, or drag it into a row.",
      settings: "Settings", github: "GitHub username", readmeLang: "README language", stats: "GitHub stats tiles",
      prompt: "Make the prompt", reset: "Back to the sample", importJson: "Import profile.json", exportJson: "Download profile.json",
      newRow: "Drop here for a new row", width: "Width", remove: "Remove tile", close: "Close", edit: "Edit tile",
      copy: "Copy prompt", copied: "Copied", promptTitle: "The prompt for your agent",
      promptHelp: "Give this to Claude Code, Codex, Cursor or any agent you use, with the pictures you uploaded.",
      statsNote: "Sample numbers; the real ones come from GitHub once it's built.", empty: "No tiles left: add one from the list.",
    },
    footer: { line: "Websites, dashboards, Telegram bots and Mini Apps.", made: "Made by nimbyte", visit: "nimbyte.ir" },
  },
};

// Each kind of tile: its name and a line about it, for the list and the panel.
export const KIND_TEXT = {
  fa: {
    hero: ["معرفی", "اسم و یک خط درباره‌ی شما"], image: ["عکس", "عکس یا آواتار با زیرنویس"], now: ["الان", "کاری که الان می‌کنید"],
    feature: ["کاشی ویژه", "پروژه یا استودیوی اصلی، مرجانی"], stack: ["مهارت‌ها", "ابزارها، دسته به دسته"], experience: ["سابقه", "کارهای قبلی"],
    education: ["تحصیلات", "رشته و دانشگاه"], project: ["پروژه", "اسکرین‌شات، اسم و لینک"], contact: ["راه ارتباطی", "یک یوزرنیم یا آدرس"],
    note: ["یادداشت", "عنوان و یک خط متن"], quote: ["نقل‌قول", "یک جمله و گوینده‌اش"], chips: ["برچسب‌ها", "مثلاً در حال یادگیری"],
    number: ["عدد", "یک عدد بزرگ با توضیح"], status: ["وضعیت", "مثلاً آماده‌ی همکاری"], photo: ["عکس تمام‌قد", "عکسی که کل کاشی را پر می‌کند"],
    links: ["لینک‌ها", "فهرست کوتاه لینک"],
  },
  en: {
    hero: ["Intro", "Your name and one line"], image: ["Picture", "A photo or avatar with a caption"], now: ["Now", "What you do now"],
    feature: ["Feature", "Your main project or studio, in coral"], stack: ["Stack", "Your tools, by group"], experience: ["Experience", "Past roles"],
    education: ["Education", "Degree and school"], project: ["Project", "A screenshot, a name and a link"], contact: ["Contact", "A handle or an address"],
    note: ["Note", "A title and a line"], quote: ["Quote", "A sentence and who said it"], chips: ["Chips", "Like what you're learning"],
    number: ["Number", "A big number with a line"], status: ["Status", "Like open to work"], photo: ["Photo", "A picture filling the tile"],
    links: ["Links", "A short list of links"],
  },
};

export const FIELD_TEXT = {
  fa: { label: "برچسب", title: "عنوان", lead: "توضیح", chips: "برچسب‌ها (با کاما جدا کنید)", src: "عکس", caption: "زیرنویس", tone: "رنگ", href: "لینک",
    meta: "خط دوم", text: "متن", subtitle: "زیرعنوان", titleDir: "جهت عنوان", groups: "هر خط: گروه: مورد، مورد", lines: "هر خط: زمان | نقش | جا",
    image: "اسکرین‌شات واقعی", value: "مقدار", author: "گوینده", items: "مورد‌ها (با کاما جدا کنید)", linkItems: "هر خط: اسم | مقدار", upload: "انتخاب عکس" },
  en: { label: "Label", title: "Title", lead: "Lead", chips: "Chips (comma-separated)", src: "Picture", caption: "Caption", tone: "Tone", href: "Link",
    meta: "Second line", text: "Text", subtitle: "Subtitle", titleDir: "Title direction", groups: "One per line: Group: item, item", lines: "One per line: when | role | where",
    image: "A real screenshot", value: "Value", author: "Author", items: "Items (comma-separated)", linkItems: "One per line: name | value", upload: "Choose a picture" },
};
