/**
 * =========================================================================
 * KONFIGURATION
 * =========================================================================
 */

// 1. Dein Govee API Key
const GOVEE_API_KEY = "2ed7d4e7-f0c7-4cc8-aea0-23c42061d0b9";

// 2. Deine beiden Wolkendecken (Govee API Device-ID + Modell)
//    WICHTIG: Das ist NICHT die kurze MAC aus der Govee-App, sondern die längere ID aus der Govee API!
const DEVICES = [
    { mac: "AA:76:D2:C7:C5:46:5A:26", model: "H6159" }, // Wolkendecke 1
    { mac: "BF:AD:D1:C7:C0:C6:11:68", model: "H6159" }  // Wolkendecke 2
];

// 3. WICHTIG: Trage hier die URL deines Cloudflare Workers ein!
//    (Siehe README.md für die Anleitung)
//    Beispiel: "https://govee-proxy.dein-name.workers.dev"
const WORKER_URL = "https://billowing-mode-253d.kaufmannemilian275.workers.dev";

/**
 * =========================================================================
 * LOGIK (Ab hier nichts mehr ändern, es sei denn du weißt was du tust)
 * =========================================================================
 */

// Die API-URL zeigt auf deinen eigenen Cloudflare Worker
const API_URL = WORKER_URL + "/v1/devices/control";

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
        await alarmSound.play();
    } catch (e) {
        console.error("Audio Playback Error:", e);
        // Kein Fehler anzeigen – vielleicht gibt es einfach keine alarm.mp3
    }

    // 2. Govee: Rot schalten
    try {
        await sendGoveeCommand("color", { r: 255, g: 0, b: 0 });
        showStatus("🚨 Alarm aktiv! LEDs auf Rot!", "success");
    } catch (error) {
        console.error("Govee API Fehler:", error);
        showStatus("⚠️ Fehler: " + error.message, "error");
    }
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

    // 2. Govee: Zurück auf Weiß (volle Helligkeit)
    try {
        await sendGoveeCommand("brightness", 100);          // Helligkeit zurück auf 100%
        await sendGoveeCommand("color", { r: 255, g: 255, b: 255 }); // Weiß
        showStatus("Alarm gestoppt. LEDs wieder weiß! ✅", "");
    } catch (error) {
        console.error("Govee API Fehler:", error);
        showStatus("⚠️ Fehler beim Stoppen: " + error.message, "error");
    }
}

/**
 * Universelle Funktion: Sendet einen Befehl an ALLE konfigurierten Govee-Geräte
 * @param {string} cmdName - z.B. "turn", "color", "brightness"
 * @param {*} cmdValue - z.B. "on", "off", { r: 255, g: 0, b: 0 }
 */
async function sendGoveeCommand(cmdName, cmdValue) {
    if (WORKER_URL === "DEINE_WORKER_URL_HIER") {
        throw new Error("Worker-URL nicht konfiguriert! Siehe README.md");
    }

    const results = await Promise.allSettled(
        DEVICES.map(device => {
            const payload = {
                device: device.mac,
                model: device.model,
                cmd: {
                    name: cmdName,
                    value: cmdValue
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
            .then(async res => {
                const data = await res.json();
                console.log(`✅ ${device.mac} (${cmdName}):`, data);
                if (data.code !== 200 && data.message) {
                    throw new Error(`${device.mac}: ${data.message}`);
                }
                return data;
            });
        })
    );

    // Fehler sammeln und werfen, wenn alle fehlgeschlagen sind
    const errors = results.filter(r => r.status === 'rejected');
    if (errors.length === DEVICES.length) {
        throw new Error(errors[0].reason?.message || "Alle Geräte haben nicht geantwortet");
    }
}

function showStatus(message, type) {
    statusBox.innerText = message;
    statusBox.className = `status-box ${type}`;
}
