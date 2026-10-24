# Catalog Digital - Frontend

Catalog scolar online cu trei roluri: director, profesor si elev. Acest repo
contine interfata: Next.js 16 (App Router) + React 19 + Tailwind 4.

API-ul (NestJS + MariaDB) este in [catalog-backend](https://github.com/cosminzisu18/catalog-backend) si trebuie
pornit inainte.

Cerinte: Node.js 20.9+.

## Pornire

```bash
cp .env.example .env.local    # NEXT_PUBLIC_API_URL, implicit http://localhost:3001/api
npm install
npm run dev                   # http://localhost:3000
```

Nu exista conturi demo: scoala si directorul se creeaza din `/register`,
iar profesorii si elevii din panoul directorului (vezi **Ghid pas cu pas**).

### Build de productie

```bash
npm run build && npm start
```

## Ghid pas cu pas

Pasii de mai jos pornesc de la o baza goala si trec prin tot fluxul
aplicatiei. Adresele sunt pentru `npm run dev` (http://localhost:3000), cu
API-ul din [catalog-backend](https://github.com/cosminzisu18/catalog-backend) pornit. Regulile complete (medii,
validari, securitate) sunt descrise acolo.

### Pasul 1 - Creare scoala (director)

1. Deschide http://localhost:3000/register.
2. Completeaza:
   - **Nume scoala**, de exemplu `Liceul Mircea Eliade`
   - **Slug (URL login)**, de exemplu `mircea-eliade` (se completeaza singur
     din nume; e adresa de login pentru profesori si elevi:
     `/login/mircea-eliade`)
   - **Adresa** si **Telefon** (optionale)
   - **Email director** si **Parola** (minim 8 caractere, cu litera mare,
     litera mica, cifra si caracter special)
3. Apasa **Creeaza scoala**.
4. Apare fereastra **Completeaza profilul**: scrie prenumele si numele
   directorului si salveaza. Panoul nu poate fi folosit fara acest pas.

Numele (director, profesori, elevi) pot contine doar litere (si diacritice),
spatii, cratima si apostrof, intre 2 si 80 de caractere. Exemple valide:
`Ana-Maria`, `Popescu Ionescu`. Exemple refuzate: `Ion3`, `Ana_Maria`.

### Pasul 2 - Materii

1. Meniu **Materii** -> butonul **Creeaza materie**.
2. Scrie numele (de exemplu `Matematica`) si salveaza.
3. Repeta pentru fiecare materie (`Limba romana`, `Fizica` ...).

### Pasul 3 - Clase

1. Meniu **Clase** -> **Adauga clasa**.
2. **Nume clasa** (de exemplu `9A`), **Descriere** optionala, apoi salveaza.

Numele clasei e unic in scoala. O clasa cu elevi sau cu ore in orar nu poate
fi stearsa.

### Pasul 4 - Profesori

1. Meniu **Profesori** -> **Adauga profesor**.
2. Completeaza email, prenume, nume si o **parola temporara** (butonul de
   generare creeaza una puternica). Salveaza.
3. Pe randul profesorului apasa iconita **Materii** si bifeaza materiile pe
   care le poate preda (de exemplu `Matematica`). Salveaza.
4. Trimite profesorului adresa `/login/<slug-scoala>`, emailul si parola
   temporara. La primul login va fi obligat sa isi schimbe parola.

### Pasul 5 - Elevi

1. Meniu **Elevi** -> **Adauga elev**.
2. Completeaza email, prenume, nume, **Clasa**, optional **Data nasterii**
   si o parola temporara. Salveaza.
3. Data nasterii trebuie sa fie o data reala, nu in viitor, iar varsta
   elevului intre 5 si 25 de ani. Varsta apare in lista de elevi si in fisa
   elevului.
4. Pentru a muta mai multi elevi intr-o clasa: **Clase** -> iconita
   **Muta elevi** pe clasa dorita.

### Pasul 6 - Orar

1. Meniu **Orar** -> alege clasa din lista **Clasa**.
2. Click pe un spatiu liber din calendar (zi + ora) -> se deschide fereastra
   pentru ora noua.
3. Alege **Materie**, verifica **Inceput** / **Sfarsit**, optional **Sala**.
   Daca mai multi profesori predau materia, alege si **Profesor**. Salveaza.

Nici clasa, nici profesorul nu pot avea doua ore care se suprapun. Orele se
pun doar de luni pana vineri, ca in calendar.

### Pasul 7 - Primul login al profesorului

1. Profesorul deschide `/login/<slug-scoala>` si intra cu emailul si parola
   temporara.
2. Apare fereastra de schimbare a parolei; dupa schimbare are acces la
   panou.

### Pasul 8 - Pune note (profesor)

O nota se poate pune doar daca profesorul preda materia, are ora cu clasa
elevului in orar si **este acum in timpul acelei ore** (ora Romaniei).
Pentru o proba rapida, directorul adauga in orar o ora pentru ziua si ora
curenta.

1. Profesorul: meniu **Note** -> **Adauga nota** (sau din pagina de start).
2. Alege **Materie** - fereastra arata daca esti la ora acum.
3. Alege **Elev**, scrie **Nota**, lasa **Tip nota** pe `Nota curenta`,
   alege **Data notei** si apasa **Salveaza nota**.

Reguli verificate de server (si de baza de date):

- nota este un numar intre 1 si 10, cu cel mult doua zecimale (`9`, `9.5`,
  `9.25`); `10.5`, `0`, `9.123` sau textul `"9"` sunt refuzate
- data notei nu poate fi in viitor
- pe un elev, la o materie, intr-o zi, se pune **fie o nota, fie o absenta**:
  niciodata doua note si niciodata o nota si o absenta (vezi pasul 10)
- o nota salvata nu se mai poate modifica direct: profesorul apasa
  **Cere editare** in lista de note, iar directorul aproba sau respinge
  din **Editari note** -> **Decide**

### Pasul 9 - Pune nota la teza (profesor)

1. **Note** -> **Adauga nota**.
2. Alege materia si elevul, scrie nota, iar la **Tip nota** alege
   `Teza (o singura data pe an)`.
3. **Salveaza nota**.

Un elev poate avea o singura teza pe materie intr-un an scolar
(1 septembrie - 31 august). In liste, teza apare ca `7 (teza)`.

### Pasul 10 - Absente

Profesorul:

1. Meniu **Absente** -> **Pune absenta** (sau din pagina de start).
2. Alege **Materie** (se verifica din nou ca esti la ora) si **Elev**, apoi
   **Salveaza absenta**. Data este mereu ziua de azi.

Reguli:

- aceleasi conditii ca la note: profesorul preda materia, are ora cu clasa
  elevului si este acum in timpul orei
- elevul cu absenta nu mai poate primi nota la acea materie in ziua
  respectiva, iar un elev care a primit nota nu mai poate primi absenta
- o singura absenta pe elev + materie + zi
- profesorul nu poate motiva si nu poate sterge absente

Directorul:

1. Meniu **Absente** - toate absentele scolii, cu totaluri (total, motivate,
   nemotivate) si filtre dupa status, clasa si cautare.
2. Pe o absenta nemotivata apasa **Motiveaza**, scrie optional motivul (de
   exemplu `adeverinta medicala`) si confirma. O absenta motivata nu mai poate
   fi motivata a doua oara.
3. Aceeasi lista apare si in fisa elevului (**Elevi** -> click pe elev).

Elevul vede in meniul **Absente** istoricul complet si totalurile, iar pe
pagina de start numarul de absente nemotivate.

### Pasul 11 - Scaderea notei la purtare

1. Profesorul: meniu **Purtare** -> **Cerere noua** (sau **Cerere purtare**
   din pagina de start).
2. Alege elevul (doar elevi din clasele la care are ore), scrie **Nota
   propusa** (mai mica decat purtarea actuala) si **Motiv**. Trimite.
3. Directorul: meniu **Purtare** -> **Decide** pe cerere -> scrie un motiv
   -> **Aproba** sau **Respinge**.
4. La aprobare, nota la purtare a elevului se schimba imediat si intra in
   media generala. Elevul vede istoricul in pagina lui de start.

### Pasul 12 - Medii si statistici

- **Elev**: pagina de start arata media generala, media clasei si locul in
  clasa; **Materiile mele** arata pentru fiecare materie numarul de note,
  media notelor, teza si media finala.
- **Director**: meniu **Statistici** - media fiecarei clase, cel mai bun elev
  din fiecare clasa, top 10 elevi din scoala si, pentru clasa aleasa,
  clasamentul elevilor si media clasei la fiecare materie. In fisa unui elev
  (**Elevi** -> click pe elev) apar varsta, media generala, media clasei,
  locul in clasa si mediile pe materii.

Toate mediile se calculeaza pe anul scolar curent (de la 1 septembrie).

### Pasul 13 - Mai multi directori (optional)

**Setari** -> **Adauga director**. Doar directorul **activ** poate modifica
date; ceilalti pot doar sa vada (si sa isi schimbe parola si numele).
Activarea altui director se face tot din **Setari** -> **Activeaza**.

### Pasul 14 - Rapoarte

Orice actiune importanta (nota, teza, absenta, motivare, cerere de editare,
decizie, purtare, ore predate) intra automat in jurnalul de activitate, care nu se poate
modifica.

- **Director**: meniu **Rapoarte** - toata scoala; se poate cauta in
  descriere si filtra dupa **Profesor**.
- **Profesor**: meniu **Rapoarte** - doar activitatea lui.

Lista se incarca pe bucati (**Incarca mai multe**), iar numarul pe pagina se
alege din **Pe pagina**.

## Structura

```
app/           pagini (App Router): login, register, director/, profesor/, elev/
components/
  ui/          componente comune: tabel paginat, formulare, modal, select
  dashboard/   providerii fiecarui rol (date comune, formulare deschise)
  auth/        login, sesiune, setari cont
  timetable/   calendarul saptamanal si formularul de ora
  absences/    lista de absente (comuna celor trei roluri)
hooks/         usePaginatedList, useLoad, useAction, useCursorList
lib/           api(), formatari, calcule pentru afisare
```

- Paginile doar afiseaza date; providerii din `components/dashboard/`
  incarca datele comune si deschid formularele.
- Fiecare formular (`director/`, `teacher/`) isi tine propria stare si
  propriul request.
- Listele folosesc `usePaginatedList` + `PagedTable` (cautare, sortare,
  filtre si paginare facute de API), iar datele care se reincarca la o
  schimbare folosesc `useLoad`.
- Layout responsive: pe telefon meniul devine buton, iar tabelele devin
  carduri.

## Sesiune

Sesiunea traieste doar in cookie-uri `httpOnly` puse de API; JavaScript-ul din
pagina nu vede niciun token si nu se salveaza nimic in `localStorage`.
Detaliile (rotirea refresh tokenului, CSRF, durate) sunt in README-ul din
[catalog-backend](https://github.com/cosminzisu18/catalog-backend).

- Toate apelurile HTTP trec prin `lib/api.ts`, cu `credentials: 'include'`.
- `api()` face refresh automat la un 401 (o singura cerere de refresh chiar
  daca mai multe requesturi expira simultan) si reincearca o data.
- Doar un 401 inseamna "nu mai esti logat". O limita de requesturi (429) sau o
  eroare de server nu delogheaza userul: la incarcarea paginii, `/auth/me` se
  reincearca (1s, 2s, 4s ... maxim 10s intre incercari) pana raspunde.
- Pana la schimbarea parolei temporare (si completarea profilului, la
  director) panoul nu se incarca deloc; apare doar fereastra obligatorie.

## Teste si lint

```bash
npm test          # 52 teste (Jest): functii + componente React
npm run lint
```

Teste: `api()` (refresh la 401, un singur refresh pentru mai multe cereri,
sesiune expirata, fara delogare la 429), sesiunea la incarcarea paginii
(reincercare la 429), formatarea notelor si a mediilor, parole, orar, query
string-uri, plus componente React testate cu React Testing Library:
formularul de profesor (parola generata, adaugare, editare, eroare de la
server), decizia directorului (motiv minim, aproba / respinge), formularul de
nota (blocat in afara orei, teza cu zecimale) si lista de absente (totaluri,
motivare doar pentru absentele nemotivate, filtru de status).

## Ce se mai poate implementa

- **Teste e2e pentru interfata** (Playwright) pe fluxurile principale:
  inregistrare scoala, nota, teza, cereri, statistici.
- **Teste pentru mai multe componente React** (React Testing Library), in
  special formularele din `components/dashboard/director` si `teacher`.
- **Accesibilitate**: verificare cu un cititor de ecran si navigare doar din
  tastatura in formulare si in calendar.
- **Documente**: incarcarea si descarcarea documentelor elevilor, ale
  profesorilor si ale scolii, direct din browser catre S3, prin URL-uri
  presemnate generate de API.
- **Sentry** pentru erorile neprinse din browser.

Lista completa (Docker, CI/CD, Redis, emailuri, S3) este in README-ul din
[catalog-backend](https://github.com/cosminzisu18/catalog-backend).
