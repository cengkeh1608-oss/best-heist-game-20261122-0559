# VELVET VAULT — The Meridian Heist

A top-down heist game for make.fun's `best-heist-game-20261122-0559` bounty.
You are Wren, a thief crossing three rooms of the Meridian museum at night:
the Gallery, the Vault Hall and the Grand Vault.

## How to play

- **WASD / arrows** — move
- **Shift** — sneak (slow, silent)
- **Space** — dash through a cone's sweep
- **Q** — smoke bomb (blinds every eye for 5 seconds)
- **E (hold)** — hack a nearby camera (off for 12 seconds)
- **Enter** — start / next room · **R** — retry · **M** — mute

Steal the target amount of loot, then reach the green EXIT. Red guard cones
and amber camera cones raise the alarm; blue shadow pockets hide you. If the
alarm hits 100, you are caught.

## Run it

Serve `game/` with any static server and open `game/index.html` — no build
step, no network requests, all sound synthesized with WebAudio.

Screenshots are staged with `?shot=cover|patrol|shadow|victory`.
