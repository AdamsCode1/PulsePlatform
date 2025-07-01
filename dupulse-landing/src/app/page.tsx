"use client";
import React, { useState } from "react";
import styles from "./page.module.css";

const SOCIETIES = [
  "Durham Union Society",
  "DU CompSoc",
  "DU ArabSoc",
  "Durham University Classical Theatre",
  "Palatinate Newspaper",
  "Purple Radio",
  "DU HispanicSoc",
  "DU Gaming Society",
  "Durham University Hillwalking Club",
  "DU Debating",
  "Music Durham",
  "Durham Student Theatre (DST)",
  "Durham University Charity Kommittee (DUCK)",
];

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", year: "", email: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [duplicate, setDuplicate] = useState(false);

  // Placeholder for duplicate email check (simulate async check)
  const checkDuplicateEmail = async (email: string) => {
    // TODO: Replace with Supabase check
    return false;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setDuplicate(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setDuplicate(false);
    // Email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.name || !form.year || !form.email) {
      setError("Please fill in all fields.");
      setSubmitting(false);
      return;
    }
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email address.");
      setSubmitting(false);
      return;
    }
    if (await checkDuplicateEmail(form.email)) {
      setDuplicate(true);
      setSubmitting(false);
      return;
    }
    // TODO: Submit to Supabase when ready
    setTimeout(() => {
      setSubmitted(true);
      setSubmitting(false);
    }, 1000);
  };

  return (
    <div className={styles.wrapper}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <h1>
          Durham's Student Life, <span className={styles.accent}>One Pulse Away</span>
        </h1>
        <p className={styles.subhead}>
          Never miss out on what's happening at Durham again! No more FOMO, no more scrolling through endless group chats - everything you need to know is right here.
        </p>
        <button className={styles.cta} onClick={() => setModalOpen(true)}>
          Get Early Access
        </button>
      </section>

      {/* Society Slider */}
      <section className={styles.societySlider}>
        <div className={styles.sliderTrack}>
          {[...SOCIETIES, ...SOCIETIES].map((soc, i) => (
            <span className={styles.society} key={i}>{soc}</span>
          ))}
        </div>
      </section>

      {/* Modal */}
      {modalOpen && (
        <div className={styles.modalBackdrop} onClick={() => setModalOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            {submitted ? (
              <div className={styles.modalContent}>
                <h2>Submission received!</h2>
                <p>Look out for more info soon!</p>
                <button className={styles.cta} onClick={() => setModalOpen(false)}>
                  Close
                </button>
              </div>
            ) : (
              <form className={styles.modalContent} onSubmit={handleSubmit}>
                <h2>Join the DUPulse Early Adopters</h2>
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                />
                <select
                  name="year"
                  value={form.year}
                  onChange={handleChange}
                  required
                >
                  <option value="">Year Group</option>
                  <option>First Year</option>
                  <option>Second Year</option>
                  <option>Third Year</option>
                  <option>Fourth Year</option>
                  <option>Postgraduate</option>
                  <option>Staff / Other</option>
                  <option>Business</option>
                </select>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
                {error && <div className={styles.error}>{error}</div>}
                {duplicate && <div className={styles.error}>This email has already signed up.</div>}
                <button className={styles.cta} type="submit" disabled={submitting}>
                  {submitting ? "Signing Up..." : "Sign Me Up!"}
                </button>
                <a
                  className={styles.whatsapp}
                  href="https://chat.whatsapp.com/HepNMq2g9W63ruiYBQQSvc?mode=r_t"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Join our WhatsApp Community
                </a>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Main Info Section */}
      <section className={styles.infoSection}>
        <h2>🚀 What is DUPulse?</h2>
        <p>[Main info content goes here. Replace with your copy!]</p>
        <h3>🎉 Why Sign Up?</h3>
        <p>[Benefits and features... Replace with your copy!]</p>
        <h3>🚧 Development Status</h3>
        <p>[Status update... Replace with your copy!]</p>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        © 2025 DUPulse. All rights reserved.
      </footer>
    </div>
  );
}
