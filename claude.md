# Next.js CMS (WordPress Alternative)

You are a senior full-stack engineer specializing in Next.js, Supabase, and scalable CMS architecture.

## Project Overview

Build a modern CMS similar to WordPress using **Next.js and Supabase**.

The CMS should allow users to create, edit, and publish blog posts with media uploads, categories, and SEO metadata.

The system must include:

- Public blog website
- Admin dashboard
- Authentication
- Post management
- Media library
- Category & tag system

The project must be scalable and production-ready.

---

# Tech Stack

Frontend:
- Next.js (App Router)
- TypeScript
- Bootstrap 5
- Sass
- Remix Icons

Backend:
- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Storage

Deployment:
- Vercel

---

# Core Features

## Authentication

Use Supabase Auth.

Users should be able to:

- Register
- Login
- Logout
- Reset password

Roles:

- Admin
- Editor

Only admins can manage users.

---

# CMS Features

## Posts

Each post must include:

- title
- slug
- content (rich text)
- featured image
- author
- status (draft / published)
- category
- tags
- meta title
- meta description
- created_at
- updated_at

Post actions:

- create
- edit
- delete
- publish
- unpublish

---

## Categories

Fields:

- id
- name
- slug
- description

Actions:

- create
- edit
- delete

---

## Tags

Fields:

- id
- name
- slug

---

## Media Library

Users should be able to upload:

- images
- videos

Storage:

Supabase Storage bucket.

Features:

- upload
- delete
- preview
- copy URL

---

# Public Blog

Public users should be able to:

- view blog posts
- filter by category
- filter by tag
- search posts

URLs:
/blog
/blog/[slug]
/category/[slug]
/tag/[slug]


Pages must be **SEO optimized**.

Use **server rendering** for blog pages.

---

# Admin Dashboard

Admin dashboard should include:

Sidebar navigation.

Sections:

Dashboard

Posts
- All posts
- Add new

Categories

Tags

Media Library

Users

Settings

---

# Database Schema

## users
id
name
email
role
created_at


## posts
id
title
slug
content
featured_image
author_id
status
meta_title
meta_description
created_at
updated_at


## categories
id
name
slug
description


## tags


id
name
slug


## post_tags


post_id
tag_id


---

# Folder Structure


/app
/admin
/posts
/categories
/tags
/media

/components
/ui
/editor
/forms

/lib
/supabase
/utils

/styles
sass


---

# Coding Standards

Follow these rules strictly:

1. Use **TypeScript**
2. Use **functional React components**
3. Use **server components when possible**
4. Use **server actions for mutations**
5. Use **Supabase client helpers**

---

# UI Guidelines

Design must be:

- minimal
- clean
- fast

Use:
Bootstrap grid system.

Icons:
Remix Icons

---

# Performance Requirements

- Server-side rendering for blog pages
- Image optimization
- Lazy loading
- Pagination for posts

---

# Security

- Use Supabase RLS
- Protect admin routes
- Only admins/editors can access dashboard

---

# Future Features

The architecture must allow adding:

- comments
- newsletter
- analytics
- multi-author blogs
- page builder

---

# AI Instructions

When generating code:

1. Always follow the project structure.
2. Use Supabase for database interactions.
3. Write modular components.
4. Avoid unnecessary libraries.
5. Write production-ready code.