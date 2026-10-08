import { LogoMark } from "@/components/Brand";
import { getAvatar } from "@/lib/avatars";

export function ParticipantAvatar({ avatarId, className = "size-12", decorative = false }: {
  avatarId?: string | null | undefined; className?: string; decorative?: boolean;
}) {
  const a = getAvatar(avatarId);
  if (!a) return <span className={`inline-flex shrink-0 items-center justify-center ${className}`} aria-label={decorative ? undefined : "Personagem padrão"}><LogoMark className="size-full" /></span>;
  const robot = a.accessory === "robot";
  const long = ["bob", "long", "braids", "blue", "pink", "pigtails"].includes(a.hair);
  return (
    <svg viewBox="0 0 120 128" role={decorative ? undefined : "img"} aria-hidden={decorative || undefined} aria-label={decorative ? undefined : a.description}
      className={`participant-avatar shrink-0 avatar-skin-${a.skin} avatar-hair-${a.hair} avatar-color-${a.color} ${className}`}>
      <ellipse cx="60" cy="119" rx="34" ry="5" className="avatar-shadow" />
      <circle cx="60" cy="58" r="47" className="avatar-backdrop" />
      <path d="M18 115Q20 85 44 84H76Q101 87 102 115Z" className="avatar-shirt" />
      <path d="M48 85L60 96L72 85" className="avatar-shirt-detail" />
      {robot ? <>
        <path d="M60 26V16" className="avatar-line" /><circle cx="60" cy="13" r="5" className="avatar-shirt" />
        <rect x="22" y="42" width="10" height="27" rx="5" className="avatar-shirt" /><rect x="88" y="42" width="10" height="27" rx="5" className="avatar-shirt" />
        <rect x="29" y="28" width="62" height="55" rx="20" className="avatar-metal" />
        <rect x="37" y="39" width="46" height="26" rx="10" className="avatar-visor" />
        <path d="M45 51h8m-4-4v8m18-4h8m-4-4v8" className="avatar-robot-eyes" />
        <path d="M52 73h16" className="avatar-smile" />
        <path d="M54 105h12m-6-6v12" className="avatar-emblem" />
      </> : <>
        {long && <path d="M28 48Q23 14 60 20Q99 15 92 56L96 92H23Z" className="avatar-hair" />}
        {a.hair === "bun" && <circle cx="60" cy="21" r="16" className="avatar-hair" />}
        {a.hair === "pigtails" && <><ellipse cx="23" cy="64" rx="12" ry="24" className="avatar-hair" /><ellipse cx="97" cy="64" rx="12" ry="24" className="avatar-hair" /></>}
        {a.accessory === "dino" && <><path d="M21 74Q16 15 60 14Q104 15 99 74Z" className="avatar-shirt" /><path d="M41 18l6-12 9 9 8-12 8 14 10-7 4 15" className="avatar-dino-spikes" /></>}
        <rect x="50" y="73" width="20" height="20" rx="8" className="avatar-skin" />
        <circle cx="30" cy="58" r="7" className="avatar-skin" /><circle cx="90" cy="58" r="7" className="avatar-skin" />
        <path d="M30 45Q30 23 60 23Q90 23 90 45V61Q89 85 60 88Q31 85 30 61Z" className="avatar-skin" />
        <path d="M29 48Q23 22 49 21Q76 9 91 31L92 48Q80 47 76 32Q63 48 37 40L34 52Z" className="avatar-hair" />
        {a.hair === "curls" && <>{[31, 43, 55, 67, 79, 89].map((x,i) => <circle key={x} cx={x} cy={i === 0 || i === 5 ? 36 : 26} r="11" className="avatar-hair" />)}</>}
        {a.hair === "braids" && <><path d="M28 42v43m64-43v43" className="avatar-braids" /><circle cx="28" cy="87" r="4" className="avatar-shirt" /><circle cx="92" cy="87" r="4" className="avatar-shirt" /></>}
        <ellipse cx="45" cy="57" rx="3.5" ry="5" className="avatar-eye" /><ellipse cx="75" cy="57" rx="3.5" ry="5" className="avatar-eye" />
        <circle cx="44" cy="55" r="1.2" className="avatar-highlight" /><circle cx="74" cy="55" r="1.2" className="avatar-highlight" />
        <ellipse cx="39" cy="68" rx="6" ry="3" className="avatar-cheek" /><ellipse cx="81" cy="68" rx="6" ry="3" className="avatar-cheek" />
        <path d="M51 73Q60 81 69 73" className="avatar-smile" />
        {a.accessory === "glasses" && <><circle cx="44" cy="58" r="11" className="avatar-glasses" /><circle cx="76" cy="58" r="11" className="avatar-glasses" /><path d="M55 57h10m-36-2h4m54 0h4" className="avatar-line" /></>}
        {a.accessory === "headphones" && <><path d="M25 56V44Q25 12 60 14Q95 12 95 44V56" className="avatar-headband" /><rect x="20" y="47" width="13" height="25" rx="6" className="avatar-shirt" /><rect x="87" y="47" width="13" height="25" rx="6" className="avatar-shirt" /></>}
        {a.accessory === "cap" && <><path d="M28 39Q27 12 60 15Q89 15 92 39Z" className="avatar-shirt" /><path d="M22 40Q60 30 97 40L92 47H22Z" className="avatar-cap" /><path d="M57 23h8m-4-4v8" className="avatar-emblem" /></>}
        {a.accessory === "sport" && <><path d="M30 43Q60 37 90 43" className="avatar-sport-band" /><text x="60" y="111" textAnchor="middle" className="avatar-jersey">10</text></>}
        {a.accessory === "bow" && <path d="M77 27l-10-9v18l10-9 12-9v18Z" className="avatar-shirt" />}
      </>}
      {a.accessory === "book" && <><path d="M34 96l26 5 26-5v23l-26 5-26-5Z" className="avatar-book" /><path d="M60 102v20m-19-17 12 2m15 0 12-2m-39 7 12 2m15 0 12-2" className="avatar-page-lines" /><circle cx="33" cy="110" r="6" className="avatar-skin" /><circle cx="87" cy="110" r="6" className="avatar-skin" /></>}
      {a.accessory === "tablet" && <><rect x="37" y="96" width="46" height="29" rx="5" className="avatar-visor" /><rect x="42" y="100" width="36" height="20" rx="2" className="avatar-metal" /><path d="M55 110h10m-5-5v10" className="avatar-line" /><circle cx="36" cy="110" r="5" className="avatar-skin" /><circle cx="84" cy="110" r="5" className="avatar-skin" /></>}
    </svg>
  );
}