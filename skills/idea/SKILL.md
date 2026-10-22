---
name: idea
description: Idé-intake från idé till leverans. Brief, godkännande, plan, implementering och verifiering mot acceptanskriterier, med backlog i docs/backlog och planer i docs/plans. Startas bara manuellt med /idea.
disable-model-invocation: true
argument-hint: "<beskrivning> | answer|approve|plan|start|done|drop NNN [text] | list"
---

# Idé-intake

Argument: $ARGUMENTS

Nuvarande backlog i detta projekt:
!`ls docs/backlog 2>/dev/null || echo "(ingen backlog ännu)"`

Skriv alla backlog- och plandokument på svenska. Kod, filnamn, kommandon och
felmeddelanden behålls som de är.

## Välj läge

Titta på första ordet i argumentet:

| Första ordet | Läge |
|---|---|
| `list` | Lista |
| `answer NNN <svar>` | Svar |
| `approve NNN` | Godkänn |
| `plan NNN` | Plan |
| `start NNN` | Start |
| `done NNN` | Klar |
| `drop NNN <skäl>` | Avbryt |
| (tomt) | Visa tabellen ovan som hjälp och stoppa |
| allt annat | Ny idé, hela argumentet är beskrivningen |

NNN är backlog-numret. Acceptera både `7` och `007`. Om filen inte finns: säg
det och stoppa.

## Grundregler för alla lägen

- Läs status i backlog-filen innan du gör något. Om kommandot inte passar
  statusen: säg vilken status filen har och vilket kommando som gäller. Stoppa.
- Status ändras bara av dessa kommandon. "Ok", "låter bra" eller liknande i
  chatten är inte ett godkännande. Hänvisa till `/idea approve NNN`.
- Före status PLANNED: ändra inga projektfiler. De enda tillåtna skrivningarna
  är `docs/backlog/NNN-*.md` och `docs/plans/NNN-*.md`.
- Implementera aldrig under intake, även om idén verkar liten eller självklar.
- Presentera aldrig gissningar som fynd. Säg uttryckligen vad som inte
  inspekterats.
- Vid varje statusändring: lägg till en rad under Historik i backlog-filen
  (datum, ny status, kommando).

Filformat och statusar: se [backlog-format.md](backlog-format.md).

## Ny idé

1. Jämför med backlog-listan ovan. Om en befintlig idé täcker samma sak: säg
   det, föreslå `/idea answer NNN` på den, och skapa ingen ny fil förrän jag
   bekräftar.
2. Nummer: högsta befintliga NNN + 1, tre siffror. Namn: 2–4 ord i kebab-case,
   utan å, ä och ö.
3. Bedöm storleken:
   - Liten idé (högst 2–3 filer, ingen ändring av datamodell eller API): läs
     filerna direkt och skriv en lite-brief.
   - Annars: gör kodinspektionen via en read-only Explore-subagent. Ge den
     idén och be om berörda moduler, filer, datamodeller, API:er, kod som kan
     återanvändas och en lista över inspekterade filer.
4. Om idén är för vag för att skriva acceptanskriterier: skapa filen med status
   IDEA och bara Problem och Frågor. Stoppa.
5. Annars: skriv hela briefen enligt [brief-template.md](brief-template.md).
6. Utmana idén (se nedan).
7. Svara i chatten med: sökväg, sammanfattning på 2–3 rader, frågorna,
   eventuella konflikter och nästa kommando. Stoppa.

## Utmana idén

Säg uttryckligen om idén:
- duplicerar befintlig funktionalitet,
- krockar med arkitekturen eller ett tidigare beslut (sök i `docs/backlog`,
  `docs/plans` och eventuella ADR- eller arkitekturdokument),
- har hög kostnad för lågt värde,
- löses bättre på ett annat sätt.

Redovisa konflikten och resonemanget. Lös den inte tyst. Beslutet är mitt.

## Frågor

- Ställ högst fem öppna frågor, de viktigaste, numrerade Q1, Q2 …
- Skriv alla övriga osäkerheter som numrerade antaganden A1, A2 … som jag kan
  rätta.

## Svar (answer)

Kräver status IDEA.
1. Koppla svaren till Q-numren, till exempel "Q1: ja, Q3: bara admin".
2. Skriv in dem under Beslut.
3. Uppdatera briefen: ta bort besvarade frågor, justera scope, acceptanskriterier
   och antaganden.
4. Om svaren väcker nya viktiga frågor: ställ dem. Högst fem öppna totalt.
5. Visa vad som ändrats. Stoppa.

## Godkänn (approve)

Grinden bestäms av nuvarande status:
- IDEA till REFINED: briefen måste vara komplett, utan öppna frågor och med minst
  ett acceptanskriterium. Annars: lista vad som saknas och stoppa. Om briefen
  föreslår en split: genomför den (se Splitting).
- REFINED med plan till PLANNED: planfilen måste finnas och vara länkad.
- REFINED utan plan: säg att `/idea plan NNN` behövs först.
- Annan status: säg att det inte finns något att godkänna.

## Plan

Kräver status REFINED.
1. Läs briefen och besluten. Inspektera koden igen vid behov, med samma regler
   som vid ny idé.
2. Skriv `docs/plans/NNN-namn.md` enligt [plan-template.md](plan-template.md).
3. Varje steg anger vilka acceptanskriterier det uppfyller. Varje
   acceptanskriterium täcks av minst ett steg.
4. Länka planen i backlog-filen.
5. Stoppa och be om `/idea approve NNN`.

## Start

Kräver status PLANNED.
1. Kontrollera om briefen är inaktuell. Om projektet är ett git-repo: kör
   `git log --since=<briefens datum> --name-only` och jämför med filerna i
   Påverkansanalys och planen. Om berörda filer har ändrats: rapportera vilka
   och fråga om planen ska uppdateras eller köras ändå. Stoppa tills jag svarat.
2. Sätt status IN PROGRESS.
3. Genomför planstegen i ordning. Efter varje steg: bocka av det i planen och
   ge en kort stegrapport (vad, vilka filer, hur det verifierats).
4. Nya idéer som dyker upp under arbetet startas aldrig. Skapa en IDEA-fil på
   1–2 rader utan brief, fortsätt och nämn den i stegrapporten.
5. Om något kräver avvikelse från planen som ändrar scope eller
   acceptanskriterier: stoppa och fråga.

## Klar (done)

Kräver status IN PROGRESS och att alla plansteg är avbockade.
1. Verifiera varje acceptanskriterium med bevis: ett test som körts, ett
   kommando och dess utdata, eller en beskriven manuell kontroll.
2. Fyll i Verifiering-tabellen i backlog-filen.
3. Om något kriterium inte är uppfyllt: behåll IN PROGRESS och rapportera vad
   som fattas.
4. Om alla är uppfyllda: sätt status DONE.

## Avbryt (drop)

Tillåtet för alla statusar utom DONE. Sätt status DROPPED och spara skälet.
Om status var IN PROGRESS: lista kodändringar som redan gjorts. Återställ
ingenting utan att fråga.

## Lista

Läs alla filer i `docs/backlog`. Visa en tabell med nummer, titel, status och
nästa kommando, grupperad efter status.

## Splitting

Om arbetet inte kan levereras och verifieras som en enhet: föreslå en split i
briefens Storlek-sektion och motivera den. Det finns ingen fast storleksgräns.
När briefen godkänns:
- skapa en backlog-fil per del, med nya nummer, status IDEA, sin del av briefen
  och en länk till föräldern,
- sätt förälderns status till SPLIT och lista delarna i den.

Varje del går sedan igenom egen brief, plan och godkännanden.
