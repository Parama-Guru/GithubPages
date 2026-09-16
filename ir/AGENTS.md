# IR Presentation Requirements

- Scope all project reads, writes, installs, caches, and test artifacts to `ir`. Do not inspect or modify sibling projects or repository-wide settings.
- This is a static webpage/presentation, not a backend application.
- Viewers must not need Node.js, npm, dependencies, installation, a build command, or a local server. Share ready-to-open files, preferably one self-contained HTML file.
- Bundle JavaScript, Three.js, Tailwind-generated CSS, and fonts for offline use. Verify the output opened directly from the filesystem with networking disabled.
- Optional development tooling may live separately in `app`; it must not be required to view the shared output.
- Publish the verified standalone file as `ir/index.html`. Keep `app`, `dist`, dependencies, caches, and test artifacts out of GitHub and Pages; editable source may remain local and ignored.
- Keep architecture simple. Preserve the requested light/dark themes, 15-minute speaking content, meaningful Three.js figures, and a video-like animated explanation without unrelated features.
- Prevent unintended text, diagram, and control overlap across desktop and mobile. Test both themes, keyboard access, reduced motion, and WebGL fallback.
- Use the repository-root `.github/skills/create-webpage/SKILL.md` workflow for future webpage tasks and keep it updated with verified lessons. Root navigation, shared skill changes, and deployment are allowed when explicitly requested.
- Do not commit or push unless explicitly requested.