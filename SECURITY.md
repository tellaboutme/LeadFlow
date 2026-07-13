# Security policy

## Supported versions

Until the first stable release, only the latest commit on `main` and the latest published release receive security fixes.

After v1.0, this table must be maintained:

| Version | Supported |
|---|---|
| latest | Yes |
| older releases | Case by case |

## Reporting a vulnerability

Do **not** open a public issue, discussion or pull request for a vulnerability.

Use GitHub private vulnerability reporting:

https://github.com/tellaboutme/LeadFlow/security/advisories/new

Include:

- affected version or commit;
- impact;
- reproduction steps;
- proof of concept when safe;
- suggested mitigation if known;
- whether details have been disclosed elsewhere.

Remove unrelated personal data and never include live API keys.

## Response targets

Best-effort targets for this portfolio project:

- acknowledgement: within 3 business days;
- initial triage: within 7 business days;
- status updates: when material progress changes;
- coordinated disclosure after a fix is available.

These are targets, not a service-level agreement.

## Scope

Security-relevant areas include:

- authentication/authorization;
- secret exposure;
- lead data exposure;
- prompt injection with security impact;
- SSRF or unsafe external calls;
- SQL injection;
- XSS;
- CSV formula injection;
- GitHub Actions/supply-chain compromise;
- container/deployment configuration.

Pure AI classification quality issues without a security impact should use a normal bug report.

## Disclosure

Validated vulnerabilities are fixed privately through a repository security advisory when appropriate. Credit is given with the reporter’s consent.
