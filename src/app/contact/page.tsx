import styles from "./contact.module.css";
import React from "react";

export default function ContactPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Get In Touch</h1>
        <p className={styles.subtitle}>Have a question, partnership proposal, or just want to say hi? We'd love to hear from you.</p>
      </header>

      <div className={styles.grid}>
        <div className={styles.contactInfo}>
          <div className={styles.infoCard}>
            <span className={styles.icon}>✉️</span>
            <div>
              <h3>Email Us</h3>
              <p>For general inquiries:<br /><strong>hello@magtech.example.com</strong></p>
              <p>For press & partnerships:<br /><strong>partners@magtech.example.com</strong></p>
            </div>
          </div>

          <div className={styles.infoCard}>
            <span className={styles.icon}>🏢</span>
            <div>
              <h3>Visit Us</h3>
              <p><strong>MagTech Media HQ</strong><br />123 Innovation Drive<br />Silicon Valley, CA 94025<br />United States</p>
            </div>
          </div>
          
          <div className={styles.infoCard}>
            <span className={styles.icon}>📱</span>
            <div>
              <h3>Follow Us</h3>
              <div className={styles.socialLinks}>
                <a href="#">Twitter/X</a> • <a href="#">LinkedIn</a> • <a href="#">Instagram</a>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.formContainer}>
          <h2 className={styles.formTitle}>Send a Message</h2>
          <form className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>Full Name</label>
              <input type="text" id="name" className={styles.input} placeholder="John Doe" required />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>Email Address</label>
              <input type="email" id="email" className={styles.input} placeholder="john@example.com" required />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="subject" className={styles.label}>Subject</label>
              <select id="subject" className={styles.select}>
                <option value="general">General Inquiry</option>
                <option value="editorial">Editorial / Write for Us</option>
                <option value="partnership">Partnerships & Advertising</option>
                <option value="support">Technical Support</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="message" className={styles.label}>Message</label>
              <textarea id="message" rows={6} className={styles.textarea} placeholder="How can we help you?" required></textarea>
            </div>

            <button type="submit" className={styles.submitBtn}>Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
}
