#!/usr/bin/env python3
"""Welmnt corporate site — one chrome, nine pages.

Structure: every section is indexed in a left rail, the way a report indexes
its sections. The five-mark (the assessment's five-point scale) is the marker.
"""
import pathlib

OUT = pathlib.Path(__file__).parent

NAV = [
    ("index.html", "Home"), ("about.html", "About"), ("programmes.html", "Programmes"),
    ("projects.html", "Projects"), ("platform.html", "Platform"),
    ("parents.html", "For Parents"), ("faq.html", "FAQ"),
]

FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">'
         '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
         '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?'
         'family=Readex+Pro:wght@200;300;400;500;600'
         '&family=Literata:opsz,wght@7..72,300;7..72,400;7..72,500&display=swap">')

FIVE = '<span class="five" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>'


def head(title, desc, page):
    nav = "".join(f'<a href="{h}"{" aria-current=\"page\"" if h == page else ""}>{t}</a>'
                  for h, t in NAV)
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:type" content="website">
<link rel="icon" href="assets/Logo.svg" type="image/svg+xml">
{FONTS}
<link rel="stylesheet" href="styles.css">
</head>
<body>
<header class="site">
  <div class="wrap bar">
    <a class="mark" href="index.html"><img src="assets/Logo.svg" alt=""><b>Welmnt</b></a>
    <nav>{nav}<a class="pill" href="contact.html">Contact</a></nav>
  </div>
</header>
<main>
"""


def sec(label, content, cls="", sid=""):
    """A section, indexed in the rail."""
    i = f' id="{sid}"' if sid else ""
    c = f" {cls}" if cls else ""
    return f"""
<section class="sec{c}"{i}>
  <div class="wrap">
    <div class="railcol"><div class="sticky">{FIVE}<span class="idx">{label}</span></div></div>
    <div class="col">{content}</div>
  </div>
</section>"""


def phead(label, h1, lede):
    return f"""
<div class="phead">
  <div class="wrap">
    <div class="railcol">{FIVE}<span class="eyebrow">{label}</span></div>
    <div class="col"><h1>{h1}</h1><p class="lede">{lede}</p></div>
  </div>
</div>"""


CLOSER = f"""
<section class="closer">
  <div class="wrap">
    <div class="railcol">{FIVE}<span class="eyebrow">Next step</span></div>
    <div class="col">
      <h2>Bring Welmnt to your school.</h2>
      <p>Tell us the school, the audience and roughly when. We come back with a format and a date —
        and a written proposal within 48 hours of agreeing the shape.</p>
      <div class="cta-row">
        <a class="btn" href="contact.html">Start a conversation</a>
        <a class="btn btn-ghost" href="programmes.html">See the programmes</a>
      </div>
    </div>
  </div>
</section>"""


def foot(closer=True):
    links = "".join(f'<li><a href="{h}">{t}</a></li>' for h, t in NAV)
    return (CLOSER if closer else "") + f"""
</main>
<footer class="site">
  <div class="wrap">
    <div class="fgrid">
      <div class="fabout">
        <a class="mark" href="index.html"><img src="assets/Logo.svg" alt=""><b>Welmnt</b></a>
        <p>Mental-health education for schools. Empowering young minds, one step at a time.</p>
        <div class="social">
          <a href="https://www.linkedin.com/company/welmnt" target="_blank" rel="noopener" aria-label="Welmnt on LinkedIn"><img src="assets/linkedin.svg" alt=""></a>
          <a href="https://www.instagram.com/welmnt" target="_blank" rel="noopener" aria-label="Welmnt on Instagram"><img src="assets/instagram.svg" alt=""></a>
        </div>
      </div>
      <div><h4>Site</h4><ul>{links}<li><a href="contact.html">Contact</a></li></ul></div>
      <div><h4>Work</h4><ul>
        <li><a href="projects.html#family-academy">TikTok Family Academy</a></li>
        <li><a href="projects.html#assessment">Parenting assessment</a></li>
        <li><a href="programmes.html#awareness-day">Awareness Day</a></li>
        <li><a href="programmes.html#whole-school">Whole-School Day</a></li>
      </ul></div>
      <div><h4>Contact</h4><ul>
        <li><a href="mailto:info@welmnt.me">info@welmnt.me</a></li><li>Cairo, Egypt</li></ul>
        <p style="color:var(--ink-faint);font-family:var(--ui);font-size:12.5px;margin-top:13px;line-height:1.6">
          Welmnt for Educational<br>and Technical Services LLC</p>
      </div>
    </div>
    <div class="fbot">
      <img class="bee" src="assets/bee.svg" alt="">
      <span>© 2026 Welmnt · Founded 2024 · Cairo, Egypt</span>
      <span class="sp"><a href="privacy.html">Privacy</a></span>
    </div>
  </div>
</footer>
</body>
</html>
"""


ROLES = """
<div class="roles">
  <div class="role" style="--rc:#7B5EA0">
    <div class="art"><img src="assets/StudentBG.svg" alt="Buddy, the Welmnt student character"></div>
    <div class="who">Buddy</div><div class="sub">Student</div>
    <ul><li>Mood tracking</li><li>Interactive journaling</li><li>AI mental coach</li>
      <li>Personalised curriculum</li><li>Mental-fitness milestones</li></ul>
  </div>
  <div class="role" style="--rc:#D4566B">
    <div class="art"><img src="assets/ParentBG.svg" alt="The Welmnt parent character"></div>
    <div class="who">Parent</div><div class="sub">Family</div>
    <ul><li>Track progress</li><li>Monitor wellbeing</li><li>Alerts for time-sensitive situations</li>
      <li>No access to private entries</li></ul>
  </div>
  <div class="role" style="--rc:#D1560F">
    <div class="art"><img src="assets/TeacherBG.svg" alt="The Welmnt teacher character"></div>
    <div class="who">Teacher</div><div class="sub">Classroom</div>
    <ul><li>Detailed student insights</li><li>Assign personalised tasks</li>
      <li>Tailor curricula to need</li><li>Classroom dashboard</li></ul>
  </div>
  <div class="role" style="--rc:#B33A34">
    <div class="art"><img src="assets/AdministratorBG.svg" alt="The Welmnt administrator character"></div>
    <div class="who">Administrator</div><div class="sub">School-wide</div>
    <ul><li>Analytics &amp; reports</li><li>User management</li><li>School-wide standards</li>
      <li>Policy implementation</li></ul>
  </div>
</div>"""

CONSTRUCTS = """
<div class="constructs">
  <div class="row"><span class="bar" style="--cc:var(--k1)"></span><span class="en">Inappropriate expectations</span><span class="arb">التوقعات غير المناسبة</span></div>
  <div class="row"><span class="bar" style="--cc:var(--k2)"></span><span class="en">Empathy &amp; emotional understanding</span><span class="arb">التعاطف والفهم العاطفي</span></div>
  <div class="row"><span class="bar" style="--cc:var(--k3)"></span><span class="en">Corporal punishment</span><span class="arb">العقاب البدني</span></div>
  <div class="row"><span class="bar" style="--cc:var(--k4)"></span><span class="en">Role reversal</span><span class="arb">انعكاس الأدوار</span></div>
  <div class="row"><span class="bar" style="--cc:var(--k5)"></span><span class="en">Power &amp; independence</span><span class="arb">السلطة والاستقلالية</span></div>
</div>"""

# The signature: one real item from the assessment Welmnt runs in schools.
HERO_ITEM = """
<div class="item">
  <div class="top">""" + FIVE + """<span class="lbl">From the assessment</span>
    <span class="of">Item 1 of 25</span></div>
  <p class="q">الطفل لازم يبقى قادر يتحكم في نفسه من بدري، حتى لو عنده سنة أو سنتين.</p>
  <div class="scale" role="group" aria-label="Answer the item">
    <button type="button" aria-pressed="false" style="--kc:var(--k1)"><span class="dot"></span>أوافق بشدة</button>
    <button type="button" aria-pressed="false" style="--kc:var(--k2)"><span class="dot"></span>أوافق</button>
    <button type="button" aria-pressed="false" style="--kc:var(--k3)"><span class="dot"></span>غير متأكد</button>
    <button type="button" aria-pressed="false" style="--kc:var(--k4)"><span class="dot"></span>أعارض</button>
    <button type="button" aria-pressed="false" style="--kc:var(--k5)"><span class="dot"></span>أعارض بشدة</button>
  </div>
  <div class="after" id="after">
    <p><strong>That's one item. There are twenty-five.</strong> They're written in Egyptian
      colloquial Arabic, about evenings that actually happen in an Egyptian home, and scored across
      five constructs. A parent in the hall finishes in about ten minutes and leaves with their own
      report — and the room's answers go up on the screen behind the panel.</p>
  </div>
</div>
<script>
(function(){
  var scale = document.querySelector('.item .scale');
  if (!scale) return;
  var after = document.getElementById('after');
  scale.addEventListener('click', function(e){
    var b = e.target.closest('button'); if (!b) return;
    scale.querySelectorAll('button').forEach(function(x){ x.setAttribute('aria-pressed','false'); });
    b.setAttribute('aria-pressed','true');
    after.classList.add('on');
  });
})();
</script>"""

PAGES = {}

# ───────────────────────────── HOME ─────────────────────────────
PAGES["index.html"] = dict(
    title="Welmnt",
    desc="Welmnt brings mental-health education inside Egyptian schools. TikTok's partner for Family Academy, Egypt second edition.",
    body=f"""
<div class="hero">
  <div class="wrap">
    <div>
      <div class="kicker">{FIVE}<span>Mental-health education for schools · Egypt</span></div>
      <h1>Schools shouldn't wait for a referral. They should <em>protect earlier</em>.</h1>
      <p class="lede">Welmnt brings mental-health education inside the building — age-appropriate,
        culture-appropriate, in Arabic, delivered to the students, parents and teachers who are
        already there.</p>
      <div class="cta-row">
        <a class="btn" href="contact.html">Bring Welmnt to your school</a>
        <a class="btn btn-ghost" href="projects.html">See our work</a>
      </div>
    </div>
    <div>{HERO_ITEM}</div>
  </div>
</div>

<div class="proof">
  <div class="wrap">
    <div class="railcol"><span class="eyebrow" style="margin-top:0">Most recent</span></div>
    <div class="items">
      <div><span class="lbl">Partner</span><span class="val"><em>TikTok Family Academy</em> — Egypt, second edition</span></div>
      <div><span class="lbl">Venue</span><span class="val">The International School of Choueifat, 6th October</span></div>
      <div><span class="lbl">When</span><span class="val">November 2025</span></div>
    </div>
  </div>
</div>

{sec("What we believe", '''
    <h2>Protection, not referral.</h2>
    <p class="lede">The usual model waits for a student to break, then routes them to a professional.
      That is late, expensive, and stigmatising. Welmnt works the other way round: teach the skills at
      the right age, give parents language they can use at home, and give the school something it can
      act on before anything is urgent.</p>
    <div class="cols c3">
      <div class="pillar"><div class="n">In the room</div>
        <p>We deliver inside the school, in person, in Arabic — not as a link emailed to parents who
          never open it.</p></div>
      <div class="pillar"><div class="n">Every school type</div>
        <p>Government, national and international. The government version assumes no phones and no
          internet, and gets the same facilitators and the same report.</p></div>
      <div class="pillar"><div class="n">Something to act on</div>
        <p>Every engagement closes with a written report: attendance, what the assessment surfaced
          across the cohort, and where to put attention next term.</p></div>
    </div>''')}

{sec("Selected work", '''
    <div class="split">
      <div>
        <h2>TikTok chose Welmnt for Family Academy</h2>
        <p class="lede">TikTok brought the second edition of its regional Family Academy to Egypt and
          named Welmnt as its mental-health and family-wellbeing partner. We built the model the press
          described: the platform brings the product layer, Welmnt brings the psychological and
          educational layer, and the school brings the trust.</p>
        <div class="cta-row"><a class="btn btn-ghost" href="projects.html#family-academy">Read the case study</a></div>
      </div>
      <div class="hero-art"><img src="assets/approach-parent.svg" alt=""></div>
    </div>''', cls="on-surface")}

{sec("Programmes", '''
    <h2>Two formats, delivered turnkey</h2>
    <p class="lede">We bring the facilitators, the materials, the assessment technology and the
      post-event report. The school brings the room and the invitation.</p>
    <div class="cols c2">
      <div class="card">
        <h3>Awareness Day</h3>
        <p class="meta">3 hours · parents · workshop, panel and networking</p>
        <p>A focused parent event built for high visibility and low logistical load. Runs in any school,
          including government schools with no device assumption. Usually the right first engagement
          with a new institution.</p>
        <p class="src"><a href="programmes.html#awareness-day">What's included →</a></p>
      </div>
      <div class="card lift">
        <h3>Whole-School Day</h3>
        <p class="meta">Full day · students, parents and teachers · three parallel tracks</p>
        <p>The full institutional programme. Three tracks run simultaneously from morning to close, so
          the school moves as one body instead of sending a handful of parents to an evening talk.</p>
        <p class="src"><a href="programmes.html#whole-school">What's included →</a></p>
      </div>
    </div>''')}

{sec("The platform", f'''
    <h2>The heroes of Welmnt</h2>
    <p class="lede">A day in a hall changes a conversation. Keeping it changed takes a system. Welmnt's
      platform is built around the four people who hold a student's wellbeing between them — each with
      the view their role actually needs, and nothing it doesn't.</p>
    {ROLES}
    <p class="note"><strong>Where this stands today.</strong> The parent assessment and the live room
      screen are built and have run inside schools. The full four-role platform is the direction we are
      building toward — we would rather say that plainly than sell you a login that isn't ready.
      <a href="platform.html">More on the platform →</a></p>''', cls="band tall")}
""")

# ───────────────────────────── ABOUT ─────────────────────────────
PAGES["about.html"] = dict(
    title="About · Welmnt",
    desc="Founded in 2024 in Cairo, Welmnt integrates mental-health education into the Egyptian school system.",
    body=phead("About Welmnt", "Mental wellness belongs in the ordinary school week.",
               "Welmnt was founded in 2024 in Cairo, on the conviction that understanding and nurturing "
               "mental wellbeing is as much a part of a school's job as academic achievement — and that "
               "it belongs in the timetable, not in a referral after something has already broken.") + f"""
{sec("Our story", '''
    <div class="split">
      <div>
        <h2>Founded in 2024, in Egyptian schools</h2>
        <p class="lede">We began with a visionary goal: to illuminate the importance of mental health
          and wellness in the Egyptian school system. Recognising the transformative power of
          education in shaping young minds, we set out to integrate mental-health awareness into the
          very fabric of learning.</p>
        <p class="lede" style="margin-top:16px">We came up through an incubator, raised grant funding,
          signed our first schools, and learned the difference between a product a school admires and
          a programme a school books. What survived that learning is what we do now: show up in the
          building, in Arabic, with the parents in the room — and leave the school with something it
          can act on.</p>
      </div>
      <div class="hero-art"><img src="assets/approach-student.svg" alt=""></div>
    </div>''')}

{sec("Vision &amp; mission", '''
    <div class="cols c2" style="margin-top:0">
      <div>
        <h3 style="font-size:23px;margin-bottom:11px">A school system where wellbeing is lived, not discussed</h3>
        <p class="lede">Welmnt envisions a future where mental health and emotional wellbeing are
          integral parts of the educational journey for every child — where mental wellness is not a
          concept but a lived reality inside the school ecosystem, valued as much as academic results.</p>
      </div>
      <div>
        <h3 style="font-size:23px;margin-bottom:11px">Put the skills in the building, early</h3>
        <p class="lede">To change how schools approach student mental health — building a supportive
          ecosystem where every student has access to personalised mental-wellness support, and where
          parents and teachers are equipped rather than bypassed.</p>
      </div>
    </div>''', cls="on-surface")}

{sec("Our values", '''
    <h2>Five things we hold to</h2>
    <div class="values">
      <div class="value" style="--vc:var(--k1)"><div class="t">Innovation</div><p>Technology used where it earns its place — and left out where it doesn't.</p></div>
      <div class="value" style="--vc:var(--k2)"><div class="t">Collaboration</div><p>Students, teachers, parents and administrators in one conversation.</p></div>
      <div class="value" style="--vc:var(--k3)"><div class="t">Awareness</div><p>Shifting mental health from something whispered to something planned for.</p></div>
      <div class="value" style="--vc:var(--k4)"><div class="t">Inclusivity</div><p>The same programme in a government school as in an international one.</p></div>
      <div class="value" style="--vc:var(--k5)"><div class="t">Curiosity</div><p>Keeping close to the research, and changing our minds when it does.</p></div>
    </div>''')}

{sec("Our promise", '''
    <h2>Every student equipped to thrive — emotionally and academically</h2>
    <p class="lede">We are committed to a future where mental-health awareness is an integral part of
      education. That means no diagnosis, no labelling, no surveillance — and no claim we can't stand
      behind in front of a hall full of parents.</p>''', cls="band")}

{sec("Who delivers", '''
    <h2>Two people in front of the room</h2>
    <div class="people">
      <div class="person">
        <img src="assets/walaa.jpg" alt="Dr. Walaa Elgammal">
        <div><div class="nm">Dr. Walaa Elgammal</div>
          <div class="rl">Lead facilitator · PhD, Mental Health &amp; Psychotherapy</div>
          <p>Runs the parent workshop and the teacher session. Built and delivers Egypt's best-known
            Arabic-language CBT programme for emotional eating, and writes for the same audience she
            stands in front of.</p></div>
      </div>
      <div class="person">
        <img src="assets/hazem.jpg" alt="Hazem Abdelghany">
        <div><div class="nm">Hazem Abdelghany</div>
          <div class="rl">Founder · programme direction</div>
          <p>Founded Welmnt on the conviction that schools should protect early rather than refer late.
            Moderates the panels, builds the assessment technology, and owns delivery end to end.</p></div>
      </div>
    </div>''')}
""")

# ───────────────────────────── PROGRAMMES ─────────────────────────────
PAGES["programmes.html"] = dict(
    title="Programmes · Welmnt",
    desc="Awareness Day and Whole-School Day — turnkey mental-health programmes delivered inside Egyptian schools.",
    body=phead("Programmes", "Two programmes, delivered inside the school.",
               "Both are turnkey. We bring the facilitators, the materials, the assessment technology, "
               "the catering and the post-event report. The school brings the room and the invitation.") + f"""
{sec("Format one", '''
    <h2>Awareness Day</h2>
    <p class="lede">A focused three-hour parent event, built for high visibility and low logistical
      load. It runs in any school — including government schools, with no phone or internet dependency
      — and is usually the right first engagement with a new institution.</p>
    <div class="facts">
      <div class="fact"><div class="k">Duration</div><div class="v">3 hours<br>11:00 – 14:00</div></div>
      <div class="fact"><div class="k">Audience</div><div class="v">Parents<br>~300 per school</div></div>
      <div class="fact"><div class="k">Format</div><div class="v">Workshop, panel<br>and networking</div></div>
      <div class="fact"><div class="k">Team</div><div class="v">Dr. Walaa<br>+ 1 facilitator</div></div>
    </div>
    <div class="cols c3">
      <div class="pillar"><div class="n">Parent workshop</div>
        <p><span class="ar">متصلون لا مُراقَبون</span> — <em>Connected, Not Controlled</em>. Fifty
          minutes with Dr. Walaa on what actually reaches an adolescent, and what doesn't.</p></div>
      <div class="pillar"><div class="n">Panel discussion</div>
        <p>The school's counsellor, Welmnt, and where relevant the sponsoring platform — moderated,
          with the room's own assessment data on the screen behind it.</p></div>
      <div class="pillar"><div class="n">What parents leave with</div>
        <p>A personal report on their own parenting style, the family digital-wellness kit, and
          catering that makes it an event rather than a lecture.</p></div>
    </div>''', sid="awareness-day")}

{sec("Format two", '''
    <h2>Whole-School Day</h2>
    <p class="lede">The full institutional programme. Three tracks run simultaneously from morning to
      close, so the school moves as one body rather than sending a handful of parents to an evening
      talk.</p>
    <div class="facts">
      <div class="fact"><div class="k">Duration</div><div class="v">Full school day<br>08:30 – 16:00</div></div>
      <div class="fact"><div class="k">Audience</div><div class="v">Students, parents<br>and teachers</div></div>
      <div class="fact"><div class="k">Format</div><div class="v">Three parallel<br>tracks, all day</div></div>
      <div class="fact"><div class="k">Team</div><div class="v">Dr. Walaa<br>+ 2 facilitators</div></div>
    </div>
    <div class="cols c3">
      <div class="pillar"><div class="n">Student track</div>
        <p>Two age-banded sessions, run without phones — pressure, comparison, and what to do when it
          turns on you. Language adapted by age group.</p></div>
      <div class="pillar"><div class="n">Parent track</div>
        <p>Everything in the Awareness Day: the workshop, the panel, the assessment and the printed
          family digital-wellness kit.</p></div>
      <div class="pillar"><div class="n">Teacher track</div>
        <p>A 45-minute counsellor-led session with a printed toolkit — what to escalate, what to hold,
          and how to spot the quiet ones.</p></div>
    </div>
    <div class="cols c3">
      <div class="pillar"><div class="n">Wellness-day certificate</div>
        <p>An institutional certificate the school can publish and file — it reads well against
          international accreditation requirements.</p></div>
      <div class="pillar"><div class="n">Video recap</div>
        <p>A short edit per event, usable on the school's channels and the sponsor's.</p></div>
      <div class="pillar"><div class="n">Combined report</div>
        <p>Student, parent and teacher insight in one document, with the cohort patterns that matter
          for next term.</p></div>
    </div>''', cls="on-surface", sid="whole-school")}

{sec("Reach", '''
    <h2>Built for every school in the system</h2>
    <p class="lede">Both formats run in all three school types. What changes is the delivery mechanics,
      never the content or the calibre of the team.</p>
    <div class="cols c3">
      <div class="card"><h3>Government <span class="ar" style="font-size:14px;color:var(--ink-faint)">حكومة</span></h3>
        <p>No phone or internet dependency. Worksheet-based throughout, paper assessment instead of the
          QR version, same facilitators, same written report.</p></div>
      <div class="card"><h3>National</h3>
        <p>Full QR assessment. Bilingual delivery — Arabic, with English terminology where the school
          uses it. Historically the strongest parent turnout.</p></div>
      <div class="card"><h3>International</h3>
        <p>Full assessment plus the live dashboard, and the wellness-day certificate, which reads
          strongly in an accreditation culture.</p></div>
    </div>''')}

{sec("How an engagement runs", '''
    <h2>From signature to final report in eight weeks</h2>
    <div class="timeline">
      <div class="tl"><div class="w">Week 1</div><div><h4>Contracting &amp; kickoff</h4>
        <p>Contract signed, school list and format per school confirmed, facilitator team assigned.</p></div></div>
      <div class="tl"><div class="w">Weeks 1–2</div><div><h4>School outreach</h4>
        <p>We contact and confirm each school, schedule the dates, and work the logistics per school type.</p></div></div>
      <div class="tl"><div class="w">Weeks 1–3</div><div><h4>Assessment build</h4>
        <p>QR assessment configured, Arabic reporting checked, live dashboard tested end to end.</p></div></div>
      <div class="tl"><div class="w">Week 3</div><div><h4>Materials</h4>
        <p>Worksheets and paper assessments printed, roll-ups and backdrop per school, teacher toolkits.</p></div></div>
      <div class="tl"><div class="w">Weeks 4–7</div><div><h4>Delivery</h4>
        <p>Events run at one to two per week, with a debrief after each so the next one is better.</p></div></div>
      <div class="tl"><div class="w">Week 8</div><div><h4>Reporting &amp; wrap</h4>
        <p>Per-school report, aggregate assessment data, and a campaign summary for any sponsor.</p></div></div>
    </div>
    <p class="src">Pricing is quoted per school and depends on format and school type. Terms are
      typically 50% on signing and 50% on final delivery, with a written proposal within 48 hours of
      agreeing the shape. <a href="contact.html">Ask for a quote →</a></p>''', cls="band")}
""")

# ───────────────────────────── PROJECTS ─────────────────────────────
PAGES["projects.html"] = dict(
    title="Projects · Welmnt",
    desc="Welmnt's work: TikTok Family Academy Egypt second edition, the Arabic parenting assessment, and the school programme.",
    body=phead("Projects", "What we've actually run.",
               "Programmes delivered, tools built, and a partnership that put Welmnt's name next to a "
               "global platform's. Each one is here because it happened — not because it was planned.") + f"""
{sec("Index", '''
    <div class="projects">
      <article class="project">
        <div class="thumb"><img src="assets/approach-parent.svg" alt=""></div>
        <div class="body">
          <div class="tag"><span class="live">Partnership</span><span>·</span><span>November 2025</span><span>·</span><span>Delivered</span></div>
          <h3>TikTok Family Academy — Egypt, Second Edition</h3>
          <p>TikTok's regional digital-safety and family-wellbeing programme came to Egypt with Welmnt
            as its named mental-health partner, hosted at The International School of Choueifat in 6th
            of October. Parents, teachers and press in the room; cyberbullying and adolescent mental
            health on the agenda.</p>
          <a class="more" href="#family-academy">Read the case study ↓</a>
        </div>
      </article>
      <article class="project">
        <div class="thumb"><img src="assets/chatbot.svg" alt=""></div>
        <div class="body">
          <div class="tag"><span class="live">Product</span><span>·</span><span>Built 2025</span><span>·</span><span>In use</span></div>
          <h3>The Arabic parenting assessment</h3>
          <p>A parenting-style instrument written in Egyptian colloquial Arabic, scored across five
            constructs, with an instant personalised report and a live room screen that aggregates the
            hall's answers behind the panel. A paper version exists for schools with no device
            assumption.</p>
          <a class="more" href="#assessment">How it works ↓</a>
        </div>
      </article>
      <article class="project">
        <div class="thumb"><img src="assets/Classroom.svg" alt=""></div>
        <div class="body">
          <div class="tag"><span class="live">Programme</span><span>·</span><span>Since 2024</span><span>·</span><span>Ongoing</span></div>
          <h3>The in-school programme</h3>
          <p>The original Welmnt motion: instructor-led, age-appropriate and culture-appropriate
            mental-health sessions delivered inside Egyptian schools, with reporting back to the
            institution. Now packaged as the Awareness Day and Whole-School Day formats.</p>
          <a class="more" href="programmes.html">See the programmes →</a>
        </div>
      </article>
      <article class="project">
        <div class="thumb"><img src="assets/Dashboard.svg" alt=""></div>
        <div class="body">
          <div class="tag"><span>Platform</span><span>·</span><span>In development</span></div>
          <h3>The four-role platform</h3>
          <p>Buddy, Parent, Teacher and Administrator — one system, four views, so a day in a hall
            becomes a habit in a term. The assessment and room screen are live; the full platform is
            the direction we're building toward, and we say so plainly.</p>
          <a class="more" href="platform.html">See the platform →</a>
        </div>
      </article>
    </div>''')}

{sec("Case study", '''
    <h2>TikTok Family Academy — Egypt, Second Edition</h2>
    <p class="lede">TikTok runs Family Academy across its region — a live, school-hosted event that puts
      digital-safety tools in parents' hands rather than in a help-centre article. For the second
      Egyptian edition, TikTok named Welmnt as its mental-health and family-wellbeing partner.</p>
    <div class="facts">
      <div class="fact"><div class="k">Client</div><div class="v">TikTok MENA</div></div>
      <div class="fact"><div class="k">Venue</div><div class="v">The International School<br>of Choueifat, 6th October</div></div>
      <div class="fact"><div class="k">Date</div><div class="v">November 2025</div></div>
      <div class="fact"><div class="k">Audience</div><div class="v">Parents, teachers<br>and press</div></div>
    </div>
    <div class="cols c3">
      <div class="pillar"><div class="n">The brief</div>
        <p>Raise digital-safety awareness among families and teens, and address cyberbullying directly
          — with something parents could use the same evening, not a policy announcement.</p></div>
      <div class="pillar"><div class="n">What we ran</div>
        <p>An interactive parent workshop led by Dr. Walaa Elgammal, a moderated expert panel, and the
          live Arabic parenting assessment with instant personal reports.</p></div>
      <div class="pillar"><div class="n">The model</div>
        <p>Three parties, one room: TikTok brought the product layer, Welmnt the psychological and
          educational layer, and the school the trust that gets parents through the door.</p></div>
    </div>
    <div class="tbl-scroll">
      <table class="roster">
        <thead><tr><th>On the programme</th><th>Role</th></tr></thead>
        <tbody>
          <tr><td>Raghdah Alazab</td><td>Head of Communications, TikTok MENA</td></tr>
          <tr><td>Dr. Walaa Elgammal</td><td>PhD, Mental Health &amp; Psychotherapy — led the parent workshop</td></tr>
          <tr><td>Leila El Meligy</td><td>Psychologist, The International School of Choueifat</td></tr>
          <tr><td>Hazem Abdelghany</td><td>Founder, Welmnt — moderated the panel</td></tr>
        </tbody>
      </table>
    </div>
    <blockquote><p class="q">“Cyberbullying has real, deep effects on teenagers' mental health.”</p>
      <cite>Hazem Abdelghany · Founder, Welmnt · on the Family Academy panel</cite></blockquote>
    <p class="src">Coverage:
      <a href="https://identity-mag.com/in-collaboration-with-welmnt-and-the-international-school-of-choueifat-tiktok-launches-second-edition-of-family-academy-in-egypt-to-enhance-digital-safety-and-combat-cyberbullying/" target="_blank" rel="noopener">Identity Magazine</a> ·
      <a href="https://egyptian-gazette.com/entertainment/tiktok-launches-2nd-edition-of-family-academy-in-egypt/" target="_blank" rel="noopener">The Egyptian Gazette</a></p>''',
    cls="on-surface", sid="family-academy")}

{sec("Product", f'''
    <h2>A parenting assessment that speaks Egyptian</h2>
    <p class="lede">Not a translated Western questionnaire. The items are written in Egyptian
      colloquial Arabic, about situations that happen in an Egyptian home, and scored across five
      constructs. A parent finishes in about ten minutes and gets a personal report before leaving
      the hall.</p>
    {CONSTRUCTS}
    <div class="cols c3" style="margin-top:34px">
      <div class="pillar"><div class="n">Instant report</div>
        <p>Strengths, flags, one habit to start this week, and a sentence the parent can actually say
          to their child tonight — generated per respondent, in Arabic.</p></div>
      <div class="pillar"><div class="n">The room screen</div>
        <p>A live aggregate of the hall's answers, projected behind the panel. It turns an abstract
          lecture into a conversation about the people sitting in it.</p></div>
      <div class="pillar"><div class="n">Paper parity</div>
        <p>Identical items, identical output, on paper — so a school with no device assumption gets
          the same programme, not a reduced one.</p></div>
    </div>''', sid="assessment")}
""")

# ───────────────────────────── PLATFORM ─────────────────────────────
PAGES["platform.html"] = dict(
    title="Platform · Welmnt",
    desc="The Welmnt platform: four roles — Buddy, Parent, Teacher and Administrator — around one student's wellbeing.",
    body=phead("The platform", "Four people hold a student's wellbeing. Four different views.",
               "A day in a hall changes a conversation. Keeping it changed takes a system — one where "
               "the student owns their space, the parent is supported rather than deputised, and the "
               "school can see patterns without reading anyone's diary.") + f"""
{sec("The heroes of Welmnt", f'''
    <h2>One system, four views</h2>
    {ROLES}
    <p class="note"><strong>Where this stands today.</strong> The parent assessment and the live room
      screen are built and have run inside schools. The full four-role platform is the direction we
      are building toward. We would rather say that plainly than sell you a login that isn't ready —
      if you need a system in production this term, talk to us about the programmes instead.</p>''',
    cls="tall")}

{sec("Design principle", '''
    <div class="split">
      <div>
        <h2>Support, not surveillance</h2>
        <p class="lede">The fastest way to lose a teenager is to make the thing that was supposed to
          help them into the thing that reports on them. So the lines are drawn before the features
          are: a student's private reflections stay private, parents get high-level progress rather
          than transcripts, and schools get cohort patterns rather than individual confessions.</p>
        <p class="lede" style="margin-top:16px">No diagnosis. No labelling. No score anyone else gets
          to hold over them.</p>
      </div>
      <div class="hero-art"><img src="assets/approach-teacher.svg" alt=""></div>
    </div>''', cls="on-surface")}

{sec("Beyond the dashboards", '''
    <h2>Services that wrap the platform</h2>
    <div class="cols c3">
      <div class="card"><h3>Mental-health assessments</h3>
        <p>Structured evaluations at key milestones, with progress tracked over time rather than
          sampled once and filed.</p></div>
      <div class="card"><h3>Curriculum integration</h3>
        <p>Mental-health lessons sequenced into the school's actual timetable, not bolted on as an
          assembly nobody scheduled.</p></div>
      <div class="card"><h3>Crisis protocols</h3>
        <p>Clear escalation paths to the school's own counsellor when something surfaces that needs a
          professional. We route it; we don't treat it.</p></div>
    </div>''')}
""")

# ───────────────────────────── PARENTS ─────────────────────────────
PAGES["parents.html"] = dict(
    title="For Parents · Welmnt",
    desc="Support your child's mental wellbeing — safely and privately. Welmnt for families.",
    body=phead("For parents", "Support your child's mental wellbeing — safely and privately.",
               "Welmnt helps children and teens build emotional awareness, resilience and healthy "
               "habits — with full respect for their privacy and your role as a parent. This is about "
               "emotional wellbeing, not monitoring or evaluation.") + f"""
{sec("Built for families", '''
    <h2>Designed with care, and with limits</h2>
    <div class="cols c4">
      <div class="pillar"><div class="n">Professionally led</div><p>Created and delivered with mental-health professionals, not assembled from internet advice.</p></div>
      <div class="pillar"><div class="n">No labels</div><p>No diagnosis, no labelling, no judgment — of your child or of you.</p></div>
      <div class="pillar"><div class="n">Private by default</div><p>Your child's personal reflections are theirs. You get progress, not transcripts.</p></div>
      <div class="pillar"><div class="n">Never sold on</div><p>Individual data is never passed to a school sponsor, an employer, or any third party.</p></div>
    </div>''')}

{sec("What your child experiences", '''
    <div class="split rev">
      <div class="hero-art"><img src="assets/approach-admin.svg" alt=""></div>
      <div>
        <h2>Small things, most days</h2>
        <div class="cols c2" style="margin-top:24px;gap:22px">
          <div class="pillar"><div class="n">Daily check-ins</div><p>Helps children recognise and name what they're feeling, in a way that doesn't feel like a test.</p></div>
          <div class="pillar"><div class="n">Guided reflection</div><p>Short, age-appropriate prompts that make self-expression a habit rather than an event.</p></div>
          <div class="pillar"><div class="n">Wellbeing exercises</div><p>Simple activities for stress, focus, confidence and emotional regulation.</p></div>
          <div class="pillar"><div class="n">Age-appropriate AI support</div><p>Gentle guidance designed to encourage reflection — never to replace a human being.</p></div>
        </div>
      </div>
    </div>''', cls="on-surface")}

{sec("Your role", '''
    <h2>Support without surveillance</h2>
    <p class="lede">Welmnt is designed to support your child and respect your role as a parent — which
      means being useful to you without turning you into a monitor.</p>
    <div class="cols c3">
      <div class="card"><h3>High-level insights</h3><p>Optional progress summaries — whether they're engaging, and how that's trending. Not what they wrote.</p></div>
      <div class="card"><h3>Practical tips</h3><p>Things you can do at home this week, written for a parent's actual evening rather than a clinic.</p></div>
      <div class="card"><h3>Their choice to share</h3><p>Private journal entries stay private unless your child decides to show you. That decision is theirs.</p></div>
    </div>''')}

{sec("Age groups", '''
    <h2>Content that grows with them</h2>
    <div class="cols c2">
      <div class="card"><h3>Ages 7–11</h3><p>Emotional awareness, expression and confidence. Playful in tone, concrete in what it teaches — naming a feeling before it becomes a meltdown.</p></div>
      <div class="card"><h3>Ages 12–18</h3><p>Stress, self-regulation, identity and resilience. Written to respect their intelligence, because a teenager can tell when it doesn't.</p></div>
    </div>
    <p class="src">Access is usually arranged through your child's school. If you'd like Welmnt at your
      school, or want to know when family access opens directly, <a href="contact.html">get in touch</a>
      — we'll tell you honestly where things stand.</p>''', cls="band")}
""")

# ───────────────────────────── FAQ ─────────────────────────────
PAGES["faq.html"] = dict(
    title="FAQ · Welmnt",
    desc="Common questions from schools, parents and partners about Welmnt's programmes and data handling.",
    body=phead("FAQ", "Ask and we shall answer.",
               "The questions schools, parents and partners actually ask — answered without the "
               "marketing layer. If yours isn't here, send it to us and we'll answer it straight.") + f"""
{sec("For schools", '''
    <h2>Programmes and delivery</h2>
    <div style="margin-top:22px">
      <details open><summary>Who actually delivers the sessions?</summary>
        <div class="a">Dr. Walaa Elgammal — a PhD in mental health and psychotherapy — leads the parent
          and teacher sessions, with Welmnt facilitators on the student tracks. You are told before you
          book exactly who will be standing in your hall.</div></details>
      <details><summary>Is this therapy?</summary>
        <div class="a">No. Welmnt is education and protection, not clinical treatment. We do not
          diagnose, label or treat. Where a session surfaces something that needs a professional, we
          say so to the school's counsellor through the proper channel — we don't handle it ourselves.</div></details>
      <details><summary>Will this work in a government school?</summary>
        <div class="a">Yes, and it has been designed to. The government version assumes no phones and
          no internet: identical items and identical output on paper, the same facilitators, and the
          same written report to the school.</div></details>
      <details><summary>How much notice do you need?</summary>
        <div class="a">A full engagement runs eight weeks from signature to final report, with the
          events themselves in weeks four to seven. A single Awareness Day at one school can move
          faster. The constraint is usually the school's calendar, not ours.</div></details>
      <details><summary>What does it cost?</summary>
        <div class="a">Pricing is per school and depends on the format and the school type. Terms are
          typically 50% on signing and 50% on final delivery, with a written proposal within 48 hours
          of agreeing the shape. Ask us and you'll get a number, not a discovery call.</div></details>
    </div>''')}

{sec("For parents &amp; partners", '''
    <h2>Privacy, data and sponsorship</h2>
    <div style="margin-top:22px">
      <details><summary>What happens to student and parent data?</summary>
        <div class="a">Assessment responses generate the respondent's own report and a cohort-level
          summary for the school. Schools receive patterns, not private reflections. We do not sell
          data, and we do not pass individual responses to any third party — including a sponsoring
          brand.</div></details>
      <details><summary>Can a brand or platform sponsor a programme?</summary>
        <div class="a">Yes — that is how the TikTok Family Academy editions ran. The sponsor brings the
          product layer and the reach, Welmnt brings the psychological and educational layer, and the
          school brings the trust. The content stays ours, and the data stays out of the sponsor's
          hands.</div></details>
      <details><summary>Do parents have to use a phone?</summary>
        <div class="a">No. The QR assessment is the default in national and international schools
          because it's faster and gives an instant report, but the paper version asks the same
          questions and produces the same output. Nobody is excluded for not having a device.</div></details>
      <details><summary>What languages do you deliver in?</summary>
        <div class="a">Arabic, and specifically Egyptian colloquial Arabic for anything a parent or
          student reads. We use English terminology where a school's own working language calls for
          it, and panel discussions can run bilingual.</div></details>
    </div>''', cls="on-surface")}
""")

# ───────────────────────────── CONTACT ─────────────────────────────
PAGES["contact.html"] = dict(
    title="Contact · Welmnt",
    desc="Talk to Welmnt about bringing a programme to your school, or partnering on a family-wellbeing campaign in Egypt.",
    body=phead("Contact", "Tell us the room and the term.",
               "We work with schools directly, and with brands and platforms running family and "
               "digital-wellbeing programmes across Egypt. Send us the school, the audience and "
               "roughly when — we'll come back with a format and a date.") + f"""
{sec("Get in touch", '''
    <div class="contact-box">
      <div class="e"><a href="mailto:info@welmnt.me">info@welmnt.me</a></div>
      <a class="btn" href="https://www.linkedin.com/company/welmnt" target="_blank" rel="noopener">Welmnt on LinkedIn</a>
    </div>
    <div class="cols c3">
      <div class="pillar"><div class="n">Schools</div>
        <p>Tell us the school type, roughly how many parents you can get in a room, and the term you're
          aiming at. We'll tell you which format fits and what it costs.</p></div>
      <div class="pillar"><div class="n">Brands &amp; platforms</div>
        <p>If you're running a family-safety or digital-wellbeing campaign in Egypt and need the
          credible in-room layer, this is the thing we've already done with TikTok.</p></div>
      <div class="pillar"><div class="n">Parents</div>
        <p>If you want Welmnt at your child's school, say so and name the school. That message
          genuinely opens doors — schools listen to their own parents.</p></div>
    </div>''')}

{sec("Details", '''
    <div class="cols c2" style="margin-top:0">
      <div><h3 style="margin-bottom:9px">The organisation</h3>
        <p class="lede">Welmnt for Educational and Technical Services LLC<br>Cairo, Egypt · Founded 2024</p></div>
      <div><h3 style="margin-bottom:9px">Response</h3>
        <p class="lede">We answer within one working day. If you're on a deadline, say so in the first
          line and we'll work to it.</p></div>
    </div>''', cls="on-surface")}
""")

# ───────────────────────────── PRIVACY ─────────────────────────────
PAGES["privacy.html"] = dict(
    title="Privacy · Welmnt",
    desc="How Welmnt collects, uses and protects assessment and programme data.",
    closer=False,
    body=phead("Privacy policy", "Privacy",
               "What we collect when we run a programme, what we do with it, and what we will never "
               "do. Written to be read rather than to be survived.") + f"""
{sec("What we collect", '''
    <p class="lede">When a parent completes the Welmnt assessment we record their answers and the
      resulting scores. Attendance is recorded at the level of counts, not names, unless a school
      asks us to register attendees on its behalf.</p>''')}
{sec("What we do with it", '''
    <p class="lede">Two things. First, we generate that respondent's own report, which is shown to
      them and to nobody else. Second, we aggregate responses into a cohort-level summary for the
      school — patterns across the group, never individual answers attributed to a person.</p>''', cls="on-surface")}
{sec("What we never do", '''
    <p class="lede">We do not sell data. We do not pass individual responses to a third party,
      including a brand or platform sponsoring the programme. We do not use assessment responses for
      advertising, and we do not share a child's private reflections with their parents, their
      teachers or their school.</p>''')}
{sec("Children", '''
    <p class="lede">Student-facing sessions are delivered in person and, in the Whole-School Day
      format, run without phones. Where a student-facing tool is used, private entries remain private
      to the student unless they choose to share them.</p>''', cls="on-surface")}
{sec("Your rights", '''
    <p class="lede">You can ask us what we hold about you, ask for a copy, or ask us to delete it.
      Write to <a href="mailto:info@welmnt.me">info@welmnt.me</a> and we will action it and confirm in
      writing.</p>
    <p class="src" style="margin-top:26px">Welmnt for Educational and Technical Services LLC, Cairo,
      Egypt. Last updated September 2026.</p>''')}
""")


for page, spec in PAGES.items():
    html = head(spec["title"], spec["desc"], page) + spec["body"] + foot(spec.get("closer", True))
    (OUT / page).write_text(html, encoding="utf-8")
    print(f"wrote {page:18} {len(html):>7,} bytes")
