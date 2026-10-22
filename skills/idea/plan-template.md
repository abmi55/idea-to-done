# Plan-mall

Fil: `docs/plans/NNN-namn.md`

```markdown
# Plan NNN: Titel

Brief: [NNN-namn](../backlog/NNN-namn.md)
Skapad: YYYY-MM-DD

## Översikt
2–3 rader om angreppssättet.

## Steg
- [ ] S1: Vad som görs.
  Filer: …
  Uppfyller: AC1
  Verifiering: test, kommando eller manuell kontroll.
- [ ] S2: …

## Täckning
| AC | Steg |
|---|---|
| AC1 | S1, S3 |

## Teststrategi
Vilka tester läggs till eller ändras, och hur de körs.

## Migrering och återställning
Bara om relevant. Annars "N/A".

## Risker under implementeringen
```

Regler:
- Varje steg ska kunna verifieras för sig.
- Varje acceptanskriterium ska finnas i Täckning-tabellen.
- Inga steg utanför briefens scope.
