---
layout: page
title: "Secure Password Vault: Enterprise Encryption"
image: assets/images/portfolio/safe.webp
sector: "FinTech / Security"
role: "Lead Backend Engineer"
technologies: [Java, JavaFX, SQLite, AES-256]
github_url: "https://github.com/novenopatch/MyPasswordManager"
---

### Project Overview
The **Secure Password Vault** was born from a need for a platform-independent, offline-first security tool that provides enterprise-grade encryption for sensitive credentials.

### Technical Challenges
*   **Security Paradox:** How to provide ease of access while maintaining zero-knowledge security?
*   **Performance:** Encryption and decryption must be instantaneous to the user but computationally expensive for attackers.

### Strategic Solutions
1.  **AES-256 Implementation:** Utilizing standard cryptographic libraries to ensure industry-compliant data at rest security.
2.  **PBKDF2 Hashing:** Slowing down brute-force attacks by using high iteration counts for master password verification.
3.  **Modular Database Layer:** Implementation of a repository pattern to allow seamless transitions between different local storage engines.

### Impact
The project demonstrated that robust security doesn't require cloud dependency, offering users complete data sovereignty.
