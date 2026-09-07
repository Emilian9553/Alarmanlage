/**
 * =========================================================================
 * KONFIGURATION
 * =========================================================================
 */

// 1. Trage hier deinen Govee API Key ein (wird in der App über Profil -> Über uns beantragt)
const GOVEE_API_KEY = "2ed7d4e7-f0c7-4cc8-aea0-23c42061d0b9";

// 2. Trage hier die MAC-Adressen und das Modell deiner beiden Wolkendecken ein.
// (Siehe README.md, wie du diese herausfindest)
const DEVICES = [
    { mac: "D0:C9:07:9D:36:D8", model: "H6159" },
    { mac: "D0:C9:07:9D:C3:4A", model: "H6159" }
];

/**
 * =========================================================================
 * LOGIK (Ab hier nichts mehr ändern, es sei denn du weißt was du tust)
 * =========================================================================
 */

// Wir nutzen corsproxy.org, um den CORS-Blocker zu umgehen, da corsproxy.io nicht mehr kostenlos ist.
const CORS_PROXY = "https://corsproxy.org/?";
const GOVEE_URL = "https://developer-api.govee.com/v1/devices/control";
const API_URL = CORS_PROXY + encodeURIComponent(GOVEE_URL);

// DOM Elemente
const alarmBtn = document.getElementById('alarmBtn');
const btnText = document.getElementById('btnText');
const btnSubText = document.getElementById('btnSubText');
const statusBox = document.getElementById('statusBox');
const alarmSound = document.getElementById('alarmSound');

let isAlarmActive = false;

// Event Listener für den riesigen Button
alarmBtn.addEventListener('click', async () => {
    if (isAlarmActive) {
        await stopAlarm();
    } else {
        await startAlarm();
    }
});

async function startAlarm() {
    isAlarmActive = true;

    // UI Update
    document.body.classList.add('alarm-active');
    btnText.innerText = "STOP";
    btnSubText.innerText = "Alarm ausschalten";
    statusBox.innerText = "Alarm ausgelöst! Sende Befehle...";
    statusBox.className = "status-box";

    // 1. Audio abspielen (Endlos-Loop)
    try {
        alarmSound.currentTime = 0;
        alarmSound.loop = true;
        // WICHTIG: Moderne Browser blockieren Audio, wenn der User nicht direkt interagiert.
        // Da dies durch einen Button-Click passiert, sollte es auf dem Handy funktionieren.
        await alarmSound.play();
    } catch (e) {
        console.error("Audio Playback Error:", e);
        showStatus("Konnte Audio nicht abspielen. (Mute-Switch an?)", "error");
    }

    // 2. Govee API Aufrufe (Rot schalten)
    // Govee API Limit: max. 10 Anfragen pro Minute! 
    // Wir senden pro Gerät 1 Anfrage (Farbe ändern, was das Gerät normalerweise auch einschaltet)
    await triggerLEDs(255, 0, 0); // Rot
    showStatus("Alarm aktiv! LEDs auf Rot geschaltet.", "success");
}

async function stopAlarm() {
    isAlarmActive = false;

    // UI Update
    document.body.classList.remove('alarm-active');
    btnText.innerText = "ALARM";
    btnSubText.innerText = "Drücken um auszulösen";
    statusBox.innerText = "Stoppe Alarm...";
    statusBox.className = "status-box";

    // 1. Audio stoppen
    alarmSound.pause();
    alarmSound.currentTime = 0;

    // 2. Govee API Aufrufe (Ausschalten oder auf normales Licht)
    await turnOffLEDs();
    showStatus("Alarm gestoppt. LEDs deaktiviert.", "");
}

/**
 * Sendet den Farb-Befehl an die Govee API für alle konfigurierten Geräte
 */
async function triggerLEDs(r, g, b) {
    if (GOVEE_API_KEY === "DEIN_API_KEY_HIER_EINTRAGEN") {
        showStatus("FEHLER: API Key nicht konfiguriert!", "error");
        return;
    }

    const promises = DEVICES.map(device => {
        if (!device.mac || device.mac === "DEINE_MAC_ADRESSE_1") return Promise.resolve();

        const payload = {
            device: device.mac,
            model: device.model,
            cmd: {
                name: "color",
                value: { r, g, b }
            }
        };

        return fetch(API_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Govee-API-Key': GOVEE_API_KEY
            },
            body: JSON.stringify(payload)
        })
            .then(res => res.json())
            .then(data => {
                console.log(`Antwort von ${device.model}:`, data);
                if (data.code !== 200 && data.message) {
                    throw new Error(data.message);
                }
            });
    });

    try {
        await Promise.all(promises);
    } catch (error) {
        console.error("API Fehler:", error);
        showStatus("Fehler bei der Govee API Kommunikation.", "error");
    }
}

/**
 * Schaltet die LEDs wieder aus
 */
async function turnOffLEDs() {
    if (GOVEE_API_KEY === "DEIN_API_KEY_HIER_EINTRAGEN") return;

    const promises = DEVICES.map(device => {
        if (!device.mac || device.mac === "DEINE_MAC_ADRESSE_1") return Promise.resolve();

        const payload = {
            device: device.mac,
            model: device.model,
            cmd: {
                name: "turn",
                value: "off"
            }
        };

        return fetch(API_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Govee-API-Key': GOVEE_API_KEY
            },
            body: JSON.stringify(payload)
        });
    });

    try {
        await Promise.all(promises);
    } catch (error) {
        console.error("API Fehler beim Ausschalten:", error);
    }
}

function showStatus(message, type) {
    statusBox.innerText = message;
    statusBox.className = `status-box ${type}`;
}
