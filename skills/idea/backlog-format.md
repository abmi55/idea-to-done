# Backlog-format

Plats: `docs/backlog/NNN-namn.md`, en fil per idé. NNN har tre siffror.

## Statusar

| Status | Betydelse | Nästa kommando |
|---|---|---|
| IDEA | Ny eller under förfining | `answer`, `approve` |
| REFINED | Brief godkänd | `plan`, sedan `approve` |
| PLANNED | Plan godkänd | `start` |
| IN PROGRESS | Implementeras | `done` |
| DONE | Alla acceptanskriterier verifierade | – |
| DROPPED | Avbruten, skälet sparat | – |
| SPLIT | Uppdelad i egna backlog-filer | (delarnas kommandon) |

## Full fil

```markdown
# NNN: Titel

Status: IDEA
Skapad: YYYY-MM-DD
Plan: –
Förälder: –
Delar: –

## Brief
(enligt brief-template.md)

## Beslut
- Q1: …

## Verifiering
| AC | Resultat | Bevis |
|---|---|---|

## Historik
- YYYY-MM-DD IDEA (/idea)
```

## Kort fil för idéer under annat arbete

```markdown
# NNN: Titel

Status: IDEA
Skapad: YYYY-MM-DD
Upptäckt under: NNN, steg Sx

1–2 rader om idén.
```
