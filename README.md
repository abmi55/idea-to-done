# /idea – idé-intake för Claude Code

En skill för [Claude Code](https://code.claude.com) som tar en idé hela vägen
från första beskrivning till verifierad leverans. Varje steg har en tydlig grind
som du själv godkänner.

```
/idea <beskrivning>  →  IDEA  →  REFINED  →  PLANNED  →  IN PROGRESS  →  DONE
                              approve     approve      start          done
```

## Varför behövs den?

En AI-agent som Claude är snabb på att skriva kod. Just det är också risken.
Utan en process händer ofta följande:

- **Agenten börjar implementera direkt.** En halvtänkt idé blir kod innan
  någon har frågat vad problemet egentligen är, för vem det löses eller hur man
  vet att det fungerar.
- **Scope växer i det tysta.** Agenten tolkar luckor på egen hand och bygger mer
  eller annat än det som var tänkt.
- **"Klart" betyder "koden är skriven".** Ingen kontrollerar att det som
  levererades faktiskt uppfyller kraven.
- **Idéer försvinner.** Något som dyker upp mitt i annat arbete blir antingen
  bortglömt eller påbörjat direkt, och då tappar man fokus på det man höll på
  med.
- **Godkännanden blir otydliga.** Ett "låter bra" i chatten tolkas som klartecken
  att implementera.
- **Gissningar ser ut som fakta.** Agenten beskriver kod den aldrig har läst som
  om den hade inspekterat den.

Skillen löser detta med en enkel struktur: först förstå, sedan planera, sedan
bygga och till sist bevisa.

## Vad den gör bra

**Tydliga grindar.** Status ändras bara via kommandon som `/idea approve 007`.
Ett "ok" i chatten räknas inte. Du vet alltid exakt vad du har godkänt.

**Ingen kod före en godkänd plan.** Under intake får agenten läsa koden men
bara skriva i backlog- och plandokumenten.

**Spårbarhet från början till slut.** Frågor (Q1 …), antaganden (A1 …) och
acceptanskriterier (AC1 …) får id:n. Varje plansteg anger vilka kriterier det
uppfyller. `/idea done` verifierar kriterium för kriterium, med bevis.

**Agenten säger emot.** Om idén duplicerar något som redan finns, krockar med
arkitekturen eller kostar mer än den ger, så säger agenten det. Beslutet är
fortfarande ditt.

**Ärlighet om vad som lästs.** Briefen listar vilka filer som inspekterades och
vilka som inte gjorde det.

**Skydd mot inaktuella planer.** `/idea start` kontrollerar med `git log` om
berörda filer har ändrats sedan briefen skrevs.

**Idéer under arbetet sparas utan att avbryta.** De skrivs som en kort
backlog-fil, och arbetet fortsätter.

**Lätt för små idéer.** En liten idé får en kort brief där sektioner som inte
gäller skrivs som "N/A". Ingen subagent behövs.

**Sparar kontext.** Hela processen ligger i skillen och laddas bara när du kör
`/idea`. Det som alltid måste gälla är fyra rader i `rules/`.

## Kommandon

| Kommando | Kräver status | Gör |
|---|---|---|
| `/idea <beskrivning>` | – | Läser koden, skapar backlog-fil och skriver brief |
| `/idea answer NNN <svar>` | IDEA | Lägger in dina svar och uppdaterar briefen |
| `/idea approve NNN` | IDEA / REFINED | Godkänner brief eller plan |
| `/idea plan NNN` | REFINED | Skriver implementeringsplanen |
| `/idea start NNN` | PLANNED | Kontrollerar aktualitet och implementerar steg för steg |
| `/idea done NNN` | IN PROGRESS | Verifierar varje acceptanskriterium |
| `/idea drop NNN <skäl>` | allt utom DONE | Avbryter idén och sparar skälet |
| `/idea list` | – | Visar backloggen |

## Exempel

```
/idea Användare ska kunna exportera sina annonser som CSV
```

Claude skapar `docs/backlog/001-csv-export.md` med en brief: problem, scope,
högst fem frågor, acceptanskriterier, påverkansanalys med inspekterade filer,
risker och storlek. Sedan stannar Claude.

```
/idea answer 001 Q1: bara egna annonser, Q2: semikolon som separator
/idea approve 001
/idea plan 001
/idea approve 001
/idea start 001
/idea done 001
```

## Installation

Skillen installeras globalt och gäller då i alla dina projekt.

**macOS, Linux eller Git Bash:**

```bash
git clone https://github.com/<ditt-konto>/claude-idea-skill.git
cp -r claude-idea-skill/skills/idea ~/.claude/skills/
mkdir -p ~/.claude/rules && cp claude-idea-skill/rules/idea-intake.md ~/.claude/rules/
```

**Windows PowerShell:**

```powershell
git clone https://github.com/<ditt-konto>/claude-idea-skill.git
Copy-Item -Recurse claude-idea-skill\skills\idea $HOME\.claude\skills\
New-Item -ItemType Directory -Force $HOME\.claude\rules
Copy-Item claude-idea-skill\rules\idea-intake.md $HOME\.claude\rules\
```

Starta om Claude Code och skriv `/idea` för att se hjälpen.

Om du redan har egna idé-regler i ett projekts `CLAUDE.md`: ta bort dem, så att
Claude inte får två versioner som säger olika saker.

## Filer

```
skills/idea/
  SKILL.md            lägen, grindar och regler
  brief-template.md   de tio sektionerna i en brief
  plan-template.md    planformat med täckningstabell
  backlog-format.md   statusar och filformat
rules/
  idea-intake.md      regler som alltid gäller, även utan /idea
```

I varje projekt skapar skillen:

```
docs/backlog/NNN-namn.md   brief, beslut, verifiering och historik
docs/plans/NNN-namn.md     implementeringsplan
```

## Statusar

| Status | Betydelse |
|---|---|
| IDEA | Ny eller under förfining |
| REFINED | Brief godkänd |
| PLANNED | Plan godkänd |
| IN PROGRESS | Implementeras |
| DONE | Alla acceptanskriterier verifierade |
| DROPPED | Avbruten, skälet sparat |
| SPLIT | Uppdelad i mindre delar, var och en med egen backlog-fil |

## Begränsningar

- Regeln "skriv inga projektfiler under intake" är en instruktion, inte ett
  tekniskt hinder. Claude följer den, men om du vill ha en hård spärr kan du
  lägga till en `PreToolUse`-hook som blockerar filändringar utanför `docs/`.
- Kontrollen av inaktuella planer kräver att projektet är ett git-repo.
- Skillen har `disable-model-invocation: true`. Claude startar den aldrig på
  eget initiativ, bara du via `/idea`.
- Dokumenten skrivs på svenska. Ändra raden om språk i `SKILL.md` om du vill
  ha ett annat språk.
