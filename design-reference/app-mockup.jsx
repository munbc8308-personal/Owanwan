import { useState } from "react";
import { Camera, Flame, Trophy, User, Lock, Check, Users, ChevronLeft, X, Copy, Plus, LogOut, Settings, Bell } from "lucide-react";

const COLOR = {
  concrete: "#EDEBE6",
  concreteDark: "#E1DED7",
  asphalt: "#1F2023",
  lime: "#D7FF3F",
  red: "#E63B2E",
  slate: "#6E7075",
  white: "#FAFAF8",
};

const FONT = {
  display: "'Bebas Neue', sans-serif",
  body: "'Manrope', sans-serif",
  mono: "'JetBrains Mono', monospace",
};

const AVATAR_COLORS = ["#D7FF3F", "#B7C7A3", "#C9B7A3", "#A9B8C9", "#C9A9B5", "#E8C089"];

const MY_GROUPS = [
  {
    id: 1,
    name: "정우's 크루",
    isOwner: false,
    code: "8HD3KX",
    streak: 12,
    members: [
      { name: "정우", isOwner: true, color: "#B7C7A3" },
      { name: "나", isOwner: false, color: "#D7FF3F" },
      { name: "소민", isOwner: false, color: "#C9B7A3" },
      { name: "재현", isOwner: false, color: "#A9B8C9" },
      { name: "하늘", isOwner: false, color: "#C9A9B5" },
    ],
    feed: [
      {
        name: "정우", done: true, color: "#B7C7A3", sport: "running", time: "07:12",
        stats: { distance: "5.2km", pace: "5'42\"" },
        route: [[10, 70], [22, 55], [30, 62], [45, 40], [55, 46], [68, 28], [80, 34], [92, 18]],
      },
      {
        name: "나", done: true, color: "#D7FF3F", sport: "gym", time: "19:44",
        stats: { part: "가슴", weight: "60kg", sets: "5set" },
      },
      { name: "소민", done: false, color: null, sport: null, time: null, stats: null },
      {
        name: "재현", done: true, color: "#C9B7A3", sport: "running", time: "06:30",
        stats: { distance: "8.1km", pace: "5'10\"" },
        route: [[8, 30], [20, 45], [35, 38], [42, 60], [58, 52], [65, 72], [78, 64], [90, 80]],
      },
      { name: "하늘", done: false, color: null, sport: null, time: null, stats: null },
    ],
  },
  {
    id: 2,
    name: "오늘도 헬스",
    isOwner: true,
    code: "P92NUM",
    streak: 4,
    members: [
      { name: "나", isOwner: true, color: "#D7FF3F" },
      { name: "도윤", isOwner: false, color: "#E8C089" },
      { name: "지훈", isOwner: false, color: "#A9B8C9" },
    ],
    feed: [
      {
        name: "나", done: true, color: "#D7FF3F", sport: "gym", time: "20:10",
        stats: { part: "하체", weight: "90kg", sets: "4set" },
      },
      {
        name: "도윤", done: true, color: "#E8C089", sport: "gym", time: "18:40",
        stats: { part: "등", weight: "70kg", sets: "5set" },
      },
      { name: "지훈", done: false, color: null, sport: null, time: null, stats: null },
    ],
  },
];

const SPORT_LABEL = { running: "러닝", gym: "헬스", etc: "기타" };

function stampText(member) {
  if (!member.done) return "";
  if (member.sport === "running") {
    return `${member.time} · ${member.stats.distance} · ${member.stats.pace}`;
  }
  if (member.sport === "gym") {
    return `${member.time} · ${member.stats.part} ${member.stats.weight}×${member.stats.sets}`;
  }
  return `${member.time} · ${member.stats.activity} ${member.stats.duration}`;
}



function Fonts() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Manrope:wght@400;500;700;800&family=JetBrains+Mono:wght@500;700&display=swap');
      .stamp-pop { animation: stampPop 0.5s cubic-bezier(.2,1.4,.4,1) forwards; }
      @keyframes stampPop {
        0% { opacity: 0; transform: scale(2.2) rotate(-18deg); }
        60% { opacity: 1; transform: scale(0.92) rotate(-9deg); }
        100% { opacity: 1; transform: scale(1) rotate(-7deg); }
      }
      .bib-notch::before, .bib-notch::after {
        content: ''; position: absolute; width: 14px; height: 14px;
        background: ${COLOR.concrete}; border-radius: 50%; top: 50%; transform: translateY(-50%);
      }
      .bib-notch::before { left: -7px; }
      .bib-notch::after { right: -7px; }
    `}</style>
  );
}

function StatusBar() {
  return (
    <div className="flex justify-between items-center px-6 pt-3 pb-1 text-xs" style={{ color: COLOR.asphalt, fontFamily: FONT.mono }}>
      <span>9:41</span>
      <span>● ● ●</span>
    </div>
  );
}

function PostageStamp({ className = "", children }) {
  return (
    <div
      className={`relative ${className}`}
      style={{
        transform: "rotate(-7deg)",
        background: COLOR.white,
        border: `2px solid ${COLOR.red}`,
        padding: 3,
      }}
    >
      <div
        style={{
          border: `1px solid ${COLOR.red}`,
          padding: "4px 10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 12, color: COLOR.red, whiteSpace: "nowrap" }}>
          {children}
        </span>
      </div>
    </div>
  );
}

function BottomNav({ tab, setTab, onUpload }) {
  const items = [
    { key: "feed", label: "피드", icon: Users },
    { key: "challenge", label: "챌린지", icon: Trophy },
    { key: "ranking", label: "랭킹", icon: Flame },
    { key: "mypage", label: "MY", icon: User },
  ];
  return (
    <div className="relative">
      <button
        onClick={onUpload}
        className="absolute left-1/2 -translate-x-1/2 -top-7 w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
        style={{ background: COLOR.lime, border: `3px solid ${COLOR.concrete}` }}
      >
        <Camera size={26} color={COLOR.asphalt} />
      </button>
      <div className="flex justify-between px-6 pt-5 pb-6" style={{ background: COLOR.white, borderTop: `1px solid ${COLOR.concreteDark}` }}>
        {items.map((it) => {
          const Icon = it.icon;
          const active = tab === it.key;
          return (
            <button
              key={it.key}
              onClick={() => setTab(it.key)}
              className="flex flex-col items-center gap-1 w-12"
              style={{ opacity: active ? 1 : 0.4 }}
            >
              <Icon size={20} color={COLOR.asphalt} />
              <span style={{ fontFamily: FONT.body, fontSize: 10, fontWeight: 700, color: COLOR.asphalt }}>{it.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Onboarding({ onDone }) {
  const [step, setStep] = useState(0); // 0: 스포츠, 1: 시작방법, 2: 만들기/코드, 3: 완료
  const [sport, setSport] = useState("러닝");
  const [mode, setMode] = useState(null); // 'create' | 'join'
  const [groupName, setGroupName] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [nickname, setNickname] = useState("");
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);

  const back = () => setStep((s) => Math.max(0, s - 1));

  const Header = ({ title }) => (
    <div className="flex items-center gap-3 mb-6">
      {step > 0 && (
        <button onClick={back}>
          <ChevronLeft size={20} color={COLOR.white} />
        </button>
      )}
      <div className="flex gap-1.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-1 rounded-full"
            style={{ width: 16, background: i <= step ? COLOR.lime : "#3A3B3E" }}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col justify-between px-6 pb-8" style={{ background: COLOR.asphalt }}>
      <StatusBar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="pt-2">
          <Header />
        </div>

        {step === 0 && (
          <div>
            <div style={{ fontFamily: FONT.mono, fontSize: 12, color: COLOR.lime, letterSpacing: 2 }}>DAILY PROOF</div>
            <h1 className="mt-2 leading-[0.95]" style={{ fontFamily: FONT.display, fontSize: 44, color: COLOR.white }}>
              프로필을<br />만들어주세요
            </h1>
            <p className="mt-4" style={{ fontFamily: FONT.body, fontSize: 14, color: COLOR.slate, lineHeight: 1.6 }}>
              그룹원들에게 보여질 이름과 색상이에요. 언제든 바꿀 수 있어요.
            </p>

            <div className="mt-8 flex justify-center">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: avatarColor }}
              >
                <span style={{ fontFamily: FONT.display, fontSize: 30, color: COLOR.asphalt }}>
                  {nickname ? nickname[0] : "?"}
                </span>
              </div>
            </div>

            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임 입력"
              maxLength={8}
              className="w-full mt-6 px-4 py-4 rounded-2xl outline-none text-center"
              style={{
                background: "#2A2B2E",
                border: `1.5px solid ${nickname ? COLOR.lime : "#3A3B3E"}`,
                fontFamily: FONT.body,
                fontWeight: 700,
                fontSize: 15,
                color: COLOR.white,
              }}
            />

            <div className="flex justify-center gap-3 mt-5">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setAvatarColor(c)}
                  className="w-9 h-9 rounded-full"
                  style={{
                    background: c,
                    border: avatarColor === c ? `2.5px solid ${COLOR.white}` : "2.5px solid transparent",
                    boxShadow: avatarColor === c ? `0 0 0 2px ${COLOR.lime}` : "none",
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <div style={{ fontFamily: FONT.mono, fontSize: 12, color: COLOR.lime, letterSpacing: 2 }}>DAILY PROOF</div>
            <h1 className="mt-2 leading-[0.95]" style={{ fontFamily: FONT.display, fontSize: 48, color: COLOR.white }}>
              매일,<br />있는 그대로
            </h1>
            <p className="mt-4" style={{ fontFamily: FONT.body, fontSize: 14, color: COLOR.slate, lineHeight: 1.6 }}>
              친구와 함께 매일 한 번, 꾸민 것 없이 인증하는 가장 솔직한 운동 기록.
            </p>
            <div className="mt-10">
              <div style={{ fontFamily: FONT.body, fontSize: 12, color: COLOR.slate, fontWeight: 700 }}>무슨 운동 하세요?</div>
              <div className="flex gap-2 mt-3">
                {["러닝", "헬스", "기타"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSport(s)}
                    className="px-4 py-2 rounded-full text-sm"
                    style={{
                      fontFamily: FONT.body,
                      fontWeight: 700,
                      background: sport === s ? COLOR.lime : "transparent",
                      color: sport === s ? COLOR.asphalt : COLOR.white,
                      border: `1.5px solid ${sport === s ? COLOR.lime : COLOR.slate}`,
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={{ fontFamily: FONT.display, fontSize: 32, color: COLOR.white }}>어떻게 시작할까요?</h2>
            <p className="mt-2" style={{ fontFamily: FONT.body, fontSize: 13, color: COLOR.slate }}>
              같이 인증할 친구가 있다면 초대코드로, 없다면 새로 만들어보세요.
            </p>
            <div className="flex flex-col gap-3 mt-8">
              <button
                onClick={() => { setMode("create"); setStep(3); }}
                className="flex items-center gap-4 p-4 rounded-2xl text-left"
                style={{ background: "#2A2B2E", border: `1.5px solid #3A3B3E` }}
              >
                <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ background: COLOR.lime }}>
                  <Users size={18} color={COLOR.asphalt} />
                </div>
                <div>
                  <div style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: 14, color: COLOR.white }}>새 그룹 만들기</div>
                  <div style={{ fontFamily: FONT.body, fontSize: 12, color: COLOR.slate }}>내가 크루장이 되어 친구를 초대해요</div>
                </div>
              </button>
              <button
                onClick={() => { setMode("join"); setStep(3); }}
                className="flex items-center gap-4 p-4 rounded-2xl text-left"
                style={{ background: "#2A2B2E", border: `1.5px solid #3A3B3E` }}
              >
                <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ background: "#3A3B3E" }}>
                  <User size={18} color={COLOR.white} />
                </div>
                <div>
                  <div style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: 14, color: COLOR.white }}>초대코드로 참여하기</div>
                  <div style={{ fontFamily: FONT.body, fontSize: 12, color: COLOR.slate }}>친구가 알려준 6자리 코드를 입력해요</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {step === 3 && mode === "create" && (
          <div>
            <h2 style={{ fontFamily: FONT.display, fontSize: 32, color: COLOR.white }}>그룹 이름을 정해주세요</h2>
            <p className="mt-2" style={{ fontFamily: FONT.body, fontSize: 13, color: COLOR.slate }}>
              나중에 언제든 바꿀 수 있어요. 무료 플랜은 최대 5명까지 함께할 수 있어요.
            </p>
            <input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="예: 퇴근런 크루"
              className="w-full mt-8 px-4 py-4 rounded-2xl outline-none"
              style={{
                background: "#2A2B2E",
                border: `1.5px solid ${groupName ? COLOR.lime : "#3A3B3E"}`,
                fontFamily: FONT.body,
                fontSize: 15,
                color: COLOR.white,
              }}
            />
          </div>
        )}

        {step === 3 && mode === "join" && (
          <div>
            <h2 style={{ fontFamily: FONT.display, fontSize: 32, color: COLOR.white }}>초대코드를 입력하세요</h2>
            <p className="mt-2" style={{ fontFamily: FONT.body, fontSize: 13, color: COLOR.slate }}>
              친구의 크루 화면에서 코드를 확인할 수 있어요.
            </p>
            <div className="flex gap-2 mt-8 justify-between">
              {code.map((c, i) => (
                <input
                  key={i}
                  value={c}
                  maxLength={1}
                  onChange={(e) => {
                    const v = e.target.value.slice(-1);
                    const next = [...code];
                    next[i] = v;
                    setCode(next);
                  }}
                  className="w-10 h-14 text-center rounded-xl outline-none"
                  style={{
                    background: "#2A2B2E",
                    border: `1.5px solid ${c ? COLOR.lime : "#3A3B3E"}`,
                    fontFamily: FONT.mono,
                    fontWeight: 700,
                    fontSize: 20,
                    color: COLOR.white,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5" style={{ background: COLOR.lime }}>
              <Check size={28} color={COLOR.asphalt} />
            </div>
            <h2 style={{ fontFamily: FONT.display, fontSize: 30, color: COLOR.white }}>
              {mode === "create" ? `${groupName || "새 크루"} 준비 완료` : "크루에 합류했어요"}
            </h2>
            <p className="mt-2" style={{ fontFamily: FONT.body, fontSize: 13, color: COLOR.slate }}>
              {mode === "create" ? "친구를 초대해서 함께 인증을 시작해보세요." : `${nickname || "러너"}님, 오늘부터 함께 인증해요.`}
            </p>
          </div>
        )}
      </div>

      <button
        onClick={() => (step < 4 ? setStep((s) => s + 1) : onDone())}
        disabled={
          (step === 0 && !nickname) ||
          (step === 3 && mode === "create" && !groupName) ||
          (step === 3 && mode === "join" && code.some((c) => !c))
        }
        className="w-full mt-8 py-4 rounded-2xl text-center shrink-0"
        style={{
          background: COLOR.lime,
          fontFamily: FONT.body,
          fontWeight: 800,
          fontSize: 15,
          color: COLOR.asphalt,
          opacity:
            (step === 0 && !nickname) ||
            (step === 3 && mode === "create" && !groupName) ||
            (step === 3 && mode === "join" && code.some((c) => !c))
              ? 0.4
              : 1,
        }}
      >
        {step === 4 ? "시작하기" : "다음"}
      </button>
    </div>
  );
}

function RouteMap({ route, stroke = COLOR.asphalt, showMarkers = true }) {
  if (!route || route.length < 2) return null;
  const points = route.map(([x, y]) => `${x},${y}`).join(" ");
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
      <polyline points={points} fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
      {showMarkers && (
        <>
          <circle cx={route[0][0]} cy={route[0][1]} r="3.2" fill={COLOR.lime} stroke={COLOR.asphalt} strokeWidth="1" />
          <circle cx={route[route.length - 1][0]} cy={route[route.length - 1][1]} r="3.2" fill={COLOR.red} stroke={COLOR.white} strokeWidth="1" />
        </>
      )}
    </svg>
  );
}

function BibCard({ member }) {
  if (!member.done) {
    return (
      <div
        className="relative bib-notch rounded-xl px-4 py-5 flex items-center justify-between"
        style={{ background: "transparent", border: `1.5px dashed ${COLOR.slate}` }}
      >
        <div style={{ fontFamily: FONT.body, fontWeight: 700, fontSize: 14, color: COLOR.asphalt }}>{member.name}</div>
        <div style={{ fontFamily: FONT.body, fontSize: 12, color: COLOR.slate }}>아직 인증 전</div>
      </div>
    );
  }
  return (
    <div className="relative bib-notch rounded-xl overflow-hidden" style={{ background: COLOR.white, border: `1.5px solid ${COLOR.concreteDark}` }}>
      <div className="h-32 relative" style={{ background: member.color }}>
        {member.sport === "running" && member.route && (
          <div className="absolute inset-0">
            <RouteMap route={member.route} stroke={COLOR.asphalt} />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <PostageStamp behind={member.color}>{stampText(member)}</PostageStamp>
        </div>
        {member.sport && (
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded" style={{ background: COLOR.asphalt }}>
            <span style={{ fontFamily: FONT.body, fontWeight: 700, fontSize: 9, color: COLOR.lime }}>{SPORT_LABEL[member.sport]}</span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between px-4 py-3">
        <div style={{ fontFamily: FONT.body, fontWeight: 700, fontSize: 14, color: COLOR.asphalt }}>{member.name}</div>
        <Check size={16} color={COLOR.asphalt} />
      </div>
    </div>
  );
}

function Feed({ group, onOpenGroups }) {
  return (
    <div className="h-full overflow-y-auto" style={{ background: COLOR.concrete }}>
      <StatusBar />
      <div className="px-5 pt-3 pb-2 flex items-center justify-between">
        <button className="text-left" onClick={onOpenGroups}>
          <div className="flex items-center gap-1" style={{ fontFamily: FONT.body, fontSize: 11, color: COLOR.slate, fontWeight: 700 }}>
            {group.name} <ChevronLeft size={12} style={{ transform: "rotate(180deg)" }} />
          </div>
          <div style={{ fontFamily: FONT.display, fontSize: 28, color: COLOR.asphalt }}>오늘의 인증</div>
        </button>
        <div className="flex items-center gap-1 px-3 py-2 rounded-full" style={{ background: COLOR.asphalt }}>
          <Flame size={16} color={COLOR.lime} />
          <span style={{ fontFamily: FONT.mono, fontWeight: 700, color: COLOR.lime, fontSize: 13 }}>{group.streak}</span>
        </div>
      </div>
      <div className="px-5 py-3 flex flex-col gap-3 pb-8">
        {group.feed.map((m, i) => (
          <BibCard key={i} member={m} />
        ))}
      </div>
    </div>
  );
}

const CHALLENGES = [
  {
    id: 1,
    title: "이번 주 30km 채우기",
    sport: "running",
    groupGoal: true,
    desc: "월요일부터 일요일까지, 그룹원 모두 합쳐 30km를 채워보세요. 짧은 거리도 매일 쌓이면 충분해요.",
    period: "7.28 (월) ~ 8.3 (일)",
    unit: "km",
    goal: 30,
    days: "3일 남음",
    joined: true,
    participants: [
      { name: "재현", color: "#C9B7A3", progress: 22 },
      { name: "정우", color: "#B7C7A3", progress: 18 },
      { name: "나", color: "#D7FF3F", progress: 12 },
      { name: "소민", color: "#C9A9B5", progress: 4 },
    ],
    rules: ["매일 인증한 거리가 자동으로 합산돼요", "그룹 전체 합산 30km를 넘기면 전원 배지 획득", "인증하지 않은 날은 0km로 집계"],
  },
  {
    id: 2,
    title: "이번 주 스쿼트 500개",
    sport: "gym",
    groupGoal: true,
    desc: "그룹원 모두 합쳐 스쿼트 500개를 채워보세요. 세트 수는 자유예요.",
    period: "7.28 (월) ~ 8.3 (일)",
    unit: "개",
    goal: 500,
    days: "3일 남음",
    joined: false,
    participants: [
      { name: "나", color: "#D7FF3F", progress: 80 },
      { name: "정우", color: "#B7C7A3", progress: 60 },
    ],
    rules: ["인증 시 입력한 스쿼트 개수가 자동으로 합산돼요", "그룹 전체 합산 500개를 넘기면 전원 배지 획득", "스쿼트 외 하체 운동은 집계되지 않아요"],
  },
  {
    id: 3,
    title: "미라클모닝 5일 연속",
    sport: "etc",
    groupGoal: false,
    desc: "오전 7시 전에 인증샷을 올리면 카운트돼요. 종목 상관없이 평일 5일 연속을 채워보세요.",
    period: "진행중 · 2일차",
    unit: "일",
    goal: 5,
    days: "진행중",
    joined: false,
    participants: [
      { name: "정우", color: "#B7C7A3", progress: 2 },
      { name: "하늘", color: "#C9A9B5", progress: 2 },
      { name: "재현", color: "#C9B7A3", progress: 1 },
    ],
    rules: ["오전 7시 이전 인증만 카운트돼요", "하루라도 놓치면 처음부터 다시 시작", "5일 연속 달성 시 배지 획득"],
  },
];

const TEMPLATES = [
  {
    id: "t1",
    title: "이번 주 30km 채우기",
    sport: "running",
    groupGoal: true,
    desc: "그룹원 모두 합쳐 30km를 채워보세요. 짧은 거리도 매일 쌓이면 충분해요.",
    period: "시작하면 7일간 진행돼요",
    unit: "km",
    goal: 30,
    rules: ["매일 인증한 거리가 자동으로 합산돼요", "그룹 전체 합산 30km를 넘기면 전원 배지 획득", "인증하지 않은 날은 0km로 집계"],
  },
  {
    id: "t2",
    title: "이번 주 스쿼트 500개",
    sport: "gym",
    groupGoal: true,
    desc: "그룹원 모두 합쳐 스쿼트 500개를 채워보세요. 세트 수는 자유예요.",
    period: "시작하면 7일간 진행돼요",
    unit: "개",
    goal: 500,
    rules: ["인증 시 입력한 스쿼트 개수가 자동으로 합산돼요", "그룹 전체 합산 500개를 넘기면 전원 배지 획득", "스쿼트 외 하체 운동은 집계되지 않아요"],
  },
  {
    id: "t3",
    title: "미라클모닝 5일 연속",
    sport: "etc",
    groupGoal: false,
    desc: "오전 7시 전에 인증샷을 올리면 카운트돼요. 종목 상관없이 평일 5일 연속을 채워보세요.",
    period: "시작하면 순차적으로 진행돼요",
    unit: "일",
    goal: 5,
    rules: ["오전 7시 이전 인증만 카운트돼요", "하루라도 놓치면 처음부터 다시 시작", "5일 연속 달성 시 배지 획득"],
  },
  {
    id: "t4",
    title: "주 3회 이상 인증하기",
    sport: "etc",
    groupGoal: false,
    desc: "매주 최소 3회만 인증하면 되는 부담 없는 챌린지예요.",
    period: "매주 월요일 초기화",
    unit: "회",
    goal: 3,
    rules: ["일주일에 3회 이상 인증하면 성공", "주말 포함 어느 요일이든 상관없어요", "달성 못해도 페널티는 없어요"],
  },
];

function TemplatePickerOverlay({ onClose, onStart }) {
  const [selected, setSelected] = useState(null);

  if (selected) {
    return (
      <div className="absolute inset-0 flex flex-col" style={{ background: COLOR.concrete }}>
        <StatusBar />
        <div className="flex items-center gap-3 px-5 pt-2 pb-4">
          <button onClick={() => setSelected(null)}>
            <ChevronLeft size={20} color={COLOR.asphalt} />
          </button>
          <span style={{ fontFamily: FONT.body, fontWeight: 700, fontSize: 13, color: COLOR.slate }}>템플릿 미리보기</span>
        </div>
        <div className="flex-1 overflow-y-auto px-5">
          <h1 style={{ fontFamily: FONT.display, fontSize: 28, color: COLOR.asphalt }}>{selected.title}</h1>
          <p className="mt-2" style={{ fontFamily: FONT.body, fontSize: 13, color: COLOR.slate, lineHeight: 1.6 }}>
            {selected.desc}
          </p>
          <div
            className="inline-block mt-3 px-2.5 py-1 rounded"
            style={{ fontFamily: FONT.mono, fontSize: 11, fontWeight: 700, background: COLOR.asphalt, color: COLOR.lime }}
          >
            {selected.period}
          </div>
          <div className="mt-6" style={{ fontFamily: FONT.body, fontSize: 11, fontWeight: 700, color: COLOR.slate }}>
            규칙
          </div>
          <ul className="mt-2 flex flex-col gap-2">
            {selected.rules.map((r, i) => (
              <li key={i} className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full mt-2" style={{ background: COLOR.slate }} />
                <span style={{ fontFamily: FONT.body, fontSize: 13, color: COLOR.asphalt, lineHeight: 1.5 }}>{r}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4" style={{ fontFamily: FONT.body, fontSize: 11, color: COLOR.slate }}>
            정우's 크루에 바로 적용돼요 · 규칙은 정해진 대로만 사용할 수 있어요
          </p>
        </div>
        <div className="px-5 pb-8 pt-2">
          <button
            onClick={() => onStart(selected)}
            className="w-full py-4 rounded-2xl"
            style={{ background: COLOR.lime, fontFamily: FONT.body, fontWeight: 800, fontSize: 15, color: COLOR.asphalt }}
          >
            이 템플릿으로 시작하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: COLOR.concrete }}>
      <StatusBar />
      <div className="flex items-center gap-3 px-5 pt-2 pb-4">
        <button onClick={onClose}>
          <X size={20} color={COLOR.asphalt} />
        </button>
        <span style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: 15, color: COLOR.asphalt }}>템플릿 고르기</span>
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-8 flex flex-col gap-3">
        <p style={{ fontFamily: FONT.body, fontSize: 12, color: COLOR.slate }}>
          정해진 규칙 그대로, 바로 우리 그룹에 시작할 수 있어요.
        </p>
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelected(t)}
            className="rounded-xl p-4 text-left"
            style={{ background: COLOR.white, border: `1.5px solid ${COLOR.concreteDark}` }}
          >
            <div className="flex items-center gap-2">
              <span
                className="px-1.5 py-0.5 rounded"
                style={{ fontFamily: FONT.body, fontSize: 9, fontWeight: 700, background: COLOR.concreteDark, color: COLOR.slate }}
              >
                {SPORT_LABEL[t.sport]}
              </span>
              <div style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: 14, color: COLOR.asphalt }}>{t.title}</div>
            </div>
            <div className="mt-1" style={{ fontFamily: FONT.body, fontSize: 12, color: COLOR.slate }}>{t.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Challenge({ challenges, onOpenDetail, onOpenSubscribe, onOpenTemplates }) {
  return (
    <div className="h-full overflow-y-auto" style={{ background: COLOR.concrete }}>
      <StatusBar />
      <div className="px-5 pt-3 pb-2 flex items-center justify-between">
        <div style={{ fontFamily: FONT.display, fontSize: 28, color: COLOR.asphalt }}>챌린지</div>
        <button
          onClick={onOpenTemplates}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: COLOR.asphalt }}
        >
          <Plus size={18} color={COLOR.lime} />
        </button>
      </div>
      <div className="px-5 flex flex-col gap-3 pb-8">
        {challenges.map((c) => (
          <button
            key={c.id}
            onClick={() => onOpenDetail(c)}
            className="rounded-xl p-4 text-left"
            style={{ background: COLOR.white, border: `1.5px solid ${COLOR.concreteDark}` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="px-1.5 py-0.5 rounded"
                  style={{ fontFamily: FONT.body, fontSize: 9, fontWeight: 700, background: COLOR.concreteDark, color: COLOR.slate }}
                >
                  {SPORT_LABEL[c.sport]}
                </span>
                <div style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: 15, color: COLOR.asphalt }}>{c.title}</div>
              </div>
              {c.joined && (
                <span
                  className="px-2 py-0.5 rounded"
                  style={{ fontFamily: FONT.body, fontSize: 10, fontWeight: 700, background: COLOR.asphalt, color: COLOR.lime }}
                >
                  참여중
                </span>
              )}
            </div>
            <div className="flex items-center justify-between mt-3">
              <span style={{ fontFamily: FONT.body, fontSize: 12, color: COLOR.slate }}>{c.participants.length}명 참여중</span>
              <span
                className="px-2 py-1 rounded"
                style={{ fontFamily: FONT.mono, fontSize: 11, fontWeight: 700, background: COLOR.lime, color: COLOR.asphalt }}
              >
                {c.days}
              </span>
            </div>
          </button>
        ))}

        <button
          onClick={onOpenSubscribe}
          className="relative flex items-center gap-3 rounded-xl p-4"
          style={{ border: `1.5px dashed ${COLOR.slate}` }}
        >
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: COLOR.concreteDark }}>
            <Lock size={15} color={COLOR.slate} />
          </div>
          <div className="text-left">
            <div style={{ fontFamily: FONT.body, fontWeight: 700, fontSize: 13, color: COLOR.asphalt }}>커스텀 챌린지 만들기</div>
            <div style={{ fontFamily: FONT.body, fontSize: 11, color: COLOR.slate }}>월 1,500원 구독 기능이에요</div>
          </div>
        </button>
      </div>
    </div>
  );
}

function Ranking({ onOpenSubscribe }) {
  const rank = [
    { name: "재현", val: "8.1km" },
    { name: "정우", val: "5.2km" },
    { name: "나", val: "3.0km" },
  ];
  return (
    <div className="h-full overflow-y-auto" style={{ background: COLOR.concrete }}>
      <StatusBar />
      <div className="px-5 pt-3 pb-2">
        <div style={{ fontFamily: FONT.display, fontSize: 28, color: COLOR.asphalt }}>이번 주 랭킹</div>
        <div style={{ fontFamily: FONT.body, fontSize: 12, color: COLOR.slate }}>정우's 크루 · 그룹 내 랭킹</div>
      </div>
      <div className="px-5 flex flex-col gap-2 mt-2">
        {rank.map((r, i) => (
          <div key={i} className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: COLOR.white }}>
            <div className="flex items-center gap-3">
              <span
                style={{
                  fontFamily: FONT.mono,
                  fontWeight: 700,
                  fontSize: 13,
                  color: i === 0 ? COLOR.red : COLOR.slate,
                }}
              >
                {i + 1}
              </span>
              <span style={{ fontFamily: FONT.body, fontWeight: 700, fontSize: 14, color: COLOR.asphalt }}>{r.name}</span>
            </div>
            <span style={{ fontFamily: FONT.mono, fontSize: 13, color: COLOR.asphalt }}>{r.val}</span>
          </div>
        ))}
      </div>

      <div className="px-5 mt-5">
        <div style={{ fontFamily: FONT.body, fontSize: 11, fontWeight: 700, color: COLOR.slate }}>전체 랭킹</div>
        <div className="relative mt-2 rounded-xl overflow-hidden" style={{ background: COLOR.white }}>
          <div className="px-4 py-3 flex flex-col gap-3 blur-sm select-none">
            <div className="flex justify-between"><span>서울 러너1</span><span>21.4km</span></div>
            <div className="flex justify-between"><span>서울 러너2</span><span>19.8km</span></div>
            <div className="flex justify-between"><span>서울 러너3</span><span>18.1km</span></div>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2" style={{ background: "rgba(237,235,230,0.75)" }}>
            <Lock size={18} color={COLOR.asphalt} />
            <span style={{ fontFamily: FONT.body, fontSize: 12, fontWeight: 700, color: COLOR.asphalt }}>
              월 1,500원으로 잠금 해제
            </span>
            <button
              onClick={onOpenSubscribe}
              className="px-4 py-2 rounded-full mt-1"
              style={{ background: COLOR.lime, fontFamily: FONT.body, fontWeight: 800, fontSize: 12, color: COLOR.asphalt }}
            >
              구독하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MyPage({ onOpenGroups, onOpenSettings, onOpenSubscribe }) {
  return (
    <div className="h-full overflow-y-auto" style={{ background: COLOR.concrete }}>
      <StatusBar />
      <div className="px-5 pt-3 pb-2 flex items-center justify-between">
        <div style={{ fontFamily: FONT.display, fontSize: 28, color: COLOR.asphalt }}>MY</div>
        <button onClick={onOpenSettings}>
          <Settings size={20} color={COLOR.asphalt} />
        </button>
      </div>
      <div className="px-5 mt-2 rounded-2xl p-6 text-center" style={{ background: COLOR.asphalt }}>
        <div style={{ fontFamily: FONT.body, fontSize: 11, color: COLOR.slate, fontWeight: 700 }}>연속 인증</div>
        <div style={{ fontFamily: FONT.display, fontSize: 72, color: COLOR.lime, lineHeight: 1 }}>12</div>
        <div style={{ fontFamily: FONT.body, fontSize: 12, color: COLOR.white }}>일째 이어가는 중</div>
      </div>

      <div className="px-5 mt-5">
        <div style={{ fontFamily: FONT.body, fontSize: 11, fontWeight: 700, color: COLOR.slate }}>획득 배지</div>
        <div className="flex gap-3 mt-2">
          {["첫 인증", "7일 연속", "30km"].map((b, i) => (
            <div
              key={i}
              className="flex-1 rounded-xl py-3 text-center"
              style={{ background: COLOR.white, border: `1px solid ${COLOR.concreteDark}` }}
            >
              <div style={{ fontFamily: FONT.body, fontSize: 11, fontWeight: 700, color: COLOR.asphalt }}>{b}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 mt-5">
        <button
          onClick={onOpenGroups}
          className="w-full flex items-center justify-between rounded-xl px-4 py-4"
          style={{ background: COLOR.white, border: `1.5px solid ${COLOR.concreteDark}` }}
        >
          <div className="flex items-center gap-3">
            <Users size={18} color={COLOR.asphalt} />
            <span style={{ fontFamily: FONT.body, fontWeight: 700, fontSize: 14, color: COLOR.asphalt }}>내 그룹 관리</span>
          </div>
          <ChevronLeft size={16} color={COLOR.slate} style={{ transform: "rotate(180deg)" }} />
        </button>
      </div>

      <div className="px-5 mt-5 pb-8">
        <div className="rounded-xl p-4" style={{ background: COLOR.white, border: `1.5px solid ${COLOR.concreteDark}` }}>
          <div style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: 14, color: COLOR.asphalt }}>무료 플랜 이용중</div>
          <ul className="mt-2 flex flex-col gap-1" style={{ fontFamily: FONT.body, fontSize: 12, color: COLOR.slate }}>
            <li>· 그룹 최대 5명</li>
            <li>· 사진 하루 1회 · 720p</li>
            <li>· 그룹 내 랭킹만 확인 가능</li>
          </ul>
          <button
            onClick={onOpenSubscribe}
            className="w-full mt-4 py-3 rounded-xl"
            style={{ background: COLOR.lime, fontFamily: FONT.body, fontWeight: 800, fontSize: 13, color: COLOR.asphalt }}
          >
            월 1,500원으로 구독하기
          </button>
        </div>
      </div>
    </div>
  );
}

function Toggle({ on, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-11 h-6 rounded-full relative transition-colors"
      style={{ background: on ? COLOR.lime : COLOR.concreteDark }}
    >
      <div
        className="absolute top-0.5 w-5 h-5 rounded-full transition-all"
        style={{ background: on ? COLOR.asphalt : COLOR.white, left: on ? 22 : 2 }}
      />
    </button>
  );
}

function SubscribeOverlay({ onClose }) {
  const [plan, setPlan] = useState("yearly"); // 'monthly' | 'yearly'
  const [done, setDone] = useState(false);

  const FEATURES = [
    "영상 기록 업로드 (최대 1분)",
    "사진 원본 화질 저장 + 무기한 보관",
    "전체·세그먼트 랭킹 확인",
    "그룹 무제한 생성",
    "커스텀 챌린지 만들기",
    "데이터 내보내기(CSV)",
  ];

  if (done) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center" style={{ background: COLOR.asphalt }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5" style={{ background: COLOR.lime }}>
          <Check size={28} color={COLOR.asphalt} />
        </div>
        <h2 style={{ fontFamily: FONT.display, fontSize: 30, color: COLOR.white }}>구독이 완료됐어요</h2>
        <p className="mt-2" style={{ fontFamily: FONT.body, fontSize: 13, color: COLOR.slate, lineHeight: 1.6 }}>
          {plan === "yearly" ? "연 15,000원" : "월 1,500원"} 결제가 확인됐어요.<br />이제 모든 기능을 사용할 수 있어요.
        </p>
        <button
          onClick={onClose}
          className="w-full mt-8 py-4 rounded-2xl"
          style={{ background: COLOR.lime, fontFamily: FONT.body, fontWeight: 800, fontSize: 15, color: COLOR.asphalt }}
        >
          시작하기
        </button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: COLOR.concrete }}>
      <StatusBar />
      <div className="flex items-center justify-between px-5 pt-2 pb-2">
        <button onClick={onClose}>
          <X size={20} color={COLOR.asphalt} />
        </button>
        <span style={{ fontFamily: FONT.body, fontWeight: 700, fontSize: 13, color: COLOR.slate }}>구독하기</span>
        <div className="w-5" />
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4">
        <div style={{ fontFamily: FONT.mono, fontSize: 11, color: COLOR.red, letterSpacing: 1.5 }}>DAILY PROOF UNLOCK</div>
        <h1 className="mt-1 leading-[0.95]" style={{ fontFamily: FONT.display, fontSize: 36, color: COLOR.asphalt }}>
          더 진하게<br />기록해보세요
        </h1>

        <div className="flex gap-2 mt-6">
          <button
            onClick={() => setPlan("monthly")}
            className="flex-1 rounded-2xl p-4 text-left"
            style={{
              background: plan === "monthly" ? COLOR.asphalt : COLOR.white,
              border: `1.5px solid ${plan === "monthly" ? COLOR.asphalt : COLOR.concreteDark}`,
            }}
          >
            <div style={{ fontFamily: FONT.body, fontWeight: 700, fontSize: 12, color: plan === "monthly" ? COLOR.slate : COLOR.slate }}>
              월간
            </div>
            <div
              style={{
                fontFamily: FONT.display,
                fontSize: 24,
                color: plan === "monthly" ? COLOR.lime : COLOR.asphalt,
                marginTop: 2,
              }}
            >
              1,500원
            </div>
            <div style={{ fontFamily: FONT.body, fontSize: 11, color: plan === "monthly" ? COLOR.slate : COLOR.slate }}>매월</div>
          </button>

          <button
            onClick={() => setPlan("yearly")}
            className="flex-1 relative rounded-2xl p-4 text-left"
            style={{
              background: plan === "yearly" ? COLOR.asphalt : COLOR.white,
              border: `1.5px solid ${plan === "yearly" ? COLOR.asphalt : COLOR.concreteDark}`,
            }}
          >
            <div
              className="absolute -top-2 right-3 px-2 py-0.5 rounded-full"
              style={{ background: COLOR.red, fontFamily: FONT.body, fontWeight: 800, fontSize: 9, color: COLOR.white }}
            >
              17% 할인
            </div>
            <div style={{ fontFamily: FONT.body, fontWeight: 700, fontSize: 12, color: COLOR.slate }}>연간</div>
            <div
              style={{
                fontFamily: FONT.display,
                fontSize: 24,
                color: plan === "yearly" ? COLOR.lime : COLOR.asphalt,
                marginTop: 2,
              }}
            >
              15,000원
            </div>
            <div style={{ fontFamily: FONT.body, fontSize: 11, color: COLOR.slate }}>월 1,250원 꼴</div>
          </button>
        </div>

        <div className="mt-6" style={{ fontFamily: FONT.body, fontSize: 11, fontWeight: 700, color: COLOR.slate }}>
          구독하면 이런 게 열려요
        </div>
        <div className="mt-2 rounded-2xl overflow-hidden" style={{ background: COLOR.white, border: `1.5px solid ${COLOR.concreteDark}` }}>
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-3"
              style={{ borderBottom: i < FEATURES.length - 1 ? `1px solid ${COLOR.concreteDark}` : "none" }}
            >
              <Check size={14} color={COLOR.asphalt} />
              <span style={{ fontFamily: FONT.body, fontSize: 13, color: COLOR.asphalt }}>{f}</span>
            </div>
          ))}
        </div>

        <p className="mt-4 text-center" style={{ fontFamily: FONT.body, fontSize: 11, color: COLOR.slate }}>
          광고 없이 운영돼요 · 언제든 해지할 수 있어요
        </p>
      </div>

      <div className="px-5 pb-8 pt-2">
        <button
          onClick={() => setDone(true)}
          className="w-full py-4 rounded-2xl"
          style={{ background: COLOR.lime, fontFamily: FONT.body, fontWeight: 800, fontSize: 15, color: COLOR.asphalt }}
        >
          {plan === "yearly" ? "연 15,000원 결제하기" : "월 1,500원 결제하기"}
        </button>
      </div>
    </div>
  );
}

function SettingsOverlay({ onClose }) {
  const [view, setView] = useState("main"); // 'main' | 'editProfile'
  const [nickname, setNickname] = useState("러너");
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const [toggles, setToggles] = useState({ daily: true, group: true, challenge: false });

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: COLOR.concrete }}>
      <StatusBar />
      <div className="flex items-center gap-3 px-5 pt-2 pb-4">
        <button onClick={() => (view === "editProfile" ? setView("main") : onClose())}>
          {view === "editProfile" ? <ChevronLeft size={20} color={COLOR.asphalt} /> : <X size={20} color={COLOR.asphalt} />}
        </button>
        <span style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: 15, color: COLOR.asphalt }}>
          {view === "editProfile" ? "프로필 편집" : "설정"}
        </span>
      </div>

      {view === "main" && (
        <div className="flex-1 overflow-y-auto px-5 pb-8">
          <button
            onClick={() => setView("editProfile")}
            className="w-full flex items-center gap-4 rounded-2xl p-4"
            style={{ background: COLOR.white, border: `1.5px solid ${COLOR.concreteDark}` }}
          >
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: avatarColor }}>
              <span style={{ fontFamily: FONT.display, fontSize: 22, color: COLOR.asphalt }}>{nickname[0]}</span>
            </div>
            <div className="text-left flex-1">
              <div style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: 15, color: COLOR.asphalt }}>{nickname}</div>
              <div style={{ fontFamily: FONT.body, fontSize: 12, color: COLOR.slate }}>프로필 수정</div>
            </div>
            <ChevronLeft size={16} color={COLOR.slate} style={{ transform: "rotate(180deg)" }} />
          </button>

          <div className="mt-6" style={{ fontFamily: FONT.body, fontSize: 11, fontWeight: 700, color: COLOR.slate }}>알림</div>
          <div className="mt-2 rounded-2xl overflow-hidden" style={{ background: COLOR.white, border: `1.5px solid ${COLOR.concreteDark}` }}>
            {[
              { key: "daily", label: "매일 인증 리마인더" },
              { key: "group", label: "그룹원 인증 알림" },
              { key: "challenge", label: "챌린지 소식" },
            ].map((t, i, arr) => (
              <div
                key={t.key}
                className="flex items-center justify-between px-4 py-3.5"
                style={{ borderBottom: i < arr.length - 1 ? `1px solid ${COLOR.concreteDark}` : "none" }}
              >
                <span style={{ fontFamily: FONT.body, fontSize: 13, color: COLOR.asphalt }}>{t.label}</span>
                <Toggle on={toggles[t.key]} onClick={() => setToggles((s) => ({ ...s, [t.key]: !s[t.key] }))} />
              </div>
            ))}
          </div>

          <div className="mt-6" style={{ fontFamily: FONT.body, fontSize: 11, fontWeight: 700, color: COLOR.slate }}>계정</div>
          <div className="mt-2 rounded-2xl overflow-hidden" style={{ background: COLOR.white, border: `1.5px solid ${COLOR.concreteDark}` }}>
            <div className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom: `1px solid ${COLOR.concreteDark}` }}>
              <span style={{ fontFamily: FONT.body, fontSize: 13, color: COLOR.asphalt }}>구독 관리</span>
              <span
                className="px-2 py-1 rounded"
                style={{ fontFamily: FONT.body, fontSize: 10, fontWeight: 700, background: COLOR.concreteDark, color: COLOR.slate }}
              >
                무료 플랜
              </span>
            </div>
            <button className="w-full text-left px-4 py-3.5">
              <span style={{ fontFamily: FONT.body, fontSize: 13, color: COLOR.asphalt }}>로그아웃</span>
            </button>
          </div>

          <button className="w-full mt-4 text-center py-2">
            <span style={{ fontFamily: FONT.body, fontSize: 12, color: COLOR.red }}>회원 탈퇴</span>
          </button>
        </div>
      )}

      {view === "editProfile" && (
        <div className="flex-1 overflow-y-auto px-5 pb-8">
          <div className="flex justify-center mt-2">
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: avatarColor }}>
              <span style={{ fontFamily: FONT.display, fontSize: 30, color: COLOR.asphalt }}>{nickname ? nickname[0] : "?"}</span>
            </div>
          </div>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={8}
            className="w-full mt-6 px-4 py-4 rounded-2xl outline-none text-center"
            style={{
              background: COLOR.white,
              border: `1.5px solid ${COLOR.concreteDark}`,
              fontFamily: FONT.body,
              fontWeight: 700,
              fontSize: 15,
              color: COLOR.asphalt,
            }}
          />
          <div className="flex justify-center gap-3 mt-5">
            {AVATAR_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setAvatarColor(c)}
                className="w-9 h-9 rounded-full"
                style={{
                  background: c,
                  boxShadow: avatarColor === c ? `0 0 0 2px ${COLOR.red}` : "none",
                }}
              />
            ))}
          </div>
          <button
            onClick={() => setView("main")}
            className="w-full mt-8 py-4 rounded-2xl text-center"
            style={{ background: COLOR.lime, fontFamily: FONT.body, fontWeight: 800, fontSize: 15, color: COLOR.asphalt }}
          >
            저장하기
          </button>
        </div>
      )}
    </div>
  );
}

function GroupsOverlay({ onClose, onOpenSubscribe, activeGroupId, onSwitchGroup }) {
  const [view, setView] = useState("list"); // 'list' | 'detail'
  const [selected, setSelected] = useState(MY_GROUPS[0]);

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: COLOR.concrete }}>
      <StatusBar />
      <div className="flex items-center gap-3 px-5 pt-2 pb-4">
        <button onClick={() => (view === "detail" ? setView("list") : onClose())}>
          {view === "detail" ? <ChevronLeft size={20} color={COLOR.asphalt} /> : <X size={20} color={COLOR.asphalt} />}
        </button>
        <span style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: 15, color: COLOR.asphalt }}>
          {view === "detail" ? selected.name : "내 그룹"}
        </span>
      </div>

      {view === "list" && (
        <div className="flex-1 overflow-y-auto px-5 flex flex-col gap-3 pb-8">
          <p style={{ fontFamily: FONT.body, fontSize: 12, color: COLOR.slate }}>탭하면 피드가 전환돼요 · 톱니바퀴는 그룹 관리예요</p>
          {MY_GROUPS.map((g) => (
            <button
              key={g.id}
              onClick={() => {
                onSwitchGroup(g.id);
                onClose();
              }}
              className="flex items-center justify-between rounded-2xl p-4"
              style={{
                background: COLOR.white,
                border: `1.5px solid ${g.id === activeGroupId ? COLOR.lime : COLOR.concreteDark}`,
              }}
            >
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <div style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: 15, color: COLOR.asphalt }}>{g.name}</div>
                  {g.id === activeGroupId && (
                    <span
                      className="px-1.5 py-0.5 rounded"
                      style={{ fontFamily: FONT.body, fontSize: 9, fontWeight: 700, background: COLOR.asphalt, color: COLOR.lime }}
                    >
                      사용중
                    </span>
                  )}
                </div>
                <div style={{ fontFamily: FONT.body, fontSize: 12, color: COLOR.slate }}>{g.members.length}명 참여중</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full" style={{ background: COLOR.asphalt }}>
                  <Flame size={13} color={COLOR.lime} />
                  <span style={{ fontFamily: FONT.mono, fontWeight: 700, color: COLOR.lime, fontSize: 12 }}>{g.streak}</span>
                </div>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelected(g);
                    setView("detail");
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: COLOR.concreteDark }}
                >
                  <Settings size={14} color={COLOR.slate} />
                </div>
              </div>
            </button>
          ))}

          <div className="relative rounded-2xl p-4 overflow-hidden" style={{ background: COLOR.white, border: `1.5px dashed ${COLOR.slate}` }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: COLOR.concreteDark }}>
                <Lock size={15} color={COLOR.slate} />
              </div>
              <div>
                <div style={{ fontFamily: FONT.body, fontWeight: 700, fontSize: 13, color: COLOR.asphalt }}>그룹 추가하기</div>
                <div style={{ fontFamily: FONT.body, fontSize: 11, color: COLOR.slate }}>무료 플랜은 그룹 1개까지예요</div>
              </div>
            </div>
            <button
              onClick={onOpenSubscribe}
              className="w-full mt-3 py-2.5 rounded-xl"
              style={{ background: COLOR.lime, fontFamily: FONT.body, fontWeight: 800, fontSize: 12, color: COLOR.asphalt }}
            >
              월 1,500원으로 그룹 추가
            </button>
          </div>
        </div>
      )}

      {view === "detail" && (
        <div className="flex-1 overflow-y-auto px-5 pb-8">
          <div className="rounded-2xl p-4" style={{ background: COLOR.asphalt }}>
            <div style={{ fontFamily: FONT.body, fontSize: 11, color: COLOR.slate, fontWeight: 700 }}>초대코드</div>
            <div className="flex items-center justify-between mt-2">
              <span style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 22, color: COLOR.lime, letterSpacing: 2 }}>
                {selected.code}
              </span>
              <button className="flex items-center gap-1 px-3 py-2 rounded-full" style={{ background: "#2A2B2E" }}>
                <Copy size={13} color={COLOR.white} />
                <span style={{ fontFamily: FONT.body, fontSize: 11, fontWeight: 700, color: COLOR.white }}>복사</span>
              </button>
            </div>
          </div>

          <div className="mt-5" style={{ fontFamily: FONT.body, fontSize: 11, fontWeight: 700, color: COLOR.slate }}>
            멤버 {selected.members.length}명
          </div>
          <div className="flex flex-col gap-2 mt-2">
            {selected.members.map((m, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: COLOR.white }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full" style={{ background: m.color }} />
                  <span style={{ fontFamily: FONT.body, fontWeight: 700, fontSize: 14, color: COLOR.asphalt }}>{m.name}</span>
                </div>
                {m.isOwner && (
                  <span
                    className="px-2 py-1 rounded"
                    style={{ fontFamily: FONT.body, fontSize: 10, fontWeight: 700, background: COLOR.concreteDark, color: COLOR.slate }}
                  >
                    크루장
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-2">
            {selected.isOwner && (
              <button
                className="w-full py-3 rounded-xl text-center"
                style={{ background: COLOR.white, border: `1.5px solid ${COLOR.concreteDark}`, fontFamily: FONT.body, fontWeight: 700, fontSize: 13, color: COLOR.asphalt }}
              >
                그룹 이름 변경
              </button>
            )}
            <button
              className="w-full py-3 rounded-xl text-center flex items-center justify-center gap-2"
              style={{ background: "transparent", fontFamily: FONT.body, fontWeight: 700, fontSize: 13, color: COLOR.red }}
            >
              <LogOut size={15} color={COLOR.red} />
              {selected.isOwner ? "그룹 삭제하기" : "그룹 나가기"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ChallengeDetailOverlay({ challenge, onClose }) {
  const [joined, setJoined] = useState(challenge.joined);
  const sorted = [...challenge.participants].sort((a, b) => b.progress - a.progress);
  const total = challenge.participants.reduce((s, p) => s + p.progress, 0);
  const isGroupGoal = challenge.groupGoal;
  const numerator = isGroupGoal ? total : sorted[0]?.progress || 0;
  const pct = Math.min(100, Math.round((numerator / challenge.goal) * 100));

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: COLOR.concrete }}>
      <StatusBar />
      <div className="flex items-center gap-3 px-5 pt-2 pb-4">
        <button onClick={onClose}>
          <X size={20} color={COLOR.asphalt} />
        </button>
        <span style={{ fontFamily: FONT.body, fontWeight: 700, fontSize: 13, color: COLOR.slate }}>챌린지</span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4">
        <div className="flex items-center gap-2">
          <span
            className="px-1.5 py-0.5 rounded"
            style={{ fontFamily: FONT.body, fontSize: 9, fontWeight: 700, background: COLOR.asphalt, color: COLOR.lime }}
          >
            {SPORT_LABEL[challenge.sport]}
          </span>
        </div>
        <h1 className="leading-tight mt-1" style={{ fontFamily: FONT.display, fontSize: 30, color: COLOR.asphalt }}>
          {challenge.title}
        </h1>
        <p className="mt-2" style={{ fontFamily: FONT.body, fontSize: 13, color: COLOR.slate, lineHeight: 1.6 }}>
          {challenge.desc}
        </p>
        <div
          className="inline-block mt-3 px-2.5 py-1 rounded"
          style={{ fontFamily: FONT.mono, fontSize: 11, fontWeight: 700, background: COLOR.asphalt, color: COLOR.lime }}
        >
          {challenge.period}
        </div>

        <div className="mt-6 rounded-2xl p-4" style={{ background: COLOR.asphalt }}>
          <div className="flex items-center justify-between">
            <span style={{ fontFamily: FONT.body, fontSize: 11, fontWeight: 700, color: COLOR.slate }}>
              {isGroupGoal ? "그룹 합산 진행률" : "내 진행률"}
            </span>
            <span style={{ fontFamily: FONT.mono, fontSize: 13, fontWeight: 700, color: COLOR.lime }}>
              {isGroupGoal ? total : sorted[0]?.progress || 0}/{challenge.goal}
              {challenge.unit}
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full mt-3" style={{ background: "#3A3B3E" }}>
            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: COLOR.lime }} />
          </div>
        </div>

        <div className="mt-6" style={{ fontFamily: FONT.body, fontSize: 11, fontWeight: 700, color: COLOR.slate }}>
          참여자 순위
        </div>
        <div className="flex flex-col gap-2 mt-2">
          {sorted.map((p, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: COLOR.white }}>
              <div className="flex items-center gap-3">
                <span style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 13, color: i === 0 ? COLOR.red : COLOR.slate }}>
                  {i + 1}
                </span>
                <div className="w-7 h-7 rounded-full" style={{ background: p.color }} />
                <span style={{ fontFamily: FONT.body, fontWeight: 700, fontSize: 14, color: COLOR.asphalt }}>{p.name}</span>
              </div>
              <span style={{ fontFamily: FONT.mono, fontSize: 13, color: COLOR.asphalt }}>
                {p.progress}
                {challenge.unit}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6" style={{ fontFamily: FONT.body, fontSize: 11, fontWeight: 700, color: COLOR.slate }}>
          참여 규칙
        </div>
        <ul className="mt-2 flex flex-col gap-2">
          {challenge.rules.map((r, i) => (
            <li key={i} className="flex items-start gap-2">
              <div className="w-1 h-1 rounded-full mt-2" style={{ background: COLOR.slate }} />
              <span style={{ fontFamily: FONT.body, fontSize: 13, color: COLOR.asphalt, lineHeight: 1.5 }}>{r}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="px-5 pb-8 pt-2">
        <button
          onClick={() => setJoined((j) => !j)}
          className="w-full py-4 rounded-2xl text-center"
          style={{
            background: joined ? "transparent" : COLOR.lime,
            border: joined ? `1.5px solid ${COLOR.slate}` : "none",
            fontFamily: FONT.body,
            fontWeight: 800,
            fontSize: 15,
            color: joined ? COLOR.slate : COLOR.asphalt,
          }}
        >
          {joined ? "챌린지 그만두기" : "참여하기"}
        </button>
      </div>
    </div>
  );
}

const MOCK_STATS = {
  running: { distance: "6.4km", pace: "5'20\"", duration: "34:12" },
  gym: { part: "하체", weight: "90kg", sets: "4set" },
  etc: { activity: "요가", duration: "45분" },
};

function StatBlock({ value, label }) {
  return (
    <div className="text-center flex-1">
      <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 15, color: COLOR.white }}>{value}</div>
      <div style={{ fontFamily: FONT.body, fontSize: 10, color: COLOR.slate, marginTop: 2 }}>{label}</div>
    </div>
  );
}

function UploadModal({ onClose, defaultGroupId }) {
  const [sport, setSport] = useState("running");
  const [stamped, setStamped] = useState(false);
  const [groupId, setGroupId] = useState(defaultGroupId);
  const stats = MOCK_STATS[sport];
  const now = "19:44";
  const targetGroup = MY_GROUPS.find((g) => g.id === groupId) || MY_GROUPS[0];

  const stampLabel =
    sport === "running"
      ? `${now} · ${stats.distance} · ${stats.pace}`
      : sport === "gym"
      ? `${now} · ${stats.part} ${stats.weight}×${stats.sets}`
      : `${now} · ${stats.activity} ${stats.duration}`;

  return (
    <div className="absolute inset-0 flex flex-col overflow-y-auto" style={{ background: COLOR.asphalt }}>
      <div className="flex items-center justify-between px-5 pt-4">
        <button onClick={onClose}><X size={22} color={COLOR.white} /></button>
        <span style={{ fontFamily: FONT.body, fontWeight: 700, color: COLOR.white, fontSize: 13 }}>오늘의 인증</span>
        <div className="w-5" />
      </div>

      {MY_GROUPS.length > 1 && (
        <div className="flex gap-2 justify-center mt-3 px-6 flex-wrap">
          {MY_GROUPS.map((g) => (
            <button
              key={g.id}
              onClick={() => setGroupId(g.id)}
              className="px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5"
              style={{
                fontFamily: FONT.body,
                fontWeight: 700,
                background: groupId === g.id ? "#2A2B2E" : "transparent",
                color: groupId === g.id ? COLOR.lime : COLOR.slate,
                border: `1.5px solid ${groupId === g.id ? COLOR.lime : "#3A3B3E"}`,
              }}
            >
              <Users size={12} /> {g.name}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2 justify-center mt-3">
        {["running", "gym", "etc"].map((s) => (
          <button
            key={s}
            onClick={() => setSport(s)}
            className="px-3.5 py-1.5 rounded-full text-xs"
            style={{
              fontFamily: FONT.body,
              fontWeight: 700,
              background: sport === s ? COLOR.lime : "transparent",
              color: sport === s ? COLOR.asphalt : COLOR.white,
              border: `1.5px solid ${sport === s ? COLOR.lime : COLOR.slate}`,
            }}
          >
            {SPORT_LABEL[s]}
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col items-center px-6 pt-4 pb-8">
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg,#8A9B72,#5F6E4A)" }}>
          {stamped && (
            <div className="absolute top-6 left-6">
              <PostageStamp behind="#8A9B72" className="stamp-pop">{stampLabel}</PostageStamp>
            </div>
          )}
        </div>

        {sport === "running" && (
          <div className="w-full mt-4 rounded-2xl overflow-hidden" style={{ background: "#2A2B2E" }}>
            <div className="h-32 relative">
              <RouteMap route={MY_GROUPS[0].feed[0].route} stroke={COLOR.lime} />
            </div>
            <div className="flex px-4 py-3" style={{ borderTop: "1px solid #3A3B3E" }}>
              <StatBlock value={stats.distance} label="거리" />
              <StatBlock value={stats.pace} label="평균 페이스" />
              <StatBlock value={stats.duration} label="시간" />
            </div>
          </div>
        )}

        {sport === "gym" && (
          <div className="w-full mt-4 rounded-2xl p-4 flex" style={{ background: "#2A2B2E" }}>
            <StatBlock value={stats.part} label="부위" />
            <StatBlock value={stats.weight} label="무게" />
            <StatBlock value={stats.sets} label="세트" />
          </div>
        )}

        {sport === "etc" && (
          <div className="w-full mt-4 rounded-2xl p-4 flex" style={{ background: "#2A2B2E" }}>
            <StatBlock value={stats.activity} label="활동" />
            <StatBlock value={stats.duration} label="시간" />
          </div>
        )}

        {!stamped ? (
          <button
            onClick={() => setStamped(true)}
            className="w-full mt-6 py-4 rounded-2xl"
            style={{ background: COLOR.lime, fontFamily: FONT.body, fontWeight: 800, fontSize: 15, color: COLOR.asphalt }}
          >
            인증하기
          </button>
        ) : (
          <div className="mt-6 text-center">
            <div style={{ fontFamily: FONT.display, fontSize: 22, color: COLOR.lime }}>오늘의 인증 완료</div>
            <div style={{ fontFamily: FONT.body, fontSize: 12, color: COLOR.slate, marginTop: 4 }}>{targetGroup.name}에 인증했어요</div>
            <button
              onClick={onClose}
              className="mt-5 px-6 py-3 rounded-full"
              style={{ background: "#2A2B2E", fontFamily: FONT.body, fontWeight: 700, fontSize: 13, color: COLOR.white }}
            >
              피드로 돌아가기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [onboarded, setOnboarded] = useState(false);
  const [tab, setTab] = useState("feed");
  const [uploading, setUploading] = useState(false);
  const [groupsOpen, setGroupsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [challengeDetail, setChallengeDetail] = useState(null);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [challenges, setChallenges] = useState(CHALLENGES);
  const [activeGroupId, setActiveGroupId] = useState(MY_GROUPS[0].id);
  const activeGroup = MY_GROUPS.find((g) => g.id === activeGroupId) || MY_GROUPS[0];

  const startFromTemplate = (t) => {
    const newChallenge = {
      id: Date.now(),
      title: t.title,
      sport: t.sport,
      groupGoal: t.groupGoal,
      desc: t.desc,
      period: t.period,
      unit: t.unit,
      goal: t.goal,
      days: "방금 시작함",
      joined: true,
      participants: [{ name: "나", color: COLOR.lime, progress: 0 }],
      rules: t.rules,
    };
    setChallenges((prev) => [newChallenge, ...prev]);
    setTemplatesOpen(false);
    setChallengeDetail(newChallenge);
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center py-10" style={{ background: "#D8D5CE" }}>
      <div className="relative w-[375px] h-[780px] rounded-[40px] shadow-2xl overflow-hidden" style={{ background: COLOR.concrete }}>
        <Fonts />
        {!onboarded ? (
          <Onboarding onDone={() => setOnboarded(true)} />
        ) : (
          <div className="h-full flex flex-col">
            <div className="flex-1 relative overflow-hidden">
              {tab === "feed" && <Feed group={activeGroup} onOpenGroups={() => setGroupsOpen(true)} />}
              {tab === "challenge" && (
                <Challenge
                  challenges={challenges}
                  onOpenDetail={(c) => setChallengeDetail(c)}
                  onOpenSubscribe={() => setSubscribeOpen(true)}
                  onOpenTemplates={() => setTemplatesOpen(true)}
                />
              )}
              {tab === "ranking" && <Ranking onOpenSubscribe={() => setSubscribeOpen(true)} />}
              {tab === "mypage" && (
                <MyPage
                  onOpenGroups={() => setGroupsOpen(true)}
                  onOpenSettings={() => setSettingsOpen(true)}
                  onOpenSubscribe={() => setSubscribeOpen(true)}
                />
              )}
              {uploading && <UploadModal onClose={() => setUploading(false)} defaultGroupId={activeGroupId} />}
              {groupsOpen && (
                <GroupsOverlay
                  onClose={() => setGroupsOpen(false)}
                  onOpenSubscribe={() => setSubscribeOpen(true)}
                  activeGroupId={activeGroupId}
                  onSwitchGroup={setActiveGroupId}
                />
              )}
              {settingsOpen && <SettingsOverlay onClose={() => setSettingsOpen(false)} />}
              {subscribeOpen && <SubscribeOverlay onClose={() => setSubscribeOpen(false)} />}
              {templatesOpen && <TemplatePickerOverlay onClose={() => setTemplatesOpen(false)} onStart={startFromTemplate} />}
              {challengeDetail && (
                <ChallengeDetailOverlay challenge={challengeDetail} onClose={() => setChallengeDetail(null)} />
              )}
            </div>
            <BottomNav tab={tab} setTab={setTab} onUpload={() => setUploading(true)} />
          </div>
        )}
      </div>
    </div>
  );
}
