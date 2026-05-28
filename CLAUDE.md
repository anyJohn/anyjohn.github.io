# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Personal digital garden / blog (AnyJohn's blog) built on **Quartz v4.5.2**, published at `anyjohn.github.io`. Content is written in Chinese (Simplified). Quartz is a static site generator that turns Markdown notes into a website, designed for Obsidian-based digital gardens.

- **Framework**: Quartz v4 (TypeScript, Preact, SCSS, esbuild)
- **Node**: v22 (enforced via `.node-version` and `engine-strict=true` in `.npmrc`)
- **Package manager**: npm (`npm ci` in CI) — a `pnpm-lock.yaml` also exists from upstream but npm is canonical here
- **Deployment**: GitHub Actions builds and deploys to GitHub Pages on push to `main`

## Common commands

```bash
# Development (build + watch with hot reload on localhost:8080)
npm run dev

# Build only (output → public/)
npx quartz build

# Type-check + formatting check
npm run check

# Auto-format
npm run format

# Sync content from local Obsidian vault, commit, and push
bash publish.sh
```

## Architecture

### Content (`content/`)

All site content lives here as Markdown files. Directory structure determines URL paths; each directory becomes a category with an auto-generated listing page.

**Categories**: `AI/`, `Javascript/`, `开发者笔记/`, `观点与感想/`, `归档/`, `算法/`, `游戏人生/`, `读书笔记/`

**Frontmatter conventions** (YAML between `---`):
```yaml
---
title: "文章标题"
date: 2026-05-21T19:48:00
author: anyJohn
tags: [AI, Agent]
---
```

Required fields: `title`, `date`. Optional: `author`, `tags`. Date uses ISO 8601 format.

**Markdown flavor**: Obsidian-flavored — wikilinks (`[[page name]]`), callouts, `![[]]` embeds. Images stored in `content/attachments/`.

### Framework source (`quartz/`)

The Quartz framework is a plugin pipeline for static site generation:

```
Markdown content
  → Transformers (parse frontmatter, syntax highlight, wikilinks → HTML links, ToC, LaTeX)
  → Filters (RemoveDrafts)
  → Emitters (generate HTML pages, RSS, sitemap, OG images, copy assets)
  → Output to public/
```

Key directories:
- `quartz/plugins/transformers/` — Markdown AST transforms (ordered pipeline in config)
- `quartz/plugins/filters/` — content exclusion (e.g., drafts)
- `quartz/plugins/emitters/` — output generators
- `quartz/components/` — Preact UI components (pages, scripts, styles)
- `quartz/processors/` — orchestration (parse → filter → emit)
- `quartz/i18n/locales/` — ~20 locale translations including `zh-CN`
- `quartz/styles/` — global SCSS (base, callouts, custom overrides)

### Configuration

- **`quartz.config.ts`** — site metadata, theme colors/typography, plugin registration, analytics
- **`quartz.layout.ts`** — component placement: shared layout (head, comments, footer), per-page sidebars and body sections for content pages vs list pages

### Key customizations from upstream Quartz

- **Comments**: Giscus with repo `anyjohn/anyjohn.github.io`, category "Announcements", `zh-CN` locale, custom light/dark themes in `quartz/static/giscus/`
- **Theme**: Warm beige light mode (`#F5F2E9`), dark charcoal dark mode (`#282828`). Fonts: Schibsted Grotesk / Source Sans Pro / IBM Plex Mono
- **Layout**: Explorer sidebar titled "探索", RecentNotes widget ("近期发布", limit 5, excludes index), ReaderMode button in the search bar row
- **Analytics**: Plausible
- **OG images**: `CustomOgImages` emitter enabled (comment out to speed up builds)

## Content publishing workflow

1. Content is authored in Obsidian at `~/文档/Obsidian Vault/blog/published/`
2. `publish.sh` syncs content: `rsync` from the Obsidian vault → `content/`, then `git add .`, commits, and pushes to `origin main`
3. GitHub Actions (`.github/workflows/deploy.yml`) triggers on push to `main`, runs `npx quartz build`, and deploys `public/` to GitHub Pages

The Obsidian vault path (`~/文档/Obsidian Vault/blog/published/`) and site repo path (`~/项目/anyjohn.github.io`) are hardcoded in `publish.sh`.

## Commit conventions

- Content sync commits: `update: content & synced assets YYYY-MM-DD HH:MM`
- Feature/structural changes: conventional commits (`feat:`, `fix:`, `refactor:`, `chore:`, `build(deps):`, `docs:`)
