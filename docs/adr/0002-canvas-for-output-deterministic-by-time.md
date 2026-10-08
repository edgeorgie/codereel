# ADR 0002: Canvas for output, deterministic by time

Status: accepted

## Context

Preview and export must match and be repeatable.

## Decision

A single pure draw function takes a composition and a time.

## Consequences

Frame stepping for export is trivial; DOM-only effects are out of scope.
