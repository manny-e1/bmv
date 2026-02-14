"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import confetti from "canvas-confetti";
import { CatmullRomCurve3, Vector3 } from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import type { RootState } from "@react-three/fiber";
import type { Group } from "three";

type Stop = {
  title: string;
  moment: string;
  icon?: string;
};

const storyStops: Stop[] = [
  {
    title: "Louvre",
    moment: "First glance and I said okayyyyy. Even though my mind didn't think of anything more, you crawling under that table sure did grab my attention."
  },
  {
    title: "The venue and Viral",
    moment: "I didn't tell you this but I was kind of happy seeing you at the venue(you were in your own world and dancing). Keza got to talk to you at viral which was nice😊."
  },
  {
    title: "Aster's concert",
    moment: "Picking you up and spinning you around like a movie scene🙈. Thank god for Eman(yab's friend)"
  },
  {
    title: "Story reply",
    moment: "Remember when I left a comment under your story saying \"this is so funny😭\"?, yeah, wanted to interact with you"
  },
  {
    title: "Event meet-cute",
    moment: "One of the best nights of my life. Got to kiss those beautiful lips and have a good conversation with you which I will remember for the rest of my life."
  },
  {
    title: "Those Weekend only interactions",
    moment: "Even though I was trying to hold back, those weekends were special to me because I got to interact with you."
  },
  {
    title: "Sunday night",
    moment: "You told me that you were going to take a T-break and vented why, which made me see you in a different way. I know I said I didn't like you like that but I sure did start to like you like that, that very night lol"
  },
  {
    title: "Wednesday night",
    moment: "We flirted like crazy that night🫦. That was the night that I said this girl might like me frfr."
  },
  {
    title: "Haile's Mojito",
    moment: "The time we met alone. I got to talk to you sober, share a laugh with you, cuddle with you and kiss you like I wanted for a long time."
  },
  {
    title: "Thursday, the week after Haile's",
    moment: "You asked me to meet up. It made me sooo happy like you have no idea."
  },
  {
    title: "Saturday night, that very same week",
    moment: "We had our very first mess around lol. We(mostly you🫦) plotted a whole gather up just to go out together. That touched my heart! That was our first sleepover too."
  },
  {
    title: "Every meet ups since then",
    moment: "Don't even know what to say about those days, absoulte peak!"
  },
  {
    title: "Eve and New year",
    moment: "Our first night out, we said I love you to each other for the first time and I asked you to be my girlfriend. The greatest question I've ever asked and the greatest answer I've ever got!!!"
  },
  {
    title: "Jan 3rd, Saturday",
    moment: "For the first time, we spoke on the phone just to talk and we talked for over 5 hours. It was so nice."
  },
  {
    title: "Jan 17th - 19th",
    moment: "We spent 48 hours together after we missed each other for 2 weeks"
  },
  {
    title: "Today",
    moment: "Feb 14th, Our first Valentine's day together. We can't celebrate together because of your graduation ceremony but know that I will be thinking about you on every second of the day, that you are the best thing that has ever happened to me and I love you so much."
  },
];

const valentineStop: Stop = {
  title: "Valentine’s Day",
  moment: "The rails end in a bouquet of lights, confetti, and all my love for you.",
  icon: "💘"
};

const gentlePlea = [
  "Wait, are you sure? I'll buy you flowers.",
  "What if I promise extra hugs?",
  "Eshi, I'll give you massages.",
  "Okay but we look so cute together.",
  "One more chance for a rom-com ending?",
  "Tey?",
  "Tey gn?",
  "Benatsh😭",
  "Yalanchi man alegn?🥺",
  "Semawsh leka hehe"
];

function Train({
  curve,
  stopsCount,
  onStopChange,
  onArrive,
  targetStop,
  onTargetReached
}: {
  curve: CatmullRomCurve3;
  stopsCount: number;
  onStopChange: (stopIndex: number) => void;
  onArrive: () => void;
  targetStop: number | null;
  onTargetReached: () => void;
}) {
  const trainRef = useRef<Group>(null);
  const arrivedRef = useRef(false);
  const targetStopRef = useRef<number | null>(null);
  const progress = useRef({
    stopIndex: 0,
    phase: "hold" as "hold" | "move",
    phaseTime: 0
  });
  const segments = Math.max(1, stopsCount - 1);
  const holdDuration = 6;
  const moveDuration = 2;

  useEffect(() => {
    targetStopRef.current = targetStop;
    if (targetStop !== null) {
      arrivedRef.current = false;
    }
  }, [targetStop]);

  useFrame((_: RootState, delta: number) => {
    if (!trainRef.current) return;
    if (targetStopRef.current !== null && targetStopRef.current === progress.current.stopIndex) {
      targetStopRef.current = null;
      onTargetReached();
    }

    const target = targetStopRef.current;
    const direction =
      target !== null
        ? target > progress.current.stopIndex
          ? 1
          : -1
        : 1;

    if (
      target === null &&
      progress.current.stopIndex >= stopsCount - 1 &&
      progress.current.phase === "hold"
    ) {
      if (!arrivedRef.current) {
        arrivedRef.current = true;
        onArrive();
      }
    } else {
      progress.current.phaseTime += delta;
      if (progress.current.phase === "hold") {
        if (progress.current.phaseTime >= holdDuration) {
          progress.current.phase = "move";
          progress.current.phaseTime = 0;
        }
      } else {
        if (progress.current.phaseTime >= moveDuration) {
          progress.current.phase = "hold";
          progress.current.phaseTime = 0;
          progress.current.stopIndex += direction;
          progress.current.stopIndex = Math.max(
            0,
            Math.min(stopsCount - 1, progress.current.stopIndex)
          );
          onStopChange(progress.current.stopIndex);
          if (target !== null && progress.current.stopIndex === target) {
            targetStopRef.current = null;
            onTargetReached();
          }
        }
      }
    }

    const moveProgress =
      progress.current.phase === "move" ? progress.current.phaseTime / moveDuration : 0;
    const t =
      progress.current.phase === "hold"
        ? progress.current.stopIndex / segments
        : (progress.current.stopIndex + moveProgress * direction) / segments;
    const position = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);
    trainRef.current.position.copy(position);
    trainRef.current.rotation.y = Math.atan2(tangent.x, tangent.z);
  });

  return (
    <group ref={trainRef}>
      <group>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 1.9, 24]} />
          <meshStandardMaterial color="#ff6fa9" emissive="#ff3f8f" emissiveIntensity={0.55} />
        </mesh>
        <mesh position={[0, 0.5, 0.6]}>
          <boxGeometry args={[0.8, 0.6, 0.9]} />
          <meshStandardMaterial color="#ffd166" />
        </mesh>
        <mesh position={[0, 0.82, 0.6]}>
          <boxGeometry args={[0.9, 0.2, 1]} />
          <meshStandardMaterial color="#ffe29a" />
        </mesh>
        <mesh position={[0, 0.65, -0.7]}>
          <cylinderGeometry args={[0.12, 0.18, 0.45, 16]} />
          <meshStandardMaterial color="#1f1f2e" />
        </mesh>
        <mesh rotation={[Math.PI, 0, 0]} position={[0, 0.2, -1.1]}>
          <coneGeometry args={[0.5, 0.6, 20]} />
          <meshStandardMaterial color="#ff8dc3" />
        </mesh>
        {([
          [-0.6, -0.25, -0.6],
          [0.6, -0.25, -0.6],
          [-0.6, -0.25, 0.4],
          [0.6, -0.25, 0.4]
        ] as Array<[number, number, number]>).map((position) => (
          <mesh key={position.join("-")} position={position} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.22, 0.22, 0.18, 20]} />
            <meshStandardMaterial color="#1a1c2b" />
          </mesh>
        ))}
        <mesh position={[0, 0.35, -1.25]}>
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshStandardMaterial color="#ffe29a" emissive="#ffd166" emissiveIntensity={1.2} />
        </mesh>
      </group>
    </group>
  );
}

function TrainScene({
  stops,
  onStopChange,
  onArrive,
  targetStop,
  onTargetReached
}: {
  stops: Stop[];
  onStopChange: (stopIndex: number) => void;
  onArrive: () => void;
  targetStop: number | null;
  onTargetReached: () => void;
}) {
  const { viewport } = useThree();
  const spacing = 4;
  const rowSpacing = 3.8;
  const safeMargin = 1.5;
  const usableWidth = Math.max(6, viewport.width - safeMargin * 2);
  const maxCols = Math.max(3, Math.floor(usableWidth / spacing));
  const cols = Math.min(maxCols, Math.max(3, stops.length));
  const rows = Math.ceil(stops.length / cols);
  const points = useMemo(() => {
    const base = stops.map((_, i) => {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const direction = row % 2 === 0 ? 1 : -1;
      const x = direction === 1 ? col * spacing : (cols - 1 - col) * spacing;
      const z = row * rowSpacing + Math.sin(i * 0.35) * 0.8;
      const y = Math.sin(i * 0.6) * 1.2 + (row % 2 === 0 ? 0.4 : -0.4);
      return new Vector3(x, y, z);
    });
    if (base.length === 1) {
      base.push(new Vector3(spacing, 0, 0));
    }
    return base;
  }, [stops, cols]);
  const curve = useMemo(
    () => new CatmullRomCurve3(points, false, "catmullrom", 0.5),
    [points]
  );
  const trackPoints = useMemo(
    () => curve.getPoints(Math.max(80, stops.length * 60)),
    [curve, stops.length]
  );
  const leftRail = useMemo(
    () => trackPoints.map((point) => new Vector3(point.x, point.y - 0.12, point.z - 0.55)),
    [trackPoints]
  );
  const rightRail = useMemo(
    () => trackPoints.map((point) => new Vector3(point.x, point.y - 0.12, point.z + 0.55)),
    [trackPoints]
  );
  const sleepers = useMemo(() => {
    const count = Math.max(18, stops.length * 12);
    return Array.from({ length: count }, (_, index) => {
      const t = count === 1 ? 0 : index / (count - 1);
      const point = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t);
      return {
        position: point,
        rotation: Math.atan2(tangent.x, tangent.z)
      };
    });
  }, [curve, stops.length]);
  const centerX = ((cols - 1) * spacing) / 2;
  const centerZ = ((rows - 1) * rowSpacing) / 2;
  const pathWidth = Math.max(1, (cols - 1) * spacing);
  const scale = Math.min(1.2, usableWidth / pathWidth);

  return (
    <group position={[-centerX, 0, -centerZ]} scale={[scale, scale, scale]}>
      <Line points={leftRail} color="#b9b0ff" lineWidth={4} />
      <Line points={rightRail} color="#b9b0ff" lineWidth={4} />
      {sleepers.map((sleeper) => (
        <mesh
          key={`${sleeper.position.x}-${sleeper.position.z}`}
          position={[sleeper.position.x, sleeper.position.y - 0.2, sleeper.position.z]}
          rotation={[0, sleeper.rotation, 0]}
        >
          <boxGeometry args={[1.2, 0.08, 0.32]} />
          <meshStandardMaterial color="#5b4b6d" />
        </mesh>
      ))}
      {points.map((point, index) => (
        <mesh key={stops[index].title} position={point}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial
            color={index === stops.length - 1 ? "#ffd166" : "#8aa6ff"}
            emissive="#ff9ec7"
            emissiveIntensity={0.7}
          />
        </mesh>
      ))}
      <Train
        curve={curve}
        stopsCount={stops.length}
        onStopChange={onStopChange}
        onArrive={onArrive}
        targetStop={targetStop}
        onTargetReached={onTargetReached}
      />
    </group>
  );
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [noCount, setNoCount] = useState(0);
  const [yesAccepted, setYesAccepted] = useState(false);
  const [currentStop, setCurrentStop] = useState(0);
  const [showMoment, setShowMoment] = useState(true);
  const [arrived, setArrived] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [targetStop, setTargetStop] = useState<number | null>(null);
  const momentTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const allStops = useMemo(() => [...storyStops, valentineStop], []);
  const activeStop = allStops[currentStop];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    return () => {
      if (momentTimeoutRef.current) {
        clearTimeout(momentTimeoutRef.current);
      }
    };
  }, []);

  const handleYes = () => {
    setYesAccepted(true);
    confetti({
      particleCount: 140,
      spread: 90,
      origin: { y: 0.6 },
      colors: ["#ff5fa2", "#ffd166", "#9d7bff", "#8bd3ff"]
    });
  };

  const handleNo = () => {
    setNoCount((count) => count + 1);
  };

  const pleaText = noCount > 0 ? gentlePlea[(noCount - 1) % gentlePlea.length] : "";
  const handleStep = (direction: -1 | 1) => {
    const nextIndex = Math.min(
      allStops.length - 1,
      Math.max(0, currentStop + direction)
    );
    setTargetStop(nextIndex);
    setArrived(false);
    setShowModal(false);
  };

  return (
    <main className="relative min-h-screen w-[98%] overflow-hidden">
      {mounted && (
        <div className="absolute inset-0">
          <Canvas camera={{ position: [0, 6, 14], fov: 50 }}>
            <ambientLight intensity={0.8} />
            <directionalLight intensity={1.5} position={[10, 12, 6]} />
            <pointLight intensity={1.2} position={[-10, 8, -2]} color="#ff9ed6" />
            <pointLight intensity={0.9} position={[6, 6, -10]} color="#88c6ff" />
            <fog attach="fog" args={["#0b0b19", 8, 42]} />
            <TrainScene
              stops={allStops}
              onStopChange={(index) => {
                setCurrentStop(index);
                if (momentTimeoutRef.current) {
                  clearTimeout(momentTimeoutRef.current);
                }
                setShowMoment(true);
                momentTimeoutRef.current = setTimeout(() => setShowMoment(false), 6000);
                if (index === allStops.length - 1) {
                  setArrived(true);
                  setShowModal(true);
                } else {
                  setArrived(false);
                }
              }}
              onArrive={() => {
                setArrived(true);
                setShowModal(true);
              }}
              targetStop={targetStop}
              onTargetReached={() => setTargetStop(null)}
            />
          </Canvas>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0">
        <div className="flex w-full items-start justify-between px-6 pt-6 md:px-10">
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.5em] text-pink-200/70">Love Express</p>
            <h1 className="text-3xl font-semibold text-glow md:text-5xl">
              Our Journey, Station by Station
            </h1>
          </div>
          <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.4em] text-white/80">
            Stop {currentStop + 1} of {allStops.length}
          </div>
        </div>

        {showMoment && activeStop && (
          <div className="absolute bottom-24 left-1/2 w-[90%] max-w-xl -translate-x-1/2 rounded-3xl border border-white/20 bg-white/10 px-6 py-5 text-center shadow-2xl backdrop-blur">
            <p className="text-xs uppercase tracking-[0.4em] text-pink-200/80">
              {activeStop.icon ? `${activeStop.icon} ${activeStop.title}` : activeStop.title}
            </p>
            <p className="mt-2 text-lg text-white/90">{activeStop.moment}</p>
          </div>
        )}
      </div>

      <div className="pointer-events-auto absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-4 rounded-full border border-white/10 bg-white/10 px-5 py-3 text-xs text-white/80 backdrop-blur">
        <button
          type="button"
          onClick={() => handleStep(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-lg text-white transition hover:bg-white/20"
        >
          ←
        </button>
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] uppercase tracking-[0.4em] text-white/60">
            Move Train
          </span>
          <span className="text-xs font-semibold">
            {activeStop.icon ? `${activeStop.icon} ${activeStop.title}` : activeStop.title}
          </span>
        </div>
        <button
          type="button"
          onClick={() => handleStep(1)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-lg text-white transition hover:bg-white/20"
        >
          →
        </button>
      </div>

      {arrived && !showModal && (
        <div className="pointer-events-auto absolute bottom-10 right-10">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-pink-500 text-2xl text-white shadow-xl shadow-pink-500/50 transition hover:-translate-y-1 hover:bg-pink-400"
          >
            →
          </button>
        </div>
      )}

      {showModal && (
        <div className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-black/70 px-6 backdrop-blur">
          {!yesAccepted && <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/10 p-8 text-center shadow-2xl">

            <p className="text-xs uppercase tracking-[0.4em] text-pink-200/80">
              Final Destination
            </p>
            <h2 className="mt-3 text-3xl font-semibold">Will you be my valentine?</h2>


            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <button
                onClick={handleYes}
                type="button"
                className="rounded-full bg-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:-translate-y-1 hover:bg-pink-400"
              >
                Yes, absolutely
              </button>
              {noCount >= gentlePlea.length ? null : (
                <button
                  onClick={handleNo}
                  type="button"
                  className="rounded-full border border-white/30 bg-white/5 px-6 py-3 text-sm font-semibold text-white/80 transition hover:-translate-y-1 hover:bg-white/10"
                >
                  Not yet
                </button>)}
            </div>



            {pleaText && !yesAccepted && (
              <div className="relative mt-6 inline-flex items-center rounded-3xl border border-white/20 bg-white/15 px-5 py-3 text-sm text-white/90">
                {pleaText}
                <span className="absolute -left-3 top-6 h-3 w-3 rounded-full bg-white/20" />
                <span className="absolute -left-6 top-8 h-2 w-2 rounded-full bg-white/20" />
              </div>
            )}
          </div>
          }
          {yesAccepted && (
            <div className="mt-6 rounded-2xl border border-pink-200/30 bg-pink-500/15 p-8 text-3xl text-pink-50">
              <p>
                You just made me the happiest man. Happy Valentine's my love!🌹
              </p>
              <p className="text-center pt-2">
                Tomorrow, 🫦🫵
              </p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
