import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  Check,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileCheck2,
  GraduationCap,
  IndianRupee,
  LineChart,
  LockKeyhole,
  Medal,
  Menu,
  ShieldCheck,
  Users,
} from "lucide-react";

const modules = [
  { code: "TCH", title: "Teacher Onboarding", description: "Add faculty, assign subjects and classes, and manage access from one place.", icon: Users },
  { code: "STU", title: "Student Records", description: "Keep student profiles connected across admissions, classes, fees, and attendance.", icon: GraduationCap },
  { code: "ADM", title: "Admissions", description: "Move enquiries through application, review, and enrollment with a clear record.", icon: FileCheck2 },
  { code: "FEE", title: "Fee Management", description: "Create fee plans, record payments, issue receipts, and follow up on dues.", icon: CreditCard },
  { code: "CLS", title: "Classes & Subjects", description: "Organise sections, subjects, timetables, and teacher allocations.", icon: BookOpen },
  { code: "ATT", title: "Attendance", description: "Record daily student and staff attendance and review date-wise reports.", icon: CalendarCheck },
  { code: "ACC", title: "Accounts", description: "Track institute income, expenses, and ledgers in an organised workspace.", icon: LineChart },
  { code: "SAL", title: "Salary & Payroll", description: "Process staff salaries using role and attendance information already in the system.", icon: Medal },
];

const benefits = [
  { title: "One reliable record", description: "Student, fee, attendance, and staff information stays connected, reducing duplicate entries and avoidable errors.", icon: CheckCircle2 },
  { title: "Access based on responsibility", description: "Admins, teachers, accountants, and front-desk teams only see the tools and records relevant to their work.", icon: LockKeyhole },
  { title: "Updates your team can act on", description: "Fee dues and attendance are visible as soon as they are recorded, without waiting for manual reports.", icon: Clock3 },
  { title: "Clear history and accountability", description: "Important actions remain organised and traceable, helping your institute stay ready for reviews and audits.", icon: ShieldCheck },
];

const roles = [
  { role: "School Admin", description: "Institute setup, people, academics, and reports", color: "bg-sky-600" },
  { role: "Teacher", description: "Classes, attendance, and student records", color: "bg-teal-600" },
  { role: "Accountant", description: "Fees, expenses, accounts, and payroll", color: "bg-amber-500" },
  { role: "Front Desk", description: "Enquiries, admissions, and onboarding", color: "bg-violet-500" },
];

function Brand() {
  return (
    <span className="flex items-center gap-3">
      <span className="grid size-9 shrink-0 grid-cols-2 gap-1 rounded-xl bg-[#12345b] p-2 shadow-sm sm:size-10" aria-hidden="true">
        <i className="rounded-[2px] bg-white" />
        <i className="rounded-[2px] bg-sky-400" />
        <i className="rounded-[2px] bg-teal-500" />
        <i className="rounded-[2px] bg-white" />
      </span>
      <span className="leading-tight text-slate-900">
        <strong className="block font-serif text-[15px] font-bold tracking-tight min-[390px]:text-[17px] sm:text-[19px]">Education Matrix 360</strong>
        <small className="hidden text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500 min-[390px]:block">School administration platform</small>
      </span>
    </span>
  );
}

function RegisterPreview() {
  return (
    <div className="relative">
      <div className="absolute -inset-4 -z-10 rounded-[32px] bg-sky-100/70 blur-2xl" />
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_70px_-32px_rgba(15,47,78,0.4)]">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-4 sm:items-center sm:px-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Weekly attendance register</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">Class 8 · Section A</p>
          </div>
          <span className="flex shrink-0 items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700 sm:px-3 sm:text-xs"><i className="size-2 rounded-full bg-emerald-500" />Synced</span>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-[36px_repeat(5,minmax(0,1fr))] gap-1.5 min-[390px]:grid-cols-[42px_repeat(5,minmax(0,1fr))] sm:grid-cols-[56px_repeat(5,minmax(0,1fr))] sm:gap-2">
            <div />
            {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day) => <div className="pb-1 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400" key={day}>{day}</div>)}
            {modules.map((module, row) => [
              <div className="flex items-center font-mono text-[10px] font-semibold text-slate-400" key={`${module.code}-label`}>{module.code}</div>,
              ...Array.from({ length: 5 }, (_, column) => {
                const active = (row + column) % 7 !== 4;
                return <div className={`flex aspect-square items-center justify-center rounded-md border ${active ? "border-teal-200 bg-teal-50 text-teal-600" : "border-slate-200 bg-slate-50 text-slate-300"}`} key={`${module.code}-${column}`}><Check className="size-3 stroke-[3]" /></div>;
              }),
            ])}
          </div>
          <div className="mt-5 flex flex-col gap-1 border-t border-slate-100 pt-4 text-xs text-slate-500 min-[390px]:flex-row min-[390px]:items-center min-[390px]:justify-between">
            <span>8 school workflows connected</span>
            <span className="font-semibold text-[#12345b]">View report →</span>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-6 -left-5 hidden items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg sm:flex">
        <span className="flex size-9 items-center justify-center rounded-lg bg-sky-50 text-sky-700"><IndianRupee className="size-4" /></span>
        <span><strong className="block text-sm text-slate-900">Fee records updated</strong><small className="text-slate-500">Receipts and dues in one view</small></span>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <div className="min-h-full bg-[#fbfcfd] font-sans text-slate-900 selection:bg-sky-100 selection:text-sky-950">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[70px] max-w-[1180px] items-center justify-between gap-3 px-4 sm:h-[76px] sm:px-8">
          <a href="#top" aria-label="Education Matrix 360 home"><Brand /></a>
          <nav className="hidden items-center gap-8 lg:flex" aria-label="Main navigation">
            <a className="text-sm font-medium text-slate-600 transition-colors hover:text-sky-800" href="#modules">Modules</a>
            <a className="text-sm font-medium text-slate-600 transition-colors hover:text-sky-800" href="#why">Why EM360</a>
            <a className="text-sm font-medium text-slate-600 transition-colors hover:text-sky-800" href="#contact">Contact</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link className="hidden px-3 py-2 text-sm font-semibold text-slate-700 hover:text-sky-800 sm:block" href="/auth/login">Log in</Link>
            <Link className="hidden rounded-lg bg-[#12345b] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0d2948] min-[520px]:block" href="/auth/login">Register Institute</Link>
            <details className="group relative lg:hidden">
              <summary className="flex size-10 cursor-pointer list-none items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition hover:bg-slate-50 [&::-webkit-details-marker]:hidden" aria-label="Open navigation"><Menu className="size-5" /></summary>
              <nav className="absolute right-0 top-12 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-xl" aria-label="Mobile navigation">
                <a className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-900" href="#modules">Modules</a>
                <a className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-900" href="#why">Why EM360</a>
                <a className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-900" href="#contact">Contact</a>
                <div className="my-2 border-t border-slate-100" />
                <Link className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-sky-900 hover:bg-sky-50" href="/auth/login">Log in</Link>
                <Link className="mt-1 block rounded-lg bg-[#12345b] px-3 py-2.5 text-center text-sm font-semibold text-white min-[520px]:hidden" href="/auth/login">Register Institute</Link>
              </nav>
            </details>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="relative overflow-hidden bg-white">
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-sky-300 to-transparent" />
          <div className="mx-auto grid max-w-[1180px] items-center gap-12 px-5 py-12 sm:px-8 sm:py-20 lg:grid-cols-[1.03fr_.97fr] lg:gap-14 lg:py-24">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.13em] text-sky-800"><ShieldCheck className="size-3.5" />Built for Indian educational institutes</span>
              <h1 className="mt-6 max-w-2xl font-serif text-[36px] font-bold leading-[1.08] tracking-[-0.025em] text-[#102a46] min-[390px]:text-[42px] sm:text-5xl lg:text-[58px]">Less time managing records. More time running your institute well.</h1>
              <p className="mt-6 max-w-xl text-[17px] leading-7 text-slate-600">Bring admissions, student records, fees, classes, attendance, accounts, and payroll into one dependable system your entire team can use.</p>
              <div className="mt-8 grid gap-3 min-[390px]:flex min-[390px]:flex-wrap">
                <Link className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#12345b] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0d2948]" href="/auth/login">Register your institute <ArrowRight className="size-4" /></Link>
                <Link className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-900" href="/auth/login">Go to login</Link>
              </div>
              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                <span className="flex items-center gap-2"><CheckCircle2 className="size-4 text-teal-600" />Role-based access</span>
                <span className="flex items-center gap-2"><CheckCircle2 className="size-4 text-teal-600" />Secure records</span>
                <span className="flex items-center gap-2"><CheckCircle2 className="size-4 text-teal-600" />Simple onboarding</span>
              </div>
            </div>
            <RegisterPreview />
          </div>
        </section>

        <section className="border-y border-slate-200 bg-slate-50" aria-label="Platform highlights">
          <div className="mx-auto grid max-w-[1180px] grid-cols-2 px-5 py-6 sm:px-8 sm:py-8 lg:grid-cols-4">
            {[["08", "Connected modules"], ["01", "Login for every role"], ["Digital", "Organised record keeping"], ["Anytime", "Access for authorised staff"]].map(([value, label], index) => <div className={`px-2 py-4 text-center sm:px-4 ${index % 2 === 0 ? "border-r border-slate-200" : ""} ${index < 2 ? "border-b border-slate-200 lg:border-b-0" : ""} lg:border-r lg:last:border-r-0`} key={label}><strong className="block font-mono text-xl font-bold text-[#12345b] sm:text-[28px]">{value}</strong><span className="mt-1 block text-[11px] leading-4 text-slate-500 sm:text-[13px]">{label}</span></div>)}
          </div>
        </section>

        <section className="bg-[#fbfcfd] py-16 sm:py-20" aria-labelledby="school-day-heading">
          <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
            <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr] lg:items-end">
              <div><span className="text-xs font-bold uppercase tracking-[0.16em] text-sky-800">A normal day, made simpler</span><h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-[#102a46] sm:text-[40px]" id="school-day-heading">From the morning bell to the final receipt.</h2><p className="mt-4 text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">EM360 follows the way your team already works. It simply keeps every hand-off clear and every record in its place.</p></div>
              <div className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white sm:grid-cols-3">
                {[{ time: "08:10 AM", title: "Teacher marks attendance", text: "The office can see the class status without calling for an update.", icon: CalendarCheck }, { time: "11:30 AM", title: "A new student enrolls", text: "Admission details become the student’s record—no second data entry.", icon: GraduationCap }, { time: "02:15 PM", title: "A parent pays fees", text: "The receipt is recorded and the outstanding balance updates immediately.", icon: IndianRupee }].map((item, index) => { const Icon = item.icon; return <article className={`p-5 sm:p-6 ${index < 2 ? "border-b border-slate-200 sm:border-b-0 sm:border-r" : ""}`} key={item.title}><div className="flex items-center justify-between"><span className="font-mono text-[10px] font-bold tracking-wider text-slate-400">{item.time}</span><Icon className="size-4 text-teal-700" /></div><h3 className="mt-4 text-sm font-bold text-slate-900">{item.title}</h3><p className="mt-2 text-xs leading-5 text-slate-500">{item.text}</p></article>; })}
              </div>
            </div>
          </div>
        </section>

        <section className="scroll-mt-20 bg-[#102d4d] py-16 sm:py-24" id="modules">
          <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
            <div className="max-w-2xl"><span className="text-xs font-bold uppercase tracking-[0.16em] text-sky-300">Everything in one place</span><h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-white sm:text-[42px]">The daily work of your institute, connected.</h2><p className="mt-4 text-base leading-7 text-slate-300">Each module shares the same records, so your team spends less time matching spreadsheets and more time supporting students.</p></div>
            <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:mt-12 sm:grid-cols-2 lg:grid-cols-4">
              {modules.map((module, index) => { const Icon = module.icon; return <article className="group bg-[#102d4d] p-6 transition-colors hover:bg-[#163959]" key={module.code}><div className="flex items-start justify-between"><span className="flex size-10 items-center justify-center rounded-lg bg-sky-400/10 text-sky-300"><Icon className="size-5" /></span><span className="font-mono text-[10px] font-semibold tracking-wider text-slate-500">{String(index + 1).padStart(2, "0")} / {module.code}</span></div><h3 className="mt-5 text-base font-bold text-white">{module.title}</h3><p className="mt-2 text-[13px] leading-5.5 text-slate-400">{module.description}</p></article>; })}
            </div>
          </div>
        </section>

        <section className="scroll-mt-20 bg-white py-16 sm:py-24" id="why">
          <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
            <div className="max-w-2xl"><span className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Why institutes choose EM360</span><h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-[#102a46] sm:text-[42px]">Made for real teams, not just reports.</h2><p className="mt-4 text-base leading-7 text-slate-600">Clear workflows help every staff member know what to do next while management keeps a reliable view of the institute.</p></div>
            <div className="mt-10 grid items-start gap-10 sm:mt-12 lg:grid-cols-[1fr_.9fr] lg:gap-20">
              <div>{benefits.map((benefit) => { const Icon = benefit.icon; return <article className="flex gap-4 border-t border-slate-200 py-5 last:border-b" key={benefit.title}><span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700"><Icon className="size-[18px]" /></span><div><h3 className="font-bold text-slate-900">{benefit.title}</h3><p className="mt-1.5 text-sm leading-6 text-slate-600">{benefit.description}</p></div></article>; })}</div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-7">
                <div className="mb-5 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Access overview</p><p className="mt-1 text-sm font-semibold text-slate-800">Everyone gets the right workspace</p></div><LockKeyhole className="size-5 text-sky-700" /></div>
                <div className="space-y-3">{roles.map((item) => <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4" key={item.role}><i className={`size-2.5 shrink-0 rounded-full ${item.color}`} /><div><strong className="block text-sm text-slate-900">{item.role}</strong><span className="mt-0.5 block text-xs leading-5 text-slate-500">{item.description}</span></div></div>)}</div>
                <p className="mt-5 flex items-center gap-2 text-xs text-slate-500"><ShieldCheck className="size-4 text-teal-600" />Permissions can be managed by your institute admin.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="scroll-mt-20 bg-white pb-16 sm:pb-24" id="contact">
          <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
            <div className="relative overflow-hidden rounded-2xl bg-[#12345b] px-6 py-10 sm:px-10 sm:py-12 lg:flex lg:items-center lg:justify-between lg:gap-12 lg:px-14">
              <div className="absolute -right-24 -top-24 size-64 rounded-full border-[45px] border-sky-400/10" />
              <div className="relative max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.15em] text-sky-300">Get started with EM360</p><h2 className="mt-3 font-serif text-3xl font-bold text-white sm:text-4xl">Bring your institute onto one dependable system.</h2><p className="mt-4 max-w-xl text-sm leading-6 text-slate-300">Set up your institute and give each team member a workspace designed for their responsibilities.</p></div>
              <div className="relative mt-7 grid shrink-0 gap-3 min-[390px]:flex min-[390px]:flex-wrap lg:mt-0"><Link className="rounded-lg bg-white px-5 py-3 text-center text-sm font-bold text-[#12345b] transition hover:bg-sky-50" href="/auth/login">Register Institute</Link><Link className="rounded-lg border border-white/30 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10" href="/auth/login">Go to Login</Link></div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-slate-50 py-12">
        <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <div><Brand /><p className="mt-4 max-w-xs text-sm leading-6 text-slate-500">A practical administration platform for schools, colleges, and training institutes.</p></div>
            <div><h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Portal</h3><div className="mt-4 space-y-3 text-sm text-slate-600"><Link className="block hover:text-sky-800" href="/auth/login">Log in</Link><Link className="block hover:text-sky-800" href="/auth/login">Register Institute</Link><a className="block hover:text-sky-800" href="#modules">Modules</a></div></div>
            <div><h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Platform</h3><div className="mt-4 space-y-3 text-sm text-slate-600"><a className="block hover:text-sky-800" href="#modules">Admissions & Fees</a><a className="block hover:text-sky-800" href="#modules">Attendance</a><a className="block hover:text-sky-800" href="#modules">Accounts & Payroll</a></div></div>
            <div><h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Contact</h3><div className="mt-4 space-y-3 text-sm text-slate-600"><a className="block hover:text-sky-800" href="https://edumatrix360.com">edumatrix360.com</a><a className="block hover:text-sky-800" href="mailto:support@edumatrix360.com">support@edumatrix360.com</a></div></div>
          </div>
          <div className="mt-10 flex flex-col gap-2 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row sm:justify-between"><span>© 2026 Education Matrix 360. All rights reserved.</span><span>Built for educational institutes</span></div>
        </div>
      </footer>
    </div>
  );
}
