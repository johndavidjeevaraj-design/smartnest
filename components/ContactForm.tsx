"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Check } from "lucide-react";

/**
 * Enquiry form.
 *
 * Posts to the same Formspree endpoint the rest of the site already uses,
 * so submissions land in the same inbox without any extra setup.
 *
 * Error handling is deliberately specific: if Formspree returns field
 * errors we surface them, otherwise we fall back to a message that gives
 * the visitor another way to reach us rather than a dead end.
 */
export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    data.set("_subject", "New SmartNest Website Enquiry (Apple page)");

    setSending(true);
    setError("");

    try {
      const res = await fetch("https://formspree.io/f/xkjoqeyl", {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        let message =
          "Your enquiry could not be sent. Please try again, or reach us directly on WhatsApp or by phone.";
        try {
          const result = await res.json();
          if (result?.errors?.length) {
            message = result.errors
              .map((item: { message: string }) => item.message)
              .join(" ");
          }
        } catch {
          // Keep the fallback message if Formspree returns non-JSON.
        }
        setError(message);
        return;
      }

      setSubmitted(true);
      form.reset();
    } catch {
      setError(
        "We couldn't reach the server. Please check your connection, or contact us directly on WhatsApp."
      );
    } finally {
      setSending(false);
    }
  }

  if (submitted) {
    return (
      <div className="ap-form-success">
        <span className="ap-form-success-icon">
          <Check aria-hidden />
        </span>
        <h3 className="ap-h3">Thanks — we&apos;ve got it.</h3>
        <p className="ap-body" style={{ maxWidth: 380 }}>
          Your enquiry is with us. We&apos;ll come back to you within one working day,
          usually sooner.
        </p>
        <button
          type="button"
          className="ap-link"
          onClick={() => setSubmitted(false)}
        >
          Send another enquiry <ArrowRight />
        </button>
      </div>
    );
  }

  return (
    <form className="ap-form" onSubmit={handleSubmit}>
      <div className="ap-field">
        <label htmlFor="ap-name">Full name</label>
        <input id="ap-name" name="name" required placeholder="Your name" />
      </div>

      <div className="ap-field">
        <label htmlFor="ap-phone">Phone</label>
        <input
          id="ap-phone"
          name="phone"
          type="tel"
          required
          placeholder="+91 00000 00000"
        />
      </div>

      <div className="ap-field">
        <label htmlFor="ap-email">Email</label>
        <input
          id="ap-email"
          name="email"
          type="email"
          placeholder="you@example.com"
        />
      </div>

      <div className="ap-field">
        <label htmlFor="ap-project">What are you planning?</label>
        <select id="ap-project" name="project" defaultValue="" required>
          <option value="" disabled>
            Select project type
          </option>
          <option>New villa / home build</option>
          <option>Apartment</option>
          <option>Renovation / retrofit</option>
          <option>Commercial space</option>
          <option>KNX wired automation</option>
          <option>Wireless automation</option>
          <option>Just exploring</option>
        </select>
      </div>

      <div className="ap-field">
        <label htmlFor="ap-message">Tell us about the project</label>
        <textarea
          id="ap-message"
          name="message"
          rows={4}
          placeholder="Plot size, rooms, what you'd like automated, timeline…"
        />
      </div>

      {error ? <p className="ap-form-error">{error}</p> : null}

      <button
        type="submit"
        className="ap-btn ap-btn-primary"
        disabled={sending}
        style={{ marginTop: 4 }}
      >
        {sending ? "Sending…" : "Send enquiry"}
        {sending ? null : <ArrowRight size={17} />}
      </button>
    </form>
  );
}
