# fabric-bridge-info

The FabricBridge site, served from GitHub Pages. Plain HTML, CSS and JS — no build step, no dependencies. Edit the files and push to `main`.

## Keeping the changelog current

`changelog.html` shows the **current release only**. It is rewritten each release, never appended to.

On every plugin release:

1. Rewrite the release card in `changelog.html`: release date, version meta line (Minecraft version, loader, Java), the intro sentence and the "Fixes in this build" bullets.
2. Write one bullet per user-visible change since the last release — a fix, a new command, a new compatibility path. Internal refactors stay out.
3. Update the verification line with the server builds the jar being uploaded was booted on.
4. In the version table, mark the targeted Minecraft version `Supported — current`. If this release stops supporting an older one, mark it `Discontinued` with the last release that supported it.
5. Bump the version text: footer in `index.html` and `changelog.html`, plus `v1.0` in the `index.html` hero meta, the compatibility chip and the JSON-LD `softwareVersion`.
6. Delete the previous release's entries — they are not archived on this page.

The plugin's own `CHANGELOG-*.md` is the detailed record; this page is the public summary of what is current.
