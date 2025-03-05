# Voetbal Toernooi Tool met Individuele Winnaar

Een webgebaseerde tool voor het organiseren van voetbaltoernooien waarbij individuele spelers punten verzamelen in plaats van teams. Spelers worden elke ronde opnieuw ingedeeld in verschillende teams.

## Kenmerken

- **Volledig Client-side**: Geen server of database nodig, alles draait in de browser
- **Spelersbeheer**: Voeg individuele spelers toe of importeer uit een tekstbestand
- **Categorieën**: Ondersteunt verschillende leeftijdscategorieën (O11, O12)
- **Automatisch schema**: Genereert automatisch een optimaal wedstrijdschema
- **Dynamische teams**: Spelers worden elke ronde willekeurig in nieuwe teams ingedeeld
- **Puntentelling**: Individuele punten voor winst, gelijkspel en gescoorde doelpunten
- **Veldindeling**: Duidelijke weergave van teams en spelers per veld
- **Standen**: Individuele ranglijsten per categorie en algemeen
- **Export**: Exporteer schema's naar CSV-formaat
- **Print-vriendelijk**: Printen van schema's en standen

## Gebruiksaanwijzing

### 1. Spelers Toevoegen

- **Handmatig**: Voer naam in, selecteer categorie en klik op "Toevoegen"
- **Importeren**: Upload een .txt bestand met één speler per regel
  - Formaat: "Naam Speler" of "Naam Speler,O11"

### 2. Toernooi Instellingen

- **Teamgrootte**: 3v3 of 4v4
- **Velden**: Aantal beschikbare velden
- **Tijdsduur**: Wedstrijdduur en totale toernooiduur
- **Puntensysteem**: Aanpasbare punten voor winst, gelijkspel en doelpunten

### 3. Schema Genereren

- Klik op "Genereer Schema" nadat alle spelers zijn toegevoegd
- Bekijk wedstrijden per ronde
- Exporteer naar CSV indien gewenst

### 4. Veldindeling Bekijken

- Selecteer de ronde om de veldindeling te zien
- Bekijk welke spelers in welk team spelen
- Zie welke spelers een ronde rust hebben

### 5. Wedstrijdresultaten Invoeren

- Selecteer de ronde
- Klik op "Invoeren" bij een wedstrijd
- Vul de doelpunten in voor beide teams

### 6. Standen Bekijken

- Bekijk de individuele ranglijst
- Filter op categorie (O11, O12)
- Zie wie de top 3 spelers zijn
- Print de resultaten indien gewenst

## Toernooi Instructies

### Veld Opzet
- Lengte: 40 meter
- Breedte: 20 meter
- Minimaal 2 keer uitzetten

### Spelregels
- 4-tegen-4 op 1 veld
- Teams spelen in een 1-2-1-formatie
- Scoren op de kleine doelen
- Winst is 10 punten plus gescoorde doelpunten
- Gelijkspel is 5 punten plus gescoorde doelpunten
- Verlies is 0 punten plus gescoorde doelpunten

### Verloop
1. Elke speler krijgt een letter die correspondeert met een doel
2. Als de speler zijn letter hoort gaat hij naar het bijbehorende doel
3. Als iedereen bij zijn doeltje staat, kunnen ze zien bij wie ze zijn ingedeeld
4. Er wordt 8 minuten 4-tegen-4 gespeeld
5. Na de wedstrijd legt iedereen zijn hesjes bij het doeltje en komt naar het midden
6. De uitslag wordt doorgegeven en ingevoerd
7. Hierna wordt iedereen weer opnieuw ingedeeld door middel van nieuwe letters
8. Op basis van de behaalde punten ontstaat er een top 3 van spelers die een prijs winnen

## Technische Informatie

Deze applicatie is gebouwd met:
- HTML5
- CSS3 (met Bootstrap 5)
- JavaScript (vanilla)

Alle gegevens worden opgeslagen in de lokale opslag van de browser, dus je verliest geen gegevens als je de pagina vernieuwt.

## Tips

- Combineer je training met een ander team om zo tot 24 of 32 spelers te komen voor een optimaal toernooi
- Voor de beste ervaring, gebruik een moderne browser zoals Chrome, Firefox, of Edge
- Zorg dat je voldoende spelers hebt om aan het minimale aantal voor je gekozen teamgrootte te voldoen
