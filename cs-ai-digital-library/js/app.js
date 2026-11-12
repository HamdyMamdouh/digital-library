/* ==========================================================================
   المنطق البرمجي والتفاعلات للمكتبة الرقمية للحاسبات والذكاء الاصطناعي
   ========================================================================== */

(function () {
  "use strict";

  // تجهيز مصفوفة المراجع الموحدة
  const R = R0.concat(NEW).map(function (x, i) {
    const p = x.split("|");
    return {
      n: i,
      t: p[0],
      a: p[1],
      y: p[2],
      v: p[3],
      f: p[4],
      k: p[5],
      i: p[6] || ""
    };
  });

  const $ = function (id) {
    return document.getElementById(id);
  };

  // تطبيع النصوص العربية للبحث الذكي
  function nm(s) {
    return String(s)
      .toLowerCase()
      .replace(/[ً-ْـ]/g, "")
      .replace(/[أإآ]/g, "ا")
      .replace(/ى/g, "ي")
      .replace(/ة/g, "ه");
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function yr(x) {
    return parseInt(String(x.y).replace(/\D/g, ""), 10) || 0;
  }

  // بناء فهرس البحث المسبق لكل مرجع
  R.forEach(function (r) {
    const t = r.t.toLowerCase();
    let x = "";
    for (const k in AR) {
      if (t.indexOf(k) > -1) x += " " + AR[k];
    }
    r.h = nm(r.t + " " + r.a + " " + F[r.f][0] + " " + r.v + " " + r.y + x);
  });

  // إدارة المفضلة (قائمتي) عبر LocalStorage
  let S = { r: {} };
  try {
    S = JSON.parse(localStorage.getItem("lib5")) || S;
  } catch (e) {}
  S.r = S.r || {};

  function sv() {
    try {
      localStorage.setItem("lib5", JSON.stringify(S));
    } catch (e) {}
    updateSavedBadge();
  }

  function updateSavedBadge() {
    const count = Object.keys(S.r).length;
    const badge = $("savedBadge");
    if (badge) badge.textContent = count;
  }

  // إشعارات Toast
  function toast(m) {
    const t = $("ts");
    t.textContent = m;
    t.className = "toast on";
    clearTimeout(t._h);
    t._h = setTimeout(function () {
      t.className = "toast";
    }, 2400);
  }

  // حالة التطبيق
  let fl = "all";
  let ty = "fb";
  let mine = false;
  let pg = 1;
  let isListView = false;
  const PS = 36;

  const TY = {
    fb: "📖 كتب متاحة للقراءة",
    fp: "📄 أبحاث مفتوحة",
    ref: "📚 مراجع للاستعارة والشراء",
    all: "🌐 الكل"
  };

  function okT(x) {
    return (
      ty === "all" ||
      (ty === "fb"
        ? x.i && x.k === "b"
        : ty === "fp"
        ? x.i && x.k === "p"
        : !x.i)
    );
  }

  // إحصائيات الهيرو
  $("stt").innerHTML =
    '<div class="stat-pill"><b>' + R.length + "</b><span>مرجع أكاديمي</span></div>" +
    '<div class="stat-pill"><b>' + R.filter(function (r) { return r.i; }).length + "</b><span>متاح للقراءة المباشرة</span></div>" +
    '<div class="stat-pill"><b>' + Object.keys(F).length + "</b><span>مجال تخصصي</span></div>";

  // رسم القائمة الجانبية وشريط التصنيفات
  function side() {
    const c = {};
    let tot = 0;

    R.forEach(function (r) {
      if (okT(r)) {
        c[r.f] = (c[r.f] || 0) + 1;
        tot++;
      }
    });

    let h =
      '<button class="fb" type="button" data-g="f" data-k="all" aria-pressed="' +
      (fl === "all") +
      '"><span>✨ كل المجالات</span><i>' +
      tot +
      "</i></button>";

    let s =
      '<button class="chip" type="button" data-g="f" data-k="all" aria-pressed="' +
      (fl === "all") +
      '">الكل (' +
      tot +
      ")</button>";

    for (const f in F) {
      h +=
        '<button class="fb" type="button" data-g="f" data-k="' +
        f +
        '" aria-pressed="' +
        (fl === f) +
        '"><span>' +
        F[f][2] +
        " " +
        F[f][0] +
        "</span><i>" +
        (c[f] || 0) +
        "</i></button>";

      s +=
        '<button class="chip" type="button" data-g="f" data-k="' +
        f +
        '" aria-pressed="' +
        (fl === f) +
        '">' +
        F[f][2] +
        " " +
        F[f][0] +
        "</button>";
    }

    $("fc").innerHTML = h;
    $("fs").innerHTML = s;

    let th = "";
    for (const t in TY) {
      th +=
        '<button class="fb" type="button" data-g="t" data-k="' +
        t +
        '" aria-pressed="' +
        (ty === t) +
        '"><span>' +
        TY[t] +
        "</span></button>";
    }
    $("tc").innerHTML = th;

    // إظهار زر إعادة الضبط عند وجود فلتر مخصص
    const hasCustomFilter = fl !== "all" || ty !== "fb" || mine || $("q").value.trim() !== "";
    $("resetAllBtn").hidden = !hasCustomFilter;
  }

  function link(r) {
    return r.i.slice(0, 2) === "a:"
      ? "https://arxiv.org/pdf/" + r.i.slice(2)
      : "https://" + r.i.slice(2);
  }

  function cover(x, m) {
    const t = m ? "div" : x.i ? "a" : "button";
    const at = m
      ? ""
      : x.i
      ? ' href="' + link(x) + '" target="_blank" rel="noopener noreferrer"'
      : ' type="button" data-o="' + x.n + '"';

    return (
      "<" +
      t +
      ' class="cv"' +
      at +
      ' data-i="' +
      F[x.f][2] +
      '" style="--c:' +
      F[x.f][1] +
      '" aria-label="' +
      esc(x.t) +
      '">' +
      (x.i ? '<span class="fr">مجاني</span><span class="rd">📖 اقرأ</span>' : "") +
      '<b dir="auto">' +
      esc(x.t) +
      '</b><small dir="auto">' +
      esc(x.a) +
      "</small></" +
      t +
      ">"
    );
  }

  // عرض البطاقات والنتائج
  function draw() {
    const rawQ = $("q").value.trim();
    $("clearSearch").hidden = rawQ.length === 0;

    const q = nm(rawQ).split(/\s+/).filter(Boolean);
    const so = $("so").value;

    const r = R.filter(function (x) {
      return (
        q.every(function (w) {
          return x.h.indexOf(w) > -1;
        }) &&
        (fl === "all" || x.f === fl) &&
        okT(x) &&
        (!mine || S.r[x.n])
      );
    });

    r.sort(function (a, b) {
      return so === "n"
        ? yr(b) - yr(a)
        : so === "o"
        ? yr(a) - yr(b)
        : so === "a"
        ? a.t.localeCompare(b.t)
        : ((a.n * 37) % 101) - ((b.n * 37) % 101);
    });

    $("cn").textContent =
      r.length + " نتيجة" + (fl !== "all" ? " في " + F[fl][0] : "");

    const pill = $("activePill");
    if (mine) {
      pill.hidden = false;
      pill.textContent = "★ قائمتي المحفوظة";
    } else if (ty !== "fb") {
      pill.hidden = false;
      pill.textContent = TY[ty];
    } else {
      pill.hidden = true;
    }

    const gridEl = $("gd");
    if (r.length) {
      gridEl.innerHTML = r
        .slice(0, pg * PS)
        .map(function (x, idx) {
          const delay = Math.min(idx % PS, 12) * 20;
          const isSaved = !!S.r[x.n];
          return (
            '<article class="bk" style="animation-delay:' +
            delay +
            'ms">' +
            cover(x) +
            '<div class="bk-body">' +
            '<div class="bk-title-list" dir="auto">' +
            esc(x.t) +
            "</div>" +
            '<div class="m"><span class="m-author" dir="auto">' +
            esc(x.a) +
            "</span>" +
            esc(x.y) +
            " · " +
            esc(x.v) +
            "</div>" +
            '<div class="acts">' +
            (x.i
              ? '<a class="btn p" href="' +
                link(x) +
                '" target="_blank" rel="noopener noreferrer">📖 اقرأ</a>'
              : "") +
            '<button class="btn" type="button" data-o="' +
            x.n +
            '">تفاصيل</button>' +
            '<button class="btn ' +
            (isSaved ? "saved-btn" : "") +
            '" type="button" data-a="s" data-n="' +
            x.n +
            '" aria-label="حفظ في قائمتي" title="' +
            (isSaved ? "إزالة من قائمتي" : "حفظ في قائمتي") +
            '">' +
            (isSaved ? "★" : "☆") +
            "</button>" +
            "</div></div></article>"
          );
        })
        .join("");
    } else {
      gridEl.innerHTML =
        '<div class="empty">' +
        '<span class="empty-icon">🔍</span>' +
        "<h3>مفيش نتائج مطابقة لبحثك دلوقتي</h3>" +
        '<p>جرّب كلمة تانية، أو اختار <b>"الكل"</b> من قائمة النوع، أو كمّل بحثك في المحركات الأكاديمية تحت.</p>' +
        "</div>";
    }

    $("mo").hidden = r.length <= pg * PS;

    const Q = encodeURIComponent(rawQ);
    $("eg").innerHTML = E.map(function (e) {
      return (
        '<a class="btn" href="' +
        e[1] +
        (e[1].slice(-1) === "/" ? "" : Q) +
        '" target="_blank" rel="noopener noreferrer">' +
        e[0] +
        " ↗</a>"
      );
    }).join("");
  }

  function go() {
    pg = 1;
    side();
    draw();
  }

  // تنسيق الاستشهادات الأكاديمية
  function apa(x) {
    return x.a + " (" + x.y + "). " + x.t + ". " + x.v + ".";
  }

  function bib(x) {
    const au = x.a
      .replace(/ et al\./, "")
      .split(/,\s*/)
      .join(" and ");
    const k = (x.a.split(/[ ,]/)[0] + x.y).replace(/\W/g, "").toLowerCase();
    return (
      "@" +
      (x.k === "b" ? "book" : "article") +
      "{" +
      k +
      ",
  author = {" +
      au +
      (/et al/.test(x.a) ? " and others" : "") +
      "},
  title = {" +
      x.t +
      "},
  year = {" +
      x.y +
      "},
  " +
      (x.k === "b" ? "publisher" : "journal") +
      " = {" +
      x.v +
      "}
}"
    );
  }

  function copy(t, m) {
    (navigator.clipboard
      ? navigator.clipboard.writeText(t)
      : Promise.reject()
    ).then(
      function () {
        toast(m);
      },
      function () {
        toast("انسخ يدوياً: " + t.slice(0, 80));
      }
    );
  }

  // نافذة تفاصيل المرجع
  function openB(n) {
    const x = R[n];
    const q = encodeURIComponent(x.t);
    const rel = R.filter(function (r) {
      return (
        r.f === x.f && r.n !== n && r.k === x.k && Boolean(r.i) === Boolean(x.i)
      );
    })
      .sort(function (a, b) {
        return Math.abs(yr(a) - yr(x)) - Math.abs(yr(b) - yr(x));
      })
      .slice(0, 4);

    const rd = x.i
      ? '<a class="btn p" href="' +
        link(x) +
        '" target="_blank" rel="noopener noreferrer">📖 اقرأ الآن</a>'
      : '<a class="btn p" href="https://openlibrary.org/search?q=' +
        q +
        '" target="_blank" rel="noopener noreferrer">استعره من Open Library</a>' +
        '<a class="btn" href="https://www.google.com/search?tbm=bks&q=' +
        q +
        '" target="_blank" rel="noopener noreferrer">معاينة Google Books</a>' +
        '<a class="btn" href="https://scholar.google.com/scholar?q=' +
        q +
        '" target="_blank" rel="noopener noreferrer">Scholar</a>';

    $("dc").innerHTML =
      '<div class="dh">' +
      cover(x, 1) +
      '<div style="flex:1">' +
      '<h2 dir="auto">' +
      esc(x.t) +
      "</h2>" +
      '<div class="m" style="font-size:.95rem" dir="auto">' +
      esc(x.a) +
      "</div>" +
      '<div style="margin:10px 0;display:flex;gap:6px;flex-wrap:wrap">' +
      '<span class="tag">📅 ' +
      esc(x.y) +
      "</span>" +
      '<span class="tag">🏛️ ' +
      esc(x.v) +
      "</span>" +
      '<span class="tag">' +
      F[x.f][2] +
      " " +
      F[x.f][0] +
      "</span>" +
      '<span class="tag">' +
      (x.k === "b" ? "📘 كتاب" : "📄 بحث مرجعي") +
      "</span>" +
      (x.i ? '<span class="tag tag-free">✓ متاح للقراءة المجانية</span>' : "") +
      "</div>" +
      '<div class="acts">' +
      rd +
      "</div>" +
      '<div class="acts" style="margin-top:8px">' +
      '<button class="btn ' +
      (S.r[n] ? "saved-btn" : "") +
      '" type="button" data-a="s" data-n="' +
      n +
      '">' +
      (S.r[n] ? "★ محفوظ في قائمتي" : "☆ احفظ في قائمتي") +
      "</button>" +
      '<button class="btn" type="button" data-a="apa" data-n="' +
      n +
      '">📋 نسخ APA</button>' +
      '<button class="btn" type="button" data-a="bib" data-n="' +
      n +
      '">📎 نسخ BibTeX</button>' +
      '<button class="btn" type="button" id="cx">✕ إغلاق</button>' +
      "</div></div></div>" +
      (x.i
        ? '<div class="note">الكتاب ده بيفتح من الموقع الرسمي للمؤلف أو الناشر في تبويب جديد، لأن المواقع دي بتمنع عرض الكتب جوه صفحات تانية.</div>'
        : '<div class="note">الكتاب ده محمي بحقوق النشر ومش متاح للقراءة المجانية، فمش هنقدر نعرض نصه هنا. تقدر تستعيره أو تعاين أجزاء منه من الأزرار اللي فوق، أو تلاقيه في مكتبة كليتك أو بنك المعرفة المصري.</div>') +
      (rel.length
        ? '<h3 class="rel-heading">📚 مراجع مشابهة في نفس المجال</h3><div class="rel">' +
          rel
            .map(function (r) {
              return cover(r);
            })
            .join("") +
          "</div>"
        : "");

    if (!$("dg").open) $("dg").showModal();
    $("dc").scrollTop = 0;
  }

  // تفويض الأحداث العام (Event Delegation)
  document.addEventListener("click", function (e) {
    const t = e.target;

    if (t.id === "cx") {
      $("dg").close();
      return;
    }

    // اقتراحات البحث السريع
    const sq = t.closest("[data-sq]");
    if (sq) {
      $("q").value = sq.dataset.sq;
      go();
      $("q").focus();
      return;
    }

    // الفلاتر
    const g = t.closest("[data-g]");
    if (g) {
      if (g.dataset.g === "f") fl = g.dataset.k;
      else ty = g.dataset.k;
      go();
      $("sd").classList.remove("on");
      return;
    }

    // فتح تفاصيل الكتاب
    const o = t.closest("[data-o]");
    if (o) {
      openB(+o.dataset.o);
      return;
    }

    // أزرار الإجراءات (حفظ، نسخ APA، نسخ BibTeX)
    const a = t.closest("[data-a]");
    if (a) {
      const x = R[+a.dataset.n];
      const k = a.dataset.a;
      if (k === "s") {
        if (S.r[x.n]) {
          delete S.r[x.n];
          toast("تمت الإزالة من قائمتك");
        } else {
          S.r[x.n] = 1;
          toast("اتحفظ في قائمتك ★");
        }
        sv();
        draw();
        if ($("dg").open) openB(x.n);
      } else if (k === "apa") {
        copy(apa(x), "اتنسخ الاستشهاد APA ✓");
      } else if (k === "bib") {
        copy(bib(x), "اتنسخ BibTeX ✓");
      }
    }
  });

  // إغلاق النافذة عند الضغط على الخلفية
  $("dg").onclick = function (e) {
    if (e.target === this) this.close();
  };

  // البحث والترتيب
  $("q").oninput = go;
  $("so").onchange = go;

  // مسح البحث
  $("clearSearch").onclick = function () {
    $("q").value = "";
    go();
    $("q").focus();
  };

  // إعادة ضبط كافة الفلاتر
  $("resetAllBtn").onclick = function () {
    fl = "all";
    ty = "fb";
    mine = false;
    $("mb").setAttribute("aria-pressed", "false");
    $("q").value = "";
    $("so").value = "f";
    go();
    toast("تمت إعادة ضبط الفلاتر");
  };

  // النقر على الشعار لإعادة التهيئة
  $("brandReset").onclick = function (e) {
    e.preventDefault();
    fl = "all";
    ty = "fb";
    mine = false;
    $("mb").setAttribute("aria-pressed", "false");
    $("q").value = "";
    go();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // عرض المزيد
  $("mo").onclick = function () {
    pg++;
    draw();
  };

  // فتح/غلق الفلاتر على الموبايل
  $("fo").onclick = function () {
    $("sd").classList.toggle("on");
  };

  // قائمتي
  $("mb").onclick = function () {
    mine = !mine;
    this.setAttribute("aria-pressed", mine);
    go();
  };

  // تبديل المظهر (نهاري / ليلي)
  $("tb").onclick = function () {
    const r = document.documentElement;
    const isDark = r.dataset.theme
      ? r.dataset.theme === "dark"
      : matchMedia("(prefers-color-scheme:dark)").matches;
    r.dataset.theme = isDark ? "light" : "dark";
    toast(r.dataset.theme === "dark" ? "تم تفعيل الوضع الليلي 🌙" : "تم تفعيل الوضع النهاري ☀️");
  };

  // تبديل طريقة العرض (شبكة / قائمة)
  $("viewModeBtn").onclick = function () {
    isListView = !isListView;
    $("gd").classList.toggle("list-view", isListView);
    this.innerHTML = isListView
      ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg><span class="hide-xs">قائمة</span>'
      : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg><span class="hide-xs">شبكة</span>';
  };

  // اختصار لوحة المفاتيح "/" للتركيز على البحث
  document.addEventListener("keydown", function (e) {
    if (
      e.key === "/" &&
      document.activeElement.tagName !== "INPUT" &&
      document.activeElement.tagName !== "TEXTAREA" &&
      !$("dg").open
    ) {
      e.preventDefault();
      $("q").focus();
    }
  });

  // تأثير التمرير للهيدر وزر العودة للأعلى
  window.addEventListener(
    "scroll",
    function () {
      const y = window.scrollY;
      document.querySelector(".site-header").classList.toggle("scrolled", y > 16);
      $("backTop").classList.toggle("visible", y > 450);
    },
    { passive: true }
  );

  $("backTop").onclick = function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // مساعد البحث بالذكاء الاصطناعي (كما هو في الكود الأصلي)
  $("ai").onclick = async function () {
    const q = $("q").value.trim();
    const o = $("aio");
    if (!q) {
      toast("اكتب موضوع بحثك الأول");
      return;
    }
    o.hidden = false;
    o.textContent = "جاري التفكير...";
    try {
      const sm = await window.claude.use("sample");
      if (!sm) {
        o.textContent = "المساعد مش متاح هنا.";
        return;
      }
      const r = await sm(
        "أنت مساعد بحث لطالب في كلية حاسبات. موضوعه: " +
          q +
          "
اكتب بالعربي المبسط وباختصار: 1) شرح الموضوع في 3 جمل. 2) 8 كلمات مفتاحية بالإنجليزية تنفع في البحث مع مصطلحات بديلة. 3) أنواع المصادر المفيدة (كتب مرجعية، survey...). ممنوع تذكر أسماء كتب أو أبحاث أو مؤلفين أو DOI أو روابط."
      );
      o.textContent = r.text;
    } catch (e) {
      o.textContent = "تعذر الحصول على رد (" + ((e && e.code) || "خطأ") + ").";
    }
  };

  try {
    if (window.claude && claude.use) {
      claude.use("sample").then(function (x) {
        if (x) $("ai").hidden = false;
      });
    }
  } catch (e) {}

  // التهيئة الأولية
  updateSavedBadge();
  side();
  draw();
})();
