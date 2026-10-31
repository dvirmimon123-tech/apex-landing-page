"use client"

import { useId, useRef, useState, type FormEvent } from "react"

/*
  The APEX Newsletter sign-up. Posts straight to the Mailchimp audience "Apex"
  (JSONP, no server needed, so it works on a static export). Mailchimp runs
  double opt-in: the person confirms from their inbox before they are added.
*/
const ENDPOINT = "https://apex.us12.list-manage.com/subscribe/post-json?u=27bb05458f18b3acc438ac243&id=cc6d95dc7d"
const HONEYPOT = "b_27bb05458f18b3acc438ac243_cc6d95dc7d"
const ROLES = ["Founder", "Researcher", "Engineer", "Investor", "APEX alum", "Other"]
export const NEWSLETTER_CONSENT =
  "I agree that APEX may use the details I provide to send me The APEX Newsletter and occasional related updates by email. I can withdraw my consent at any time using the unsubscribe link in any email."

type Status = { kind: "idle" | "sending" | "ok" | "error"; message?: string }

export function MailchimpNewsletterForm() {
  const uid = useId()
  const f = (n: string) => `${uid}-${n}`
  const [status, setStatus] = useState<Status>({ kind: "idle" })
  const done = useRef<HTMLHeadingElement>(null)

  function fail(message: string, el?: HTMLElement | null) {
    setStatus({ kind: "error", message })
    if (el) {
      el.setAttribute("aria-invalid", "true")
      el.focus()
    }
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const els = form.elements as unknown as Record<string, HTMLInputElement>
    const fname = els.FNAME.value.trim()
    const email = els.EMAIL.value.trim()
    if (!fname) return fail("Please enter your first name.", els.FNAME)
    if (!email || !els.EMAIL.checkValidity()) return fail("Please enter a valid email address.", els.EMAIL)
    if (!els.ROLE.value) return fail("Please tell us what best describes you.", els.ROLE)
    if (!els.consent.checked) return fail("Please tick the box to agree to receive the newsletter.", els.consent)

    setStatus({ kind: "sending" })
    const cb = `apexNl${Date.now()}`
    const params = new URLSearchParams()
    params.append("FNAME", fname)
    params.append("EMAIL", email)
    params.append("COMPANY", els.COMPANY.value.trim())
    params.append("ROLE", els.ROLE.value)
    params.append(HONEYPOT, els[HONEYPOT].value)
    params.append("c", cb)

    const script = document.createElement("script")
    const w = window as unknown as Record<string, unknown>
    const cleanup = () => {
      clearTimeout(timer)
      delete w[cb]
      script.remove()
    }
    const timer = setTimeout(() => {
      cleanup()
      fail("Something went wrong. Please try again in a moment.")
    }, 15000)
    w[cb] = (res: { result?: string; msg?: string }) => {
      cleanup()
      if (res?.result === "success") {
        setStatus({ kind: "ok" })
        setTimeout(() => done.current?.focus(), 0)
        return
      }
      let msg = String(res?.msg ?? "Something went wrong. Please try again.")
        .replace(/<[^>]*>/g, "")
        .replace(/^\d+\s*-\s*/, "")
      if (/already subscribed/i.test(msg)) msg = "This email is already on the list. Thanks for being here."
      fail(msg)
    }
    script.src = `${ENDPOINT}&${params.toString()}`
    script.onerror = () => {
      cleanup()
      fail("Something went wrong. Please try again in a moment.")
    }
    document.body.appendChild(script)
  }

  if (status.kind === "ok") {
    return (
      <div role="status">
        <p className="label">You&apos;re almost on the list</p>
        <h3 ref={done} tabIndex={-1} className="h-card mt-4 outline-none">
          Check your inbox.
        </h3>
        <p className="mt-4 max-w-[46ch] text-[17px] leading-relaxed text-body">
          We sent you a confirmation email. Click the button inside to confirm your address, and the next issue of The APEX
          Newsletter will land in your inbox.
        </p>
      </div>
    )
  }

  const pending = status.kind === "sending"
  const clear = (e: FormEvent<HTMLFormElement>) => {
    ;(e.target as HTMLElement).removeAttribute("aria-invalid")
    if (status.kind === "error") setStatus({ kind: "idle" })
  }

  return (
    <form onSubmit={onSubmit} onInput={clear} noValidate className="space-y-8">
      <fieldset disabled={pending} className="min-w-0 space-y-8 disabled:opacity-80">
        <legend className="sr-only">The APEX Newsletter sign-up</legend>
        <p className="text-[15px] text-body">
          Fields marked <span aria-hidden="true">*</span>
          <span className="sr-only">with an asterisk</span> are required.
        </p>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="field-label" htmlFor={f("fname")}>
              First name <span aria-hidden="true">*</span>
            </label>
            <input className="field" id={f("fname")} name="FNAME" autoComplete="given-name" required />
          </div>
          <div>
            <label className="field-label" htmlFor={f("email")}>
              Work email <span aria-hidden="true">*</span>
            </label>
            <input className="field" id={f("email")} name="EMAIL" type="email" autoComplete="email" required />
          </div>
          <div>
            <label className="field-label" htmlFor={f("company")}>
              Company
            </label>
            <input className="field" id={f("company")} name="COMPANY" autoComplete="organization" />
          </div>
          <div>
            <label className="field-label" htmlFor={f("role")}>
              What best describes you? <span aria-hidden="true">*</span>
            </label>
            <select className="field" id={f("role")} name="ROLE" required defaultValue="">
              <option value="" disabled>
                Select one
              </option>
              {ROLES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <input
            id={f("consent")}
            name="consent"
            type="checkbox"
            value="yes"
            required
            defaultChecked={false}
            className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-[rgb(var(--ink))]"
          />
          {/* PRIVACY: add a link to the privacy policy here once the page exists. */}
          <label htmlFor={f("consent")} className="min-w-0 cursor-pointer text-[15px] leading-normal text-body">
            {NEWSLETTER_CONSENT}
          </label>
        </div>
        {/* Spam trap: real people never fill this in. */}
        <div aria-hidden="true" className="absolute -left-[5000px]">
          <input type="text" name={HONEYPOT} tabIndex={-1} defaultValue="" />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
          <button type="submit" className="btn btn-primary w-full sm:w-auto">
            {pending ? "Subscribing..." : "Subscribe"}
          </button>
          <p
            role="status"
            aria-live="polite"
            className={status.kind === "error" ? "min-w-0 text-[15px] font-medium text-[rgb(var(--danger))]" : "sr-only"}
          >
            {status.message}
          </p>
        </div>
      </fieldset>
    </form>
  )
}
