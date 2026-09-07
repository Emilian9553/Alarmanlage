# 🚨 Web-Alarmanlage für Govee LED-Strips

Diese Web-App ist eine simple Alarmanlage, optimiert für Handys. Mit einem einzigen Knopfdruck wird ein Alarmsound über dein Handy abgespielt und deine Govee LED-Strips ("Wolkendecke") werden rot geschaltet.

## 🚀 Setup-Anleitung für GitHub Pages

### 1. Govee API-Key besorgen
Da Govee diese Funktion in der neuesten App-Version (ab 7.6) verschoben hat, holst du dir den API-Key jetzt ganz einfach über deren neue Entwickler-Webseite:
1. Gehe auf die offizielle Govee Developer Seite: **[developer.govee.com](https://developer.govee.com/)**
2. Logge dich dort mit denselben Account-Daten ein, die du auch in der Govee Home App nutzt.
3. Im Dashboard bzw. in den Profil-Einstellungen auf der Webseite kannst du nun einen **API-Key generieren/beantragen**.
4. Kopiere dir diese lange Zeichenkette (den API-Key) heraus.

### 2. MAC-Adresse und Modell-ID deiner LED-Strips herausfinden
Damit das Skript weiß, *welche* Geräte es steuern soll, brauchen wir die MAC-Adresse (z.B. `11:22:33:44:55:66:77:88`) und das Modell (z.B. `H619A`).

**Der einfachste Weg:**
Öffne die Govee Home App, wähle deinen LED Strip aus, gehe oben rechts auf das Zahnrad (Geräteeinstellungen) und tippe auf **Geräteinformationen**. Dort steht die **MAC-Adresse**. Das Modell (z.B. H619Z) steht oft direkt unter dem Namen oder auf der Verpackung.

**Alternativ über ein Tool (für Profis):**
Du kannst deinen neuen API-Key nutzen, um alle deine Geräte abzufragen. Öffne ein Terminal (Linux/Mac) oder die Windows PowerShell und tippe:
```bash
curl -H "Govee-API-Key: DEIN_API_KEY_AUS_DER_EMAIL" https://developer-api.govee.com/v1/devices
```
In der Ausgabe findest du eine Liste deiner Geräte mit deren `device` (MAC-Adresse) und `model`.

### 3. Code anpassen
Öffne die Datei `script.js` in einem Texteditor und trage deine Daten ein:
```javascript
const GOVEE_API_KEY = "DEIN_API_KEY_HIER_EINTRAGEN";

const DEVICES = [
    { mac: "DEINE_MAC_ADRESSE_1", model: "DEIN_MODELL_1" }, // Wolkendecke 1
    { mac: "DEINE_MAC_ADRESSE_2", model: "DEIN_MODELL_2" }  // Wolkendecke 2
];
```

### 4. Audio-Datei hinzufügen
Lege eine beliebige Audio-Datei in diesen Ordner und nenne sie exakt **`alarm.mp3`**. Diese Datei wird abgespielt, wenn du den Knopf drückst.

### 5. Bei GitHub Pages hochladen
1. Erstelle einen kostenlosen Account bei [GitHub](https://github.com/).
2. Klicke oben rechts auf **"+"** und erstelle ein **New Repository** (z.B. "mein-alarm").
3. Lade alle 4 Dateien (`index.html`, `style.css`, `script.js`, `alarm.mp3`) in dieses Repository hoch.
4. Gehe in deinem Repository auf **Settings** (Einstellungen).
5. Klicke links im Menü auf **Pages**.
6. Wähle unter "Source" den Branch **`main`** aus und klicke auf Save.
7. Nach 1-2 Minuten erscheint dort ein Link (z.B. `https://deinname.github.io/mein-alarm`).
8. Öffne diesen Link auf deinem Handy, speichere ihn als Lesezeichen auf dem Homescreen – fertig!

## 💡 Technische Hinweise
- **CORS-Problematik:** Da Browser aus Sicherheitsgründen oft direkte `fetch()`-Requests von einer Webseite (GitHub Pages) zu einer externen API (Govee) blockieren, nutzt dieses Skript den kostenlosen und sicheren Proxy `corsproxy.io`. Er leitet die Anfrage ohne CORS-Blockade weiter.
- **Rate-Limits (Warum es nicht im Code blinkt):** Die Govee API erlaubt maximal **10 Anfragen pro Minute pro Account**. Ein schnelles Blinken (Ein/Aus/Ein/Aus) würde dieses Limit in wenigen Sekunden sprengen und deine API-Sperrung riskieren. Daher schaltet das Skript die LEDs einmalig auf Rot und simuliert das Blinken optisch auf dem Handydisplay. Wenn du den Alarm abschaltest, werden die LEDs über einen weiteren Befehl deaktiviert.
- **Audio Autoplay:** Moderne Handys blockieren Musik, die von selbst losgeht. Da dieser Alarm jedoch durch einen expliziten Knopfdruck des Nutzers (`onclick`) gestartet wird, erlaubt das Handy das Abspielen über deine Bluetooth-Bassbox problemlos.
