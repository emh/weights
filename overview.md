# Weights Project Overview

## Summary

This repository is a small static single-page web app and PWA for tracking weightlifting workouts.
There is no framework, build step, package manager manifest, or automated test setup in the repo.

The app supports:

- Workout list on the main screen
- Inline workout creation from a single text field
- Workout detail screen with exercises, sets, and notes
- Inline editing and deletion for workouts, exercises, and sets
- Exercise history drawer with filters and rep-max shortcuts
- CSV import/export
- Theme and font-size settings
- PWA install and offline shell caching

## File Map

- `index.html`: Static app shell and all DOM mount points
- `main.js`: All application state, parsing, rendering, event binding, persistence, CSV import/export, and history logic
- `styles.css`: Entire visual system and layout
- `sw.js`: Service worker for app-shell caching and update activation
- `manifest.webmanifest`: PWA manifest
- `docs/README.md`: UI walkthrough with screenshots

## Architecture

The app is implemented as one self-invoking script in `main.js`.

Key characteristics:

- Single global `state` object
- Manual DOM rendering via `document.createElement`
- Manual event binding
- `localStorage` persistence
- No router, component system, or state management library

Screen model:

- `main`: workout list, add-workout UI, settings menu
- `workout`: single workout detail screen with exercises, sets, notes, and history drawer

## State Shape

Top-level state fields of interest:

- `workouts`: stored workout data
- `screen`: `"main"` or `"workout"`
- `mainAddOpen`: whether the main add-workout editor is open
- `mainExpandedWorkoutId`: expanded row on the main screen
- `expandedWorkoutId`: active workout in workout screen
- `expandedExerciseId`: active exercise in workout screen
- `current`: current focused entity
- `edit`: current edit mode, if any
- `historyOpen`, `historyFilterOpen`, `historyFilterWeight`, `historyFilterReps`, `historyMaxFocus`
- `fontSizePt`, `themeKey`
- `exerciseLookup`: derived list used for autocomplete

Current selection model:

- `{ kind: "workout", workoutId }`
- `{ kind: "exercise", workoutId, exerciseId }`
- `{ kind: "set", workoutId, exerciseId, setIndex }`

## Data Model

Workout shape:

```js
{
  id,
  dateISO,
  exercises: [
    {
      id,
      name,
      sets: [...]
    }
  ],
  notes
}
```

Set model supports multiple metric types:

- reps
- seconds
- meters
- feet
- invalid/raw fallback entries

Set load model supports:

- direct weight, optionally in kg
- label-based loads such as named variants
- composite load expressions such as `22.5/22.5` or `32+32kg`
- optional RPE from 1 to 10

## Core Flow

Startup sequence in `main.js`:

1. Register event handlers
2. Register the service worker
3. Load and sanitize persisted state
4. Open the zero-state add UI when appropriate
5. Build theme buttons
6. Apply appearance settings
7. Render the screen

Main render path:

- `render(opts = {})` is the central UI renderer
- It clears and rebuilds visible DOM each render
- It delegates history UI to `renderHistoryDrawer(activeWorkout)`

## Parsing and Input Logic

The most logic-dense part of the app is input parsing.

Important parser areas:

- date parsing via `parseDateToken()` and `parseDatePrefix()`
- workout quick-add parsing via `parseWorkoutLine()`
- exercise parsing via `parseExerciseLine()`
- set parsing via `parseSingleSet()` and `parseSetsSpec()`
- load parsing via `parseLoadToken()`
- set normalization via `normalizeStoredSet()` and `buildSet()`

Supported input examples include:

- dates like `2026.03.09`
- relative dates like `today`, `yesterday`, `tomorrow`
- quick workout creation like `2026.03.09 bench press, deadlift`
- set notations such as `5@225`, `3x5@185`, `30s`, `5/5@22.5/22.5`

## Persistence

Local persistence uses:

- key: `weights_minimal_v4`
- legacy migration key: `weights_minimal_v3`

Persistence functions:

- `save()`: serializes selected state to `localStorage`
- `load()`: restores state and migrates legacy data
- `sanitizeState()`: normalizes workouts, selection state, and appearance settings
- `sanitizeCurrent()`: ensures the focused entity still exists

## CSV Support

CSV features include:

- import by file picker
- export of workout rows
- parsing of optional RPE column
- creation of missing workouts and exercises during import

Important functions:

- `parseCsvRows()`
- `importCsvText()`
- `buildExportCsvData()`
- `applyImportedSetRpes()`

## History Drawer

The history drawer depends on the currently selected exercise inside the workout screen.

Capabilities:

- show prior sessions of the same exercise
- filter by weight and reps
- derive per-rep maximum entries and jump to them

Important functions:

- `getExerciseHistoryRows()`
- `parseNumericFilter()`
- `setMatchesHistoryFilters()`
- `getExerciseRepMaxEntries()`
- `renderHistoryDrawer()`

## Workout Indicators

The main screen includes a workout indicator badge once enough history exists.

It estimates:

- volume bucket from rep-equivalent volume
- intensity bucket from low-rep loaded sets compared to exercise history

Important functions:

- `getWorkoutRepEquivalentVolume()`
- `getWorkoutExerciseIntensityStats()`
- `getWorkoutIndicatorMap()`

## Likely Bug Hotspots

If we are triaging bugs, these are the highest-risk areas:

- Set parsing and shorthand carry-forward behavior
- Ambiguous number parsing in `parseSetsSpec()`
- Composite load parsing and comparable-weight calculations
- State transitions between `current`, `edit`, `expandedWorkoutId`, and `expandedExerciseId`
- Inline editor focus/cancel behavior
- History drawer filtering and max-focus row matching
- CSV import edge cases and malformed rows
- Legacy state sanitization after loading old data
- Pointer/tap behavior on interactive rows
- Rendering side effects that depend on `save()` and `render()` ordering

## Practical Notes For Future Work

- Most bug fixes will be in `main.js`.
- Changes in parsing often affect import/export, summaries, history, and rendering at once.
- There is no existing automated safety net, so manual reasoning and targeted browser verification matter.
- The repo is small enough that reading `main.js` around the affected feature is usually the fastest path.
