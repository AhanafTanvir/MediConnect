/**
 * Clinical Audio & Speech Announcement Engine
 * Provides dual-tone chime and natural speech synthesis for hospital queue calling
 */

export function playChime() {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Tone 1: High bell chime (E5 - 659.25Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.6);

    // Tone 2: Harmonious resolving bell (A5 - 880Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, now + 0.22);
    gain2.gain.setValueAtTime(0.35, now + 0.22);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.1);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.22);
    osc2.stop(now + 1.1);
  } catch (err) {
    console.warn("[MediConnect Chime]: AudioContext not permitted or supported", err);
  }
}

export function formatSerialForSpeech(serialNumber: string): string {
  if (!serialNumber) return "";
  // Convert "A-023" to "A 23", "B-005" to "B 5", "A-102" to "A 102"
  const match = serialNumber.match(/^([A-Za-z]+)-0*(\d+)$/);
  if (match) {
    return `${match[1].split("").join(" ")} ${match[2]}`;
  }
  return serialNumber.replace(/-/g, " ");
}

export function announcePatient(
  serialNumber: string,
  patientName: string,
  room = "Room 408",
  callbacks?: {
    onStart?: () => void;
    onEnd?: () => void;
  }
) {
  if (typeof window === "undefined") return;

  // 1. Play auditory chime
  playChime();

  // 2. Play speech synthesis
  if (!("speechSynthesis" in window)) {
    return;
  }

  // Brief delay to let initial chime ring cleanly
  setTimeout(() => {
    try {
      window.speechSynthesis.cancel();

      const spokenSerial = formatSerialForSpeech(serialNumber);
      const text = `Attention please. Next patient: Serial number ${spokenSerial}, ${patientName}. Please proceed to ${room}.`;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.92; // Clear clinical cadence
      utterance.pitch = 1.02;
      utterance.volume = 1.0;

      // Select natural English voice
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) =>
          (v.name.includes("Google") ||
            v.name.includes("Natural") ||
            v.name.includes("Samantha") ||
            v.name.includes("Jenny") ||
            v.name.includes("Zira")) &&
          v.lang.startsWith("en")
      ) || voices.find((v) => v.lang.startsWith("en"));

      if (preferred) {
        utterance.voice = preferred;
      }

      if (callbacks?.onStart) {
        utterance.onstart = callbacks.onStart;
      }
      if (callbacks?.onEnd) {
        utterance.onend = callbacks.onEnd;
        utterance.onerror = callbacks.onEnd;
      }

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("[MediConnect Speech Synthesis]:", err);
      callbacks?.onEnd?.();
    }
  }, 500);
}

export function stopAnnouncement() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

