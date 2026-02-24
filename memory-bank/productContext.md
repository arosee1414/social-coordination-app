# Product Context — Social Coordination App

## Why This Project Exists

Coordinating social hangouts among friend groups is often fragmented across multiple messaging apps and platforms. This app provides a dedicated, purpose-built experience for planning and managing social events with friends.

## Problems It Solves

1. **Scattered coordination** — No single place to manage friend groups and plan hangouts
2. **RSVP confusion** — Unclear who's going, maybe, or not going to events
3. **Missed events** — No centralized view of upcoming and happening-now hangouts
4. **Group management** — Difficulty maintaining friend group lists and inviting the right people

## How It Should Work

### Core User Flow

1. User signs up/in via Clerk (Google OAuth or email)
2. Creates or joins friend groups
3. Creates hangouts — sets title, date/time, optional duration, location, and invites groups or individuals
4. Friends receive invitations and RSVP (Going / Maybe / Not Going)
5. Home dashboard shows what's happening now, upcoming events, and recent activity

### Key Screens

- **Home** — Dashboard with happening now, upcoming hangouts, reminders, recent activity, and a FAB for quick actions
- **Hangouts** — Filterable list of all hangouts (live, upcoming, past, my hangouts)
- **Groups** — List of user's groups with member counts
- **Notifications** — Activity feed
- **Profile** — User settings and profile management
- **Create Hangout** — Form with title, date/time picker, optional duration picker, location, notes, and invite selection
- **Create Group** — Form with name, emoji icon, and member selection

## User Experience Goals

- **Fast and intuitive** — Minimal taps to create a hangout or RSVP
- **Emoji-rich** — Fun, visual identity through avatar emojis and group icons
- **Real-time awareness** — "Happening Now" section with pulsing dot indicator for live events
- **Mobile-first** — Built with React Native for iOS and Android
- **Clean design** — Purple-themed UI with consistent card-based layouts
