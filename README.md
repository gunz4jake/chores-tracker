# Good Enough Home

A calm, local-first chores tracker. It gives you a short list of useful chores each day, tracks completion without guilt, and includes a lightweight weekly review.

## Run it

```bash
npm test
npm start
```

Then open <http://localhost:4173>.

There are no dependencies or build step. Data is stored in the browser's local storage for this first version.

## Docker deployment

On a Docker host with Git access to the private repository:

```bash
git clone https://github.com/gunz4jake/chores-tracker.git
cd chores-tracker
docker compose up -d --build
```

The app listens on port `8097` by default. Change it without editing the Compose file:

```bash
CHORE_TRACKER_PORT=8100 docker compose up -d --build
```

For a private repository, authenticate the host with a GitHub fine-grained token or a read-only deploy key. Do not put credentials in `compose.yaml` or commit them to the repository.

In Arcane, deploy the project with **Build & Deploy**. The Compose configuration uses `pull_policy: build` so Arcane builds `chores-tracker:local` from this repository instead of trying to pull that local-only image from a registry.

## Included

- Daily, weekly, and biweekly recurring chores
- Daily chore limit and lighter-day mode
- Complete and remove actions
- Add chores with a frequency and time estimate
- Monthly calendar with upcoming chores and completion status
- Weekly completion and active-day summary
- Responsive, mobile-friendly interface

## Next likely improvements

- Edit existing chores
- Snooze and skip actions
- Better room/category setup
- PWA install support and reminders
- Multi-device sync
