# Project Brief — Social Coordination App ("Hangout")

## Overview

A social coordination mobile app that helps friend groups plan and manage hangouts. The app enables users to create groups, invite friends, schedule hangouts, and RSVP — all through a clean, emoji-rich mobile experience.

## Core Requirements

1. **User Profiles** — Clerk-authenticated users with display names, avatar emojis, and bios
2. **Groups** — Create and manage friend groups with admin/member roles
3. **Hangouts** — Schedule events with title, location, date/time, optional duration (max 24h, 8h default), and invite groups or individual users
4. **RSVP** — Going / Maybe / Not Going status for hangout attendees
5. **Home Dashboard** — Happening now, upcoming hangouts, recent activity, and reminder banners
6. **Notifications** — In-app notification feed (push notifications deferred to Phase 2)

## Architecture

- **Frontend**: React Native (Expo SDK 54) with Expo Router, TypeScript, Clerk auth
- **Backend**: C# .NET 8 Web API, Azure Cosmos DB, Clerk JWT authentication
- **API Client**: Auto-generated TypeScript client via NSwag from Swagger/OpenAPI spec
- **Hosting**: Azure (backend), Expo (frontend dev)

## Project Scope

### Phase 1 (Current)

- Users, Groups, Hangouts CRUD
- RSVP functionality
- Seed data for development
- Frontend connected to real backend API

### Phase 2 (Future)

- Friends system
- Push notifications
- Activity feed
- Friend profiles
- Integration tests

## Source of Truth

- Backend API contract is defined by controllers and DTOs under `Backend/SocialCoordinationApp/`
- Frontend types are generated from the Swagger spec — never manually edited
- Implementation plans in `implementation_plan.md` and `backend-implementation-plan.md` document feature-level decisions
