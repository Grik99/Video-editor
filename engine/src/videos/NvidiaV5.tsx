// NvidiaV5 — "One man built a $3.7T chip empire, and lost it in five days." 9:16 720x1280 30fps.
// 9 distinct scenes following NvidiaV4 patterns & style/extra.tsx props.
import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, Easing, Audio, staticFile } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { Box, Cyl, Ball, CanvasPlane, Surface, INK } from "../style/toon";
import { Look } from "../style/puppet";
import { Person, Lights, Desk, Clock, Grade, seg, lerp, clamp, V3 } from "../style/kit";
import { Floor, WallDoor, SideWall, Glow, Shaft, Plant, Shelf, Frame, WindowCity, Lamp, Monitor, Chair, Cooler, Cabinet, Rug, Dust } from "../style/props";
import { Cam, Key, camAt, FaceGroup, hand, Arrow3D, Crown, SpotCone, Curtain, Lectern, Building, StreetLamp, StreetSign, Barrier, PressCam, HangLamp, Stars } from "../style/extra";
import { Captions } from "../Main";

const FPS = 30, LEAD = 6, TAIL = 8, WALK = 3.4;
type Ctx = { t: number; f: number };
type Trans = "ghost" | "zoom" | "flash" | "whip";

const jensen: Look = { skin: "#f1d0b0", body: "#16171f", outfit: "leather", hair: "swept", hairColor: "#c9c9d2", shoe: "#0b0d1a" };
const kress: Look = { skin: "#f7d4b5", body: "#1f8a8a", outfit: "blazer", shirt: "#ffffff", hair: "bob", hairColor: "#5a3420", badge: "#ffc23a", shoe: "#2a1a12" };
const muskLook: Look = { skin: "#fbe3c8", body: "#1b1b2a", outfit: "blazer", shirt: "#111", hair: "short", hairColor: "#3a2a1a", shoe: "#111" };
const trumpLook: Look = { skin: "#f8c8a0", body: "#172353", outfit: "suit", tie: "#e5233a", hair: "swept", hairColor: "#f5c242", shoe: "#111" };
const crowd: Look[] = [
  { skin: "#fbe3c8", body: "#e53e3e", outfit: "hoodie", hair: "short", hairColor: "#222" },
  { skin: "#c98e62", body: "#22a867", outfit: "shirt", hair: "bob", hairColor: "#1a1010" },
  { skin: "#fbe3c8", body: "#f0b429", outfit: "suit", tie: "#1d2f66", hair: "grey" },
  { skin: "#8d5a3a", body: "#7c4dff", outfit: "hoodie", hair: "swept", hairColor: "#111", glasses: true },
  { skin: "#f6d6bd", body: "#2d3142", outfit: "suit", tie: "#ff3b3b", hair: "short", hairColor: "#3b2a1a" },
  { skin: "#e0b48c", body: "#ff7a29", outfit: "shirt", hair: "bob", hairColor: "#5a3420" },
  { skin: "#fbe3c8", body: "#2f8cff", outfit: "blazer", shirt: "#fff", hair: "swept", hairColor: "#c47a2a" },
  { skin: "#a86b45", body: "#ff4fa0", outfit: "hoodie", hair: "short", hairColor: "#111", glasses: true },
];

const Scene: React.FC<{ start: number; end: number; first?: boolean; trans?: Trans; bg: string; children: (c: Ctx) => React.ReactNode }> = ({ start, end, first, trans = "ghost", bg, children }) => {
  const from = Math.round(start * FPS) - (first ? 0 : LEAD), dur = Math.round(end * FPS) - from + TAIL;
  return <Sequence from={from} durationInFrames={dur} layout="none"><Inner from={from} first={first} trans={trans} bg={bg} children={children} /></Sequence>;
};
const Inner: React.FC<{ from: number; first?: boolean; trans: Trans; bg: string; children: (c: Ctx) => React.ReactNode }> = ({ from, first, trans, bg, children }) => {
  const f = useCurrentFrame(), t = (f + from) / FPS;
  const k = first ? 1 : clamp(f / (LEAD + 2)), ke = Easing.out(Easing.cubic)(k);
  const sc = !first && trans === "zoom" ? lerp(1.32, 1, ke) : 1;
  const tx = !first && trans === "whip" ? (1 - ke) * 720 : 0, blur = !first && trans === "whip" ? (1 - ke) * 14 : 0;
  return (
    <AbsoluteFill style={{ opacity: first || trans === "flash" || trans === "whip" ? 1 : k, transform: `translateX(${tx}px) scale(${sc})`, background: bg, filter: `saturate(1.32) contrast(1.07) brightness(1.02)${blur > 0.2 ? ` blur(${blur.toFixed(1)}px)` : ""}` }}>
      <ThreeCanvas width={720} height={1280} camera={{ fov: 60, position: [0, 2, 8], near: 0.1, far: 200 }} gl={{ antialias: true }}>
        <color attach="background" args={[bg]} />{children({ t, f })}
      </ThreeCanvas>
      {!first && trans === "flash" ? <AbsoluteFill style={{ background: "#fff", opacity: 1 - clamp(f / 7) }} /> : null}
    </AbsoluteFill>
  );
};
const yawTo = (cam: V3, p: V3) => Math.atan2(cam[0] - p[0], cam[2] - p[2]);
const toWorld = (p: V3, loc: V3, cam: V3): V3 => { const y = yawTo(cam, p); return [p[0] + loc[0] * Math.cos(y) + loc[2] * Math.sin(y), p[1] + loc[1], p[2] - loc[0] * Math.sin(y) + loc[2] * Math.cos(y)]; };

/* =================== S1 0 – 6.30  "One man built a $3.7T chip empire, and lost it in five days." =================== */
const K1: Key[] = [
  { t: 0, pos: [3.2, 2.2, 10.2], look: [0.0, 3.2, -1.5], fov: 62 },
  { t: 3.4, pos: [1.6, 2.8, 7.6], look: [0.0, 3.8, -2.0], fov: 56 },
  { t: 4.2, pos: [2.2, 3.2, 8.8], look: [0.2, 3.0, -1.8], fov: 60 },
  { t: 6.4, pos: [2.8, 3.6, 9.8], look: [0.3, 2.8, -2.0], fov: 60 },
];
const S1 = ({ t, f }: Ctx) => {
  const crack = t >= 4.2;
  const fall = seg(t, 4.2, 5.1, Easing.in(Easing.cubic));
  const jJump = t > 4.2 && t < 4.65 ? Math.sin(clamp((t - 4.2) / 0.45) * Math.PI) * 0.65 : 0;
  const jx = lerp(2.2, 3.1, seg(t, 4.2, 4.65, Easing.out(Easing.quad)));
  const dayNum = Math.max(0, 5 - Math.floor(seg(t, 4.0, 5.2) * 5.99));
  return (<>
    <Cam t={t} keys={K1} impacts={[[4.2, 0.06]]} />
    <Lights warm="#cdf6ff" />
    <Floor kind="tile" a="#104b57" b="#0d3e48" unit={1.8} w={30} d={30} />
    <WallDoor z={-8} W={30} kind="plain" a="#0a3340" b="#0a3340" base="#061e26" />
    <SideWall x={-11} kind="plain" a="#0f4452" b="#0f4452" /><SideWall x={11} kind="plain" a="#0f4452" b="#0f4452" />
    <WindowCity p={[-7.5, 4.8, -7.9]} s={[3.6, 4.2]} dusk /><WindowCity p={[7.5, 4.8, -7.9]} s={[3.6, 4.2]} dusk />
    {/* Empire LED screen */}
    <Box p={[0, 5.4, -7.7]} s={[10.4, 4.6, 0.25]} color="#08161e" />
    <CanvasPlane p={[0, 5.4, -7.52]} s={[10.0, 4.2]} px={[900, 380]} frame={crack ? "#ff2b3b" : "#2fd46a"} draw={(c, W, H) => {
      c.fillStyle = "#06141c"; c.fillRect(0, 0, W, H);
      c.fillStyle = crack ? "#ff2b3b" : "#2fd46a"; c.font = "900 130px Inter, Arial"; c.textAlign = "center"; c.textBaseline = "middle";
      c.fillText(crack ? "LOST IN 5 DAYS" : "$3.7 TRILLION", W / 2, H * 0.44);
      c.fillStyle = "#fff"; c.font = "800 46px Inter, Arial";
      c.fillText(crack ? `COUNTDOWN: ${dayNum} DAYS` : "AI CHIP EMPIRE", W / 2, H * 0.78);
    }} />
    {/* Towering chip stack monument */}
    {[0, 1, 2, 3, 4].map((i) => {
      const tilt = crack ? fall * (i % 2 ? 0.65 : -0.55) * (0.3 + i * 0.2) : 0;
      const dx = crack ? fall * (i % 2 ? 1.8 : -1.4) * i * 0.35 : 0;
      const dy = crack ? -fall * i * 0.55 : 0;
      return <group key={i} position={[-1.4 + dx, Math.max(0.45, 0.55 + i * 0.95 + dy), -2.2]} rotation={[0, 0.2 * i, tilt]}>
        <Box p={[0, 0, 0]} s={[2.8 - i * 0.22, 0.85, 2.8 - i * 0.22]} color={crack ? "#b83232" : "#2fd46a"} line={3} />
        <Box p={[0, 0, 0]} s={[1.4 - i * 0.1, 0.88, 1.4 - i * 0.1]} color="#172353" line={2} />
      </group>;
    })}
    <Arrow3D p={[-1.4 + (crack ? fall * 1.4 : 0), 6.2 - fall * 3.8, -2.2]} rot={[0, 0.2, crack ? -fall * 1.4 : 0]} L={2.8} color={crack ? "#ff2b3b" : "#ffc23a"} />
    <Glow p={[-1.4, 3.2, -1.6]} r={4.5} color={crack ? "rgba(255,40,60,0.8)" : "rgba(47,212,106,0.7)"} o={0.32} />
    {/* Hall dressing (15+ props) */}
    <Desk p={[-5.2, 0, -4.4]} w={3.4} top="#d9f1f5" leg="#7aa9b4" /><Monitor p={[-5.4, 1.1, -4.5]} rot={[0, 0.3, 0]} screen={crack ? "#ff3b4b" : "#2fd46a"} />
    <Desk p={[5.2, 0, -4.4]} w={3.4} top="#d9f1f5" leg="#7aa9b4" /><Monitor p={[5.0, 1.1, -4.5]} rot={[0, -0.3, 0]} screen={crack ? "#ff3b4b" : "#2fd46a"} />
    <Chair p={[-5.2, 0, -3.0]} rotY={0.2} color="#1d6f7f" /><Chair p={[5.2, 0, -3.0]} rotY={-0.3} color="#1d6f7f" />
    <Plant p={[-3.2, 0, -6.8]} s={1.2} /><Plant p={[3.2, 0, -6.8]} s={1.2} /><Plant p={[7.6, 0, 1.2]} s={1.1} />
    <Shelf p={[-9.2, 0, -7.0]} w={2.6} rows={4} seed={2} wood="#0a2a34" /><Cabinet p={[9.2, 0, -6.8]} color="#3c7f8f" /><Cooler p={[7.4, 0, -6.5]} />
    <Clock p={[-6.8, 6.2, -7.8]} r={0.5} t={t} /><Frame p={[5.4, 2.8, -7.85]} s={[1.2, 0.9]} art={1} />
    <Rug p={[0.4, 0, 0.4]} s={[7.4, 4.0]} a="#0b3540" b="#ffc23a" />
    <Shaft p={[-1.4, 4.6, -2.0]} s={[2.8, 9]} rot={[0, 0, 0.3]} color="140,240,255" o={0.16} /><Dust t={t} area={[6, 6, 4]} color="rgba(190,245,255,.9)" />
    {/* Jensen */}
    <Person p={[jx, jJump, 0.6]} sy={0} h={3.6} look={jensen} f={f} pose={{
      mood: crack ? "shock" : "grin", nerv: crack ? 0.6 : 0, sweat: crack ? 1 : 0, air: jJump > 0 ? 1 : 0,
      squash: t > 4.65 && t < 4.85 ? -0.18 * (1 - (t - 4.65) / 0.2) : 0,
      arms: crack ? "head" : "up", armK: crack ? 1 : seg(t, 0.4, 1.0), lookX: crack ? -0.8 : 0.2
    }} />
  </>);
};

/* =================== S2 6.30 – 14.00  "For 33 years, Jensen ran Nvidia with 60 direct reports, no heir apparent, 3.5% shares." =================== */
const K2: Key[] = [
  { t: 6.1, pos: [-5.2, 4.6, 8.6], look: [0, 2.8, -1.0], fov: 60 },
  { t: 10.0, pos: [0.0, 5.4, 9.2], look: [0, 2.8, -1.0], fov: 56 },
  { t: 14.2, pos: [5.0, 4.8, 8.0], look: [0.4, 2.6, -1.2], fov: 58 },
];
const S2 = ({ t, f }: Ctx) => {
  const pieK = seg(t, 11.2, 12.6, Easing.out(Easing.cubic));
  return (<>
    <Cam t={t} keys={K2} />
    <Lights warm="#d8e8ff" />
    <Floor kind="marble" a="#162447" b="#121e3b" unit={2.2} w={32} d={32} />
    <WallDoor z={-9} W={32} kind="plain" a="#1b2c54" b="#1b2c54" base="#0d1730" />
    <SideWall x={-12} kind="plain" a="#1b2c54" b="#1b2c54" /><SideWall x={12} kind="plain" a="#1b2c54" b="#1b2c54" />
    <WindowCity p={[-8, 5, -8.9]} s={[4, 4.5]} dusk /><WindowCity p={[8, 5, -8.9]} s={[4, 4.5]} dusk />
    {/* Center podium */}
    <Cyl p={[0, 0.3, -1.0]} rt={2.2} rb={2.5} h={0.6} color="#264dba" line={3} />
    <SpotCone p={[0, 9.5, -1.0]} h={9.0} r={2.2} color="#b8d8ff" o={0.14} />
    {/* Back wall metrics: 33 YRS & 3.5% SHARES */}
    <CanvasPlane p={[-3.2, 5.2, -8.75]} s={[4.6, 3.2]} px={[460, 320]} frame="#ffc23a" draw={(c, W, H) => {
      c.fillStyle = "#0b1530"; c.fillRect(0, 0, W, H); c.fillStyle = "#ffc23a"; c.font = "900 120px Inter, Arial"; c.textAlign = "center"; c.textBaseline = "middle";
      c.fillText("33 YRS", W / 2, H * 0.42); c.fillStyle = "#fff"; c.font = "800 42px Inter, Arial"; c.fillText("60 DIRECT REPORTS", W / 2, H * 0.78);
    }} />
    <CanvasPlane p={[3.2, 5.2, -8.75]} s={[4.6, 3.2]} px={[460, 320]} frame="#2fd46a" draw={(c, W, H) => {
      c.fillStyle = "#0b1530"; c.fillRect(0, 0, W, H);
      const cx = W * 0.34, cy = H * 0.52, r = 95;
      c.fillStyle = "#2b3d6b"; c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.fill();
      c.fillStyle = "#ff4a5a"; c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * 0.035 * pieK + 0.08); c.closePath(); c.fill();
      c.fillStyle = "#fff"; c.font = "900 76px Inter, Arial"; c.textAlign = "left"; c.textBaseline = "middle"; c.fillText("3.5%", W * 0.58, H * 0.44);
      c.fillStyle = "#9ec4ff"; c.font = "800 32px Inter, Arial"; c.fillText("SHARES", W * 0.58, H * 0.68);
    }} />
    {/* Empty HEIR chair on right */}
    <Chair p={[4.4, 0, -2.0]} rotY={-0.6} color="#ffc23a" />
    <CanvasPlane p={[4.4, 2.5, -2.0]} s={[1.8, 0.9]} px={[240, 120]} frame="#ff4a5a" draw={(c, W, H) => {
      c.fillStyle = "#1b1030"; c.fillRect(0, 0, W, H); c.fillStyle = "#ff4a5a"; c.font = "900 44px Inter, Arial"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("NO HEIR ?", W / 2, H / 2);
    }} />
    {/* Ring of direct reports */}
    {Array.from({ length: 10 }, (_, i) => {
      const a = -1.2 + (i / 9) * 2.4, R = 6.2;
      return <Person key={i} p={[Math.sin(a) * R, 0, -1.0 + Math.cos(a) * R * 0.55]} h={2.7} look={crowd[i % 8]} f={f + i * 7} pose={{ mood: "deadpan", lookX: -Math.sign(Math.sin(a)), flip: Math.sin(a) > 0, arms: "point", armK: 0.7 }} />;
    })}
    {/* Props */}
    <Desk p={[-6.4, 0, -5.0]} w={2.8} top="#d0e0ff" leg="#2b3350" /><Monitor p={[-6.4, 1.1, -5.1]} rot={[0, 0.4, 0]} screen="#2fd46a" />
    <Plant p={[-5.8, 0, -7.4]} s={1.2} /><Plant p={[6.0, 0, -7.4]} s={1.2} /><Lamp p={[-8.0, 0, -1.5]} h={3.2} color="#b8d8ff" />
    <Shelf p={[-9.8, 0, -7.8]} w={2.6} rows={4} seed={5} wood="#101c3a" /><Cabinet p={[9.8, 0, -7.6]} color="#264dba" />
    <Dust t={t} area={[7, 6, 4]} color="rgba(180,210,255,.85)" />
    {/* Jensen on podium */}
    <Person p={[0, 0.6, -1.0]} sy={0.6} h={3.7} look={jensen} f={f} pose={{ mood: t < 10.5 ? "grin" : "worry", arms: t < 9.5 ? "shrug" : "down", armK: 0.9, lookX: Math.sin(t * 0.9) * 0.5 }} />
  </>);
};

/* =================== S3 14.00 – 22.90  "Nov 8... affair... Megaspeed smuggling AI chips to China." =================== */
const K3: Key[] = [
  { t: 13.8, pos: [-4.4, 7.6, 11.4], look: [0.0, 2.2, -1.5], fov: 60 },
  { t: 18.0, pos: [-2.2, 5.8, 8.8], look: [0.4, 2.2, -1.8], fov: 56 },
  { t: 23.1, pos: [-0.8, 4.4, 7.2], look: [0.8, 2.0, -2.2], fov: 52 },
];
const S3 = ({ t, f }: Ctx) => {
  const siren = Math.sin(f * 0.45) > 0;
  const crateSlide = seg(t, 16.5, 21.5, Easing.inOut(Easing.sin));
  return (<>
    <Cam t={t} keys={K3} />
    <Lights warm="#ffb8c8" />
    <Stars p={[0, 18, -45]} s={[120, 44]} t={t} top="#0e0514" bottom="#381024" n={80} />
    <Floor kind="tile" a="#1f1520" b="#18101a" unit={2.0} w={36} d={36} />
    {/* Warehouse buildings */}
    <Building p={[-9.5, 0, -8]} s={[7, 14, 8]} color="#2d1828" face="+x" seed={3} lit={0.25} />
    <Building p={[9.5, 0, -8]} s={[7, 16, 8]} color="#261422" face="-x" seed={7} lit={0.35} />
    <Building p={[0, 0, -16]} s={[14, 12, 6]} color="#22101c" face="+z" seed={9} lit={0.2} />
    <StreetLamp p={[-5.2, 0, -2]} on={0.9} /><StreetLamp p={[5.2, 0, -2]} flip on={0.9} />
    {/* Siren glow */}
    <Glow p={[-5, 5, -10]} r={7} color={siren ? "rgba(255,30,60,0.9)" : "rgba(40,120,255,0.9)"} o={0.35} />
    <Glow p={[5, 5, -10]} r={7} color={siren ? "rgba(40,120,255,0.9)" : "rgba(255,30,60,0.9)"} o={0.35} />
    {/* NOV 8 Dossier / Newspaper */}
    <CanvasPlane p={[-2.2, 2.6, 1.4]} rot={[-0.25, 0.2, 0]} s={[3.4, 2.4]} px={[520, 360]} frame="#ff2b3b" draw={(c, W, H) => {
      c.fillStyle = "#f4ebd8"; c.fillRect(0, 0, W, H);
      c.fillStyle = "#e5233a"; c.fillRect(0, 0, W, 80);
      c.fillStyle = "#fff"; c.font = "900 44px Inter, Arial"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("NOV 8  •  BREAKING", W / 2, 42);
      c.fillStyle = INK; c.font = "900 52px Inter, Arial"; c.fillText("MEGASPEED", W / 2, 160);
      c.fillStyle = "#b81d2a"; c.font = "800 34px Inter, Arial"; c.fillText("AFFAIR + SMUGGLING", W / 2, 235);
      c.fillStyle = "#2b3350"; c.font = "700 26px Inter, Arial"; c.fillText("AI CHIPS -> CHINA", W / 2, 305);
    }} />
    {/* Smuggled chip crates */}
    {[0, 1, 2].map((i) => <Box key={i} p={[2.4 + i * 1.4 - crateSlide * 1.2, 0.7, -3.5 - i * 0.4]} s={[1.2, 1.2, 1.2]} color="#2a4a3a" line={3} />)}
    <Box p={[4.8, 1.4, -5.6]} s={[4.6, 2.8, 2.4]} color="#1b263b" line={3} />
    <CanvasPlane p={[4.8, 1.5, -4.35]} s={[3.4, 1.4]} px={[340, 140]} draw={(c, W, H) => {
      c.fillStyle = "#1b263b"; c.fillRect(0, 0, W, H); c.fillStyle = "#ffc23a"; c.font = "900 48px Inter, Arial"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("MEGASPEED", W / 2, H / 2);
    }} />
    <Barrier p={[-3.2, 0, -5.8]} w={3.6} /><StreetSign p={[-5.0, 0, 2.4]} a="PORT RD" b="DOCK 8" />
    <Dust t={t} area={[7, 7, 4]} color="rgba(255,180,200,.85)" />
    {/* Executive moving crate */}
    <Person p={[1.6 - crateSlide * 1.2, 0, -2.8]} h={3.2} look={crowd[4]} f={f} pose={{ mood: "worry", nerv: 0.5, sweat: 0.7, walk: crateSlide * 4, speed: 0.6, arms: "box", armK: 1, flip: true }} />
  </>);
};

/* =================== S4 22.90 – 28.60  "Congress demanded answers. SEC inquiry. Board probe." =================== */
const K4: Key[] = [
  { t: 22.7, pos: [0.0, 2.2, 10.6], look: [0.0, 3.6, -2.5], fov: 60 },
  { t: 25.5, pos: [0.2, 2.6, 7.6], look: [0.0, 3.2, -2.0], fov: 54 },
  { t: 28.8, pos: [0.0, 2.9, 5.4], look: [0.0, 2.9, 0.2], fov: 50 },
];
const S4 = ({ t, f }: Ctx) => {
  const s1 = seg(t, 23.0, 23.4, Easing.out(Easing.back(2.5)));
  const s2 = seg(t, 24.9, 25.3, Easing.out(Easing.back(2.5)));
  const s3 = seg(t, 26.8, 27.2, Easing.out(Easing.back(2.5)));
  const labels = ["CONGRESS", "SEC", "BOARD"];
  const stamps = [s1, s2, s3];
  return (<>
    <Cam t={t} keys={K4} impacts={[[23.1, 0.03], [25.0, 0.03], [26.9, 0.04]]} />
    <Lights warm="#ffe0b0" />
    <Floor kind="marble" a="#2a2235" b="#221b2b" unit={2.0} w={30} d={30} />
    <WallDoor z={-8} W={30} kind="plain" a="#1c1427" b="#1c1427" base="#0e0a16" />
    <SideWall x={-11} kind="plain" a="#1c1427" b="#1c1427" /><SideWall x={11} kind="plain" a="#1c1427" b="#1c1427" />
    {/* 3 Towering Lecterns / Pillars */}
    {[-3.8, 0, 3.8].map((x, i) => (
      <group key={i} position={[x, 0, -3.6]}>
        <Box p={[0, 2.2, 0]} s={[2.4, 4.4, 1.8]} color="#2b2244" line={3} />
        <CanvasPlane p={[0, 3.4, 0.95]} s={[2.1, 1.1]} px={[320, 160]} frame="#ffc23a" draw={(c, W, H) => {
          c.fillStyle = "#140e24"; c.fillRect(0, 0, W, H); c.fillStyle = "#ffc23a"; c.font = "900 44px Inter, Arial"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(labels[i], W / 2, H / 2);
        }} />
        {stamps[i] > 0.02 ? <CanvasPlane p={[0, 5.4, 0.2]} s={[2.6 * stamps[i] + 0.01, 1.1 * stamps[i] + 0.01]} px={[320, 140]} draw={(c, W, H) => {
          c.fillStyle = "#ff2b3b"; c.fillRect(0, 0, W, H); c.strokeStyle = "#fff"; c.lineWidth = 8; c.strokeRect(6, 6, W - 12, H - 12);
          c.fillStyle = "#fff"; c.font = "900 46px Inter, Arial"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(i === 0 ? "ANSWERS!" : i === 1 ? "INQUIRY" : "PROBE", W / 2, H / 2);
        }} /> : null}
        <Person p={[0, 4.4, 0.1]} sy={4.4} h={2.6} look={crowd[(i + 2) % 8]} f={f + i * 4} pose={{ mood: "angry", arms: "point", armK: 0.8 }} />
      </group>
    ))}
    <SpotCone p={[0, 10, 0.4]} h={10} r={1.9} color="#fff2c8" o={0.18} />
    <Glow p={[0, 0.1, 0.4]} r={2.2} color="rgba(255,240,180,1)" o={0.35} />
    <Plant p={[-7.5, 0, -6.5]} s={1.3} /><Plant p={[7.5, 0, -6.5]} s={1.3} />
    <Shelf p={[-9.2, 0, -6.8]} w={2.4} rows={4} seed={4} wood="#1a1228" /><Cabinet p={[9.2, 0, -6.8]} color="#3a2c5a" />
    <Dust t={t} area={[5, 6, 3]} color="rgba(255,220,170,.85)" />
    {/* Jensen under interrogation */}
    <Person p={[0, 0, 0.4]} sy={0} h={3.3} look={jensen} f={f} pose={{ mood: "gulp", nerv: 0.85, sweat: 1, hunch: 0.7, arms: "head", armK: 1, lookX: Math.sin(f * 0.25) }} />
  </>);
};

/* =================== S5 28.60 – 32.60  "Four days later, on November 12, Jensen Huang resigned on the spot." =================== */
const K5: Key[] = [
  { t: 28.4, pos: [-2.4, 3.3, 10.6], look: [0.4, 3.6, -1.0], fov: 58 },
  { t: 30.6, pos: [0.2, 3.7, 6.6], look: [0.6, 3.5, -0.6], fov: 50 },
  { t: 32.8, pos: [4.2, 3.4, 8.2], look: [5.0, 3.2, -1.2], fov: 56 },
];
const S5 = ({ t, f }: Ctx) => {
  const ST = 1.0, LX = 0.6, LZ = 0.2, CZ = -0.6, CH = 3.7;
  const W0 = 31.3, W1 = 32.6;
  const x = lerp(LX, 7.6, seg(t, W0, W1, Easing.inOut(Easing.sin))), moving = t > W0 && t < W1, P: V3 = [x, ST, CZ];
  const cam = camAt(t, K5).pos;
  const grab = seg(t, 30.2, 30.5), lift = seg(t, 30.5, 30.75, Easing.inOut(Easing.sin)), carry = seg(t, 30.75, 31.05, Easing.inOut(Easing.sin)), placed = t >= 31.05;
  const headW = toWorld(P, hand(CH, [0, 0.79 + 0.07 * lift], 0, false, 0.05), cam), lect: V3 = [LX, ST + 1.6 + 0.12, LZ + 0.05];
  const crownW: V3 = placed ? [lect[0], lect[1] + 0.05 * Math.exp(-(t - 31.05) * 10) * Math.abs(Math.sin((t - 31.05) * 30)), lect[2]] : carry > 0 ? [lerp(headW[0], lect[0], carry), lerp(headW[1], lect[1], carry) + Math.sin(carry * Math.PI) * 0.25, lerp(headW[2], lect[2], carry)] : headW;
  const handsY = carry > 0 ? lerp(0.82, 0.47, carry) : lerp(0.79, 0.84, lift), holding = t > 30.2 && t < 31.1, release = seg(t, 31.05, 31.25);
  const stamp = seg(t, 30.8, 31.1, Easing.out(Easing.back(3)));
  return (<>
    <Cam t={t} keys={K5} />
    <Lights warm="#ffd2f0" />
    <Floor kind="carpet" a="#3a0f2e" b="#330d29" unit={1.6} w={34} d={34} />
    <Box p={[0, ST / 2, -1.5]} s={[18, ST, 8]} color="#2a1846" />
    <Surface p={[0, ST + 0.01, -1.5]} s={[18, 8]} rot={[-Math.PI / 2, 0, 0]} kind="plank" a="#6b3a1f" b="#5e321a" unit={1.6} />
    <Box p={[0, ST - 0.06, 2.52]} s={[18, 0.12, 0.08]} color="#ffc23a" line={2} />
    <Box p={[0.8, 5.6, -5.25]} s={[12.4, 6.0, 0.3]} color="#120a22" />
    <CanvasPlane p={[0.8, 5.6, -5.05]} s={[12, 5.6]} px={[960, 448]} draw={(c, W, H) => {
      c.fillStyle = "#1a0614"; c.fillRect(0, 0, W, H);
      c.fillStyle = "#fff"; c.font = "900 84px Inter, Arial"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("NOVEMBER 12", W / 2, 130);
      if (stamp > 0.02) {
        c.save(); c.translate(W / 2, H * 0.62); c.rotate(-0.08); c.scale(0.4 + 0.6 * stamp, 0.4 + 0.6 * stamp);
        c.strokeStyle = "#ff2b3b"; c.lineWidth = 16; c.strokeRect(-360, -90, 720, 180);
        c.fillStyle = "#ff2b3b"; c.font = "900 135px Inter, Arial"; c.fillText("RESIGNED", 0, 6); c.restore();
      }
    }} />
    <Curtain p={[-7.4, 4.6, 0.6]} s={[2.8, 9.2]} /><Curtain p={[7.3, 4.6, 0.6]} s={[2.6, 9.2]} /><Curtain p={[0, 8.6, 0.65]} s={[18, 1.8]} folds={16} />
    <SpotCone p={[LX, 9.0, CZ + 0.4]} h={8.0} r={1.7} color="#fff1c8" o={0.14} />
    <Lectern p={[LX, ST, LZ]} label="NVDA" />
    <Plant p={[-5.4, ST, -3.8]} s={1.3} pot="#ffc23a" /><Plant p={[6.6, ST, -3.8]} s={1.3} pot="#ffc23a" />
    <group position={[-5.6, 0, 8.8]}><Cyl p={[0, 1.0, 0]} rt={0.05} h={2.0} color="#2b3350" line={2} /><PressCam p={[0, 2.2, 0]} s={1.6} /></group>
    <Dust t={t} area={[3, 7, 2]} color="rgba(255,235,200,.9)" />
    <Person p={P} sy={ST} h={CH} look={jensen} f={f} pose={{
      mood: t < 30.8 ? "deadpan" : "worry", hunch: t > 31.0 ? 0.7 : 0,
      walk: moving ? (x - LX) * WALK : undefined, speed: moving ? 0.8 : 0,
      armR: holding ? [0.12, handsY] : undefined, armRK: holding ? grab * (1 - release) : 1,
      armL: holding ? [-0.12, handsY] : undefined, armLK: grab * (1 - release), lookX: t > 31.1 ? 0.7 : 0
    }} />
    <Crown p={crownW} s={0.62} rot={[0, 0.3, placed ? 0 : carry * 0.2]} />
    {placed ? <Glow p={[lect[0], lect[1] + 0.3, lect[2] + 0.2]} r={0.9} color="rgba(255,230,120,1)" o={0.5} /> : null}
  </>);
};

/* =================== S6 32.60 – 39.85  "Elon Musk, Donald Trump, petition rallied... board said NO." =================== */
const K6: Key[] = [
  { t: 32.4, pos: [-3.4, 2.8, 9.6], look: [-1.4, 2.4, -1.0], fov: 58 },
  { t: 36.2, pos: [0.4, 2.8, 8.8], look: [1.6, 2.6, -3.0], fov: 56 },
  { t: 40.0, pos: [2.2, 3.0, 7.2], look: [2.6, 3.0, -6.0], fov: 52 },
];
const S6 = ({ t, f }: Ctx) => {
  const noPop = seg(t, 37.5, 37.85, Easing.out(Easing.back(3)));
  const doorOpen = 1 - seg(t, 37.2, 37.55, Easing.in(Easing.cubic));
  return (<>
    <Cam t={t} keys={K6} impacts={[[37.5, 0.05]]} />
    <Lights warm="#e8ffe0" />
    <Floor kind="tile" a="#113826" b="#0d2c1e" unit={1.8} w={34} d={34} />
    <WallDoor z={-6.5} W={34} open={doorOpen * 0.6} kind="plain" a="#184a33" b="#184a33" base="#091f15" />
    <SideWall x={-12} kind="plain" a="#143f2b" b="#143f2b" /><SideWall x={12} kind="plain" a="#143f2b" b="#143f2b" />
    {/* Supporters: Musk, Trump, Petition crowd */}
    <Person p={[-3.6, 0, -0.4]} h={3.5} look={muskLook} f={f} pose={{ mood: t < 37.4 ? "grin" : "shock", arms: "up", armK: 0.9, lookX: 0.5 }} />
    <Person p={[-1.6, 0, -0.8]} h={3.6} look={trumpLook} f={f + 3} pose={{ mood: t < 37.4 ? "smile" : "angry", arms: "point", armK: 0.9, lookX: 0.6 }} />
    {[-5.4, -4.6, -2.6, -0.4].map((x, i) => <Person key={i} p={[x, 0, 1.4 + (i % 2) * 0.8]} h={2.9} look={crowd[i]} f={f + i * 6} pose={{ mood: t < 37.4 ? "grin" : "worry", arms: "up", armK: 0.8 }} />)}
    {/* Petition sign */}
    <CanvasPlane p={[-2.6, 3.6, 1.0]} s={[2.6, 1.2]} px={[360, 160]} frame="#ffc23a" draw={(c, W, H) => {
      c.fillStyle = "#fffaf0"; c.fillRect(0, 0, W, H); c.fillStyle = "#172353"; c.font = "900 48px Inter, Arial"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("BRING HIM BACK", W / 2, H / 2);
    }} />
    {/* Boardroom NO stamp */}
    {noPop > 0.02 ? <CanvasPlane p={[2.6, 3.4, -5.8]} s={[4.6 * noPop + 0.01, 2.6 * noPop + 0.01]} px={[460, 260]} draw={(c, W, H) => {
      c.fillStyle = "#ff2b3b"; c.fillRect(0, 0, W, H); c.strokeStyle = "#fff"; c.lineWidth = 12; c.strokeRect(8, 8, W - 16, H - 16);
      c.fillStyle = "#fff"; c.font = "900 130px Inter, Arial"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("NO", W / 2, H * 0.44);
      c.font = "800 34px Inter, Arial"; c.fillText("0% SUPERVOTING", W / 2, H * 0.8);
    }} /> : null}
    <Plant p={[-7.5, 0, -5.5]} s={1.3} /><Plant p={[7.5, 0, -5.5]} s={1.3} />
    <Desk p={[7.0, 0, -3.2]} w={3.0} top="#d8f5e6" leg="#2b3350" /><Chair p={[7.0, 0, -2.0]} color="#ffc23a" />
    <Barrier p={[-4.5, 0, -3.5]} w={3.8} /><Dust t={t} area={[7, 6, 4]} color="rgba(200,255,210,.85)" />
  </>);
};

/* =================== S7 39.85 – 47.15  "Fastest race car... spare keys to pit crew... engine overheats..." =================== */
const K7: Key[] = [
  { t: 39.65, pos: [-4.6, 2.0, 7.6], look: [0.0, 1.4, -0.5], fov: 62 },
  { t: 43.4, pos: [0.0, 2.6, 8.2], look: [0.8, 1.8, -0.6], fov: 56 },
  { t: 47.3, pos: [4.2, 2.4, 7.4], look: [1.0, 1.8, -0.8], fov: 56 },
];
const S7 = ({ t, f }: Ctx) => {
  const heat = seg(t, 43.6, 45.2);
  return (<>
    <Cam t={t} keys={K7} />
    <Lights warm="#ffd4b0" />
    <Floor kind="tile" a="#2a2428" b="#221d20" unit={1.6} w={36} d={36} />
    <WallDoor z={-8} W={36} kind="plain" a="#3a1810" b="#3a1810" base="#1b0b08" />
    <SideWall x={-12} kind="plain" a="#3a1810" b="#3a1810" /><SideWall x={12} kind="plain" a="#3a1810" b="#3a1810" />
    {/* Stylized F1 Race Car */}
    <group position={[-0.6, 0, -0.6]}>
      <Box p={[0, 0.6, 0]} s={[5.4, 0.7, 2.0]} color="#2fd46a" line={3} />
      <Box p={[-0.4, 1.1, 0]} s={[2.2, 0.5, 1.2]} color="#16171f" line={2} />
      <Box p={[-2.5, 1.35, 0]} s={[0.6, 0.8, 2.2]} color="#ffc23a" line={2} />
      {[[-1.8, 1.05], [-1.8, -1.05], [1.8, 1.05], [1.8, -1.05]].map(([wx, wz], i) => (
        <Cyl key={i} p={[wx, 0.48, wz]} rt={0.48} h={0.45} color="#1b1b2a" rot={[Math.PI / 2, 0, 0]} />
      ))}
    </group>
    {/* Overheating engine glow */}
    {heat > 0.05 ? <Glow p={[-1.4, 1.6, -0.6]} r={2.6} color="rgba(255,60,30,1)" o={0.55 * heat + 0.15 * Math.sin(f * 0.9)} /> : null}
    <CanvasPlane p={[0, 5.2, -7.7]} s={[8.4, 3.2]} px={[640, 240]} frame={heat > 0.3 ? "#ff2b3b" : "#ffc23a"} draw={(c, W, H) => {
      c.fillStyle = "#1a0a06"; c.fillRect(0, 0, W, H);
      c.fillStyle = heat > 0.3 ? "#ff2b3b" : "#2fd46a"; c.font = "900 72px Inter, Arial"; c.textAlign = "center"; c.textBaseline = "middle";
      c.fillText(heat > 0.3 ? "ENGINE OVERHEAT!" : "PIT CREW KEYS", W / 2, H * 0.45);
      c.fillStyle = "#fff"; c.font = "800 36px Inter, Arial"; c.fillText(heat > 0.3 ? "DRIVER BLOCKED" : "FASTEST CAR", W / 2, H * 0.78);
    }} />
    {/* Golden Spare Key held by pit crew */}
    <group position={[3.2, 2.4, 0.2]} rotation={[0, 0, Math.sin(f * 0.15) * 0.15]}>
      <Cyl p={[0, 0.5, 0]} rt={0.36} h={0.14} color="#ffc23a" rot={[Math.PI / 2, 0, 0]} />
      <Box p={[0, -0.35, 0]} s={[0.18, 1.1, 0.12]} color="#ffc23a" line={2} />
      <Box p={[0.18, -0.7, 0]} s={[0.25, 0.2, 0.12]} color="#ffc23a" line={2} />
    </group>
    <Barrier p={[-5.4, 0, -4.4]} w={4.0} /><Barrier p={[5.4, 0, -4.4]} w={4.0} />
    <HangLamp p={[-3, 9, -2]} color="#ff8a1c" /><HangLamp p={[3, 9, -2]} color="#ff8a1c" />
    <Dust t={t} area={[7, 6, 4]} color="rgba(255,210,160,.85)" />
    {/* Driver Jensen + Pit crew mechanics */}
    <Person p={[-3.4, 0, 1.0]} h={3.4} look={jensen} f={f} pose={{ mood: heat > 0.3 ? "shock" : "deadpan", arms: "shrug", armK: 1, lookX: 1, sweat: heat }} />
    <Person p={[2.8, 0, 0.2]} h={3.3} look={crowd[1]} f={f + 5} pose={{ mood: "grin", arms: "up", armK: 0.9, flip: true }} />
    <Person p={[4.4, 0, -0.6]} h={3.2} look={crowd[5]} f={f + 9} pose={{ mood: "deadpan", arms: "chest", armK: 1, flip: true }} />
  </>);
};

/* =================== S8 47.15 – 53.20  "Interim CEO Colette Kress took the wheel, board hired headhunters." =================== */
const K8: Key[] = [
  { t: 46.95, pos: [-2.4, 2.8, 8.6], look: [0.0, 2.8, -1.5], fov: 58 },
  { t: 50.0, pos: [0.2, 2.8, 6.8], look: [0.8, 3.0, -2.5], fov: 54 },
  { t: 53.4, pos: [2.4, 3.0, 7.6], look: [2.2, 3.4, -5.0], fov: 54 },
];
const S8 = ({ t, f }: Ctx) => {
  const wheelRot = Math.sin(t * 2.2) * 0.45;
  return (<>
    <Cam t={t} keys={K8} />
    <Lights warm="#dceeff" />
    <Floor kind="carpet" a="#102a43" b="#0c2236" unit={1.8} w={32} d={32} />
    <WallDoor z={-8} W={32} kind="plain" a="#163654" b="#163654" base="#091a2a" />
    <SideWall x={-11} kind="plain" a="#163654" b="#163654" /><SideWall x={11} kind="plain" a="#163654" b="#163654" />
    <WindowCity p={[-7.5, 4.8, -7.9]} s={[3.6, 4.2]} dusk />
    {/* Headhunters CEO Search Board */}
    <CanvasPlane p={[2.8, 4.8, -7.6]} s={[6.8, 3.8]} px={[680, 380]} frame="#ffc23a" draw={(c, W, H) => {
      c.fillStyle = "#0a1929"; c.fillRect(0, 0, W, H);
      c.fillStyle = "#ffc23a"; c.font = "900 46px Inter, Arial"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("HEADHUNTERS: CEO SEARCH", W / 2, 58);
      for (let i = 0; i < 3; i++) {
        c.fillStyle = "#163654"; c.fillRect(55 + i * 200, 120, 170, 210);
        c.fillStyle = "#2fd46a"; c.font = "900 96px Inter, Arial"; c.fillText("?", 140 + i * 200, 225);
      }
    }} />
    {/* Helm / Steering Wheel */}
    <group position={[-1.0, 1.5, 0.2]}>
      <Cyl p={[0, -0.75, 0]} rt={0.18} h={1.5} color="#2b3350" line={2} />
      <group position={[0, 0.25, 0.25]} rotation={[0.4, 0, wheelRot]}>
        <Cyl p={[0, 0, 0]} rt={0.75} h={0.1} color="#ffc23a" rot={[Math.PI / 2, 0, 0]} />
        <Box p={[0, 0, 0]} s={[1.4, 0.12, 0.12]} color="#1b1b2a" line={1} />
        <Box p={[0, 0, 0]} s={[0.12, 1.4, 0.12]} color="#1b1b2a" line={1} />
      </group>
    </group>
    <Desk p={[-5.6, 0, -4.2]} w={3.2} top="#d9eef8" leg="#2b3350" /><Monitor p={[-5.6, 1.1, -4.3]} screen="#2fd46a" />
    <Plant p={[-3.4, 0, -6.6]} s={1.2} /><Plant p={[7.4, 0, -6.6]} s={1.2} /><Chair p={[-5.6, 0, -2.8]} color="#1f8a8a" />
    <Cabinet p={[8.8, 0, -6.6]} color="#264dba" /><Cooler p={[7.2, 0, -5.8]} />
    <Dust t={t} area={[6, 6, 4]} color="rgba(180,230,255,.85)" />
    {/* Colette Kress at the wheel */}
    <Person p={[-1.0, 0, -0.3]} h={3.6} look={kress} f={f} pose={{ mood: "smile", armR: [0.16, 0.55], armL: [-0.16, 0.55], armRK: 1, armLK: 1 }} />
  </>);
};

/* =================== S9 53.20 – 58.22  "Even worse for Jensen: first earnings without him beat Wall Street targets." =================== */
const K9: Key[] = [
  { t: 53.0, pos: [0.0, 3.6, 6.2], look: [0.0, 4.4, -4.0], fov: 56 },
  { t: 55.6, pos: [1.4, 3.4, 9.6], look: [0.2, 3.6, -2.5], fov: 60 },
  { t: 58.5, pos: [2.2, 3.2, 11.4], look: [0.0, 3.4, -1.8], fov: 62 },
];
const S9 = ({ t, f }: Ctx) => {
  const beatPop = seg(t, 54.6, 55.2, Easing.out(Easing.back(2.5)));
  return (<>
    <Cam t={t} keys={K9} />
    <Lights warm="#d8ffe6" />
    <Stars p={[0, 18, -45]} s={[120, 46]} t={t} top="#061224" bottom="#12305a" n={100} />
    <Floor kind="tile" a="#0b1d3a" b="#08162c" unit={2.0} w={34} d={34} />
    {/* Wall Street BEAT scoreboard */}
    <Box p={[0, 5.2, -7.2]} s={[11.2, 5.6, 0.3]} color="#061020" />
    <CanvasPlane p={[0, 5.2, -7.0]} s={[10.8, 5.2]} px={[900, 430]} frame="#2fd46a" draw={(c, W, H) => {
      c.fillStyle = "#061526"; c.fillRect(0, 0, W, H);
      c.fillStyle = "#9ec4ff"; c.font = "800 42px Inter, Arial"; c.textAlign = "center"; c.textBaseline = "middle";
      c.fillText("FIRST EARNINGS WITHOUT JENSEN", W / 2, 68);
      c.fillStyle = "#2fd46a"; c.font = "900 135px Inter, Arial";
      c.fillText("BEAT TARGETS", W / 2, H * 0.52);
      if (beatPop > 0.05) {
        c.fillStyle = "#ffc23a"; c.font = "900 54px Inter, Arial"; c.fillText("▲ WALL STREET CHEERS ▲", W / 2, H * 0.84);
      }
    }} />
    <Arrow3D p={[-4.2, 4.4, -5.0]} rot={[0, 0.2, 0]} L={3.4} color="#2fd46a" />
    <Glow p={[0, 5.2, -6.0]} r={6} color="rgba(47,212,106,0.75)" o={0.35} />
    {/* Cheering Wall Street traders */}
    {[-3.2, -1.0, 1.2, 3.4].map((x, i) => (
      <Person key={i} p={[x, 0, -2.4 + (i % 2) * 0.8]} h={3.1} look={crowd[(i + 1) % 8]} f={f + i * 5} pose={{ mood: "grin", arms: "up", armK: 1, air: Math.sin(f * 0.35 + i) > 0.6 ? 1 : 0 }} />
    ))}
    <Desk p={[-5.6, 0, -3.5]} w={3.0} top="#d0e8ff" leg="#2b3350" /><Monitor p={[-5.6, 1.1, -3.6]} screen="#2fd46a" />
    <Plant p={[-6.8, 0, -6.5]} s={1.2} /><Plant p={[6.8, 0, -6.5]} s={1.2} />
    <Dust t={t} area={[7, 6, 4]} color="rgba(160,255,200,.9)" />
    {/* Jensen watching in foreground corner */}
    <Person p={[3.8, 0, 2.8]} h={3.5} look={jensen} f={f} pose={{ mood: "worry", hunch: 0.7, sweat: 0.5, arms: "down", lookX: -0.9, flip: true }} />
  </>);
};

const CUTS = [0, 6.30, 14.00, 22.90, 28.60, 32.60, 39.85, 47.15, 53.20, 58.22];
export const NvidiaV5: React.FC = () => {
  const f = useCurrentFrame(), t = f / FPS;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Audio src={staticFile("mix.wav")} />
      <Scene first start={CUTS[0]} end={CUTS[1]} bg="#0b2a33">{(c) => <S1 {...c} />}</Scene>
      <Scene start={CUTS[1]} end={CUTS[2]} bg="#162447" trans="zoom">{(c) => <S2 {...c} />}</Scene>
      <Scene start={CUTS[2]} end={CUTS[3]} bg="#2b0f1e" trans="whip">{(c) => <S3 {...c} />}</Scene>
      <Scene start={CUTS[3]} end={CUTS[4]} bg="#1c1427" trans="flash">{(c) => <S4 {...c} />}</Scene>
      <Scene start={CUTS[4]} end={CUTS[5]} bg="#1a0b2e" trans="zoom">{(c) => <S5 {...c} />}</Scene>
      <Scene start={CUTS[5]} end={CUTS[6]} bg="#0f2e1f" trans="whip">{(c) => <S6 {...c} />}</Scene>
      <Scene start={CUTS[6]} end={CUTS[7]} bg="#3a1810" trans="flash">{(c) => <S7 {...c} />}</Scene>
      <Scene start={CUTS[7]} end={CUTS[8]} bg="#102a43" trans="zoom">{(c) => <S8 {...c} />}</Scene>
      <Scene start={CUTS[8]} end={CUTS[9]} bg="#0b1d3a" trans="whip">{(c) => <S9 {...c} />}</Scene>
      <Grade t={t} shaft={false} tint={t < 6.3 ? "rgba(0,180,220,.07)" : t < 14 ? "rgba(40,90,220,.07)" : t < 22.9 ? "rgba(220,40,80,.08)" : t < 32.6 ? "rgba(180,50,200,.07)" : t < 47.15 ? "rgba(255,140,40,.07)" : "rgba(40,210,120,.07)"} />
      <Captions />
    </AbsoluteFill>
  );
};
