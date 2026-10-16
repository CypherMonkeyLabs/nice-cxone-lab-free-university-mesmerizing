import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const tmp = "/tmp/cxone-audio";
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });
mkdirSync(join(root, "audio/scripts"), { recursive: true });
mkdirSync(join(root, "campus/audio/scripts"), { recursive: true });
mkdirSync(join(root, "campus/audio"), { recursive: true });

const clips = [
  {
    id: "use-the-floor",
    title: "Use Contact Path",
    lines: [
      ["a", "Welcome to Contact Path. This is a free study lab for NICE CXone, not a vendor brochure."],
      ["b", "The picture in front of you is the contact path. Point of contact, script, skill, agent, workforce, quality, and the API."],
      ["a", "Use the study menu. Diagrams, Flows, and Charts are the big pictures. Cheat Codes and Downloads are the sheets you can keep offline."],
      ["b", "Play is where you practise. Ecosystem is the map of neighbouring labs. Careers is a study path, not a job offer."],
      ["a", "Open a track. The ring on the card is progress saved in this browser. Lesson text stays in English, next to its citation."],
      ["b", "The picture stays a drawing of that path. The facts do not change."],
    ],
  },
  {
    id: "share-the-floor",
    title: "Share Contact Path",
    lines: [
      ["a", "If Contact Path helped, rate the repository from the top bar. Comments belong there too."],
      ["b", "There is no email on this page. To reach the studio, use the contact form on the CypherMonkey Labs site."],
      ["a", "Share the lab with the GitHub Pages link or the repository link. The other labs are listed in the footer."],
      ["b", "This project is independent. It is not affiliated with NiCE. Trademarks stay with their owners."],
    ],
  },
];

function run(cmd, args) {
  const result = spawnSync(cmd, args, { stdio: "inherit" });
  if (result.status !== 0) throw new Error(`${cmd} failed`);
}

function scriptMd(clip) {
  const body = clip.lines.map(([who, text]) => `- **${who === "a" ? "Architect A" : "Architect B"}:** ${text}`).join("\n");
  return `# ${clip.title}\n\nTwo-voice architect briefing for the NICE CXone lab. Generated with espeak-ng and a quiet ffmpeg sine pad. Lesson bodies are not narrated.\n\n${body}\n\nRate and comment on the repository. Share via https://cyphermonkeylabs.com. No email is published on the lab page.\n`;
}

for (const clip of clips) {
  const md = scriptMd(clip);
  writeFileSync(join(root, "audio/scripts", `${clip.id}.md`), md);
  writeFileSync(join(root, "campus/audio/scripts", `${clip.id}.md`), md);
  const list = [];
  clip.lines.forEach(([who, text], index) => {
    const voice = who === "a" ? "en-us+m3" : "en-us+f3";
    const wav = join(tmp, `${clip.id}-${index}.wav`);
    run("espeak-ng", ["-v", voice, "-s", who === "a" ? "148" : "154", "-w", wav, text]);
    list.push(`file '${wav}'`);
    if (index < clip.lines.length - 1) {
      const gap = join(tmp, `${clip.id}-gap-${index}.wav`);
      run("ffmpeg", ["-y", "-f", "lavfi", "-i", "anullsrc=r=22050:cl=mono", "-t", "0.45", gap]);
      list.push(`file '${gap}'`);
    }
  });
  const listPath = join(tmp, `${clip.id}.txt`);
  writeFileSync(listPath, list.join("\n"));
  const voiceWav = join(tmp, `${clip.id}-voice.wav`);
  run("ffmpeg", ["-y", "-f", "concat", "-safe", "0", "-i", listPath, "-c", "copy", voiceWav]);
  const probe = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", voiceWav], { encoding: "utf8" });
  const duration = Math.max(1, Number(probe.stdout.trim()) || 1);
  const pad = join(tmp, `${clip.id}-pad.wav`);
  run("ffmpeg", ["-y", "-f", "lavfi", "-i", `sine=frequency=92:sample_rate=22050:duration=${duration.toFixed(2)}`, "-af", "volume=0.035,lowpass=f=180", pad]);
  const out = join(root, "campus/audio", `${clip.id}.mp3`);
  run("ffmpeg", [
    "-y", "-i", voiceWav, "-i", pad,
    "-filter_complex", "[0:a][1:a]amix=inputs=2:duration=first:dropout_transition=0,volume=1.6",
    "-codec:a", "libmp3lame", "-q:a", "6", out,
  ]);
  console.log(clip.id, duration.toFixed(1), "s");
}
