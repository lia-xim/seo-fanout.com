# Security policy

Do not open a public issue for a suspected vulnerability, exposed credential, private endpoint, or personal data. Use GitHub's private vulnerability reporting or security advisory flow for this repository.

The current deployment is a static, indexable public tool. Any future network fetcher, authentication flow, API, upload, user data, billing, or destructive action requires a dedicated security review before release.

Production responses set a restrictive Content Security Policy, HSTS, nosniff, referrer, permissions, and framing headers through `vercel.json`.
