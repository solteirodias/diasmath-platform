import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ParticipantAvatar } from "@/components/ParticipantAvatar";
import { AVATARS, type AvatarId } from "@/lib/avatars";

export function AvatarSelector({ value, onChange }: { value: AvatarId | null; onChange: (id: AvatarId) => void }) {
  return <div className="avatar-grid" role="group" aria-label="Escolha seu personagem">
    {AVATARS.map((a) => <Button key={a.id} type="button" variant="ghost" aria-label={`${a.name}: ${a.description}`} aria-pressed={value === a.id}
      className={`avatar-card ${value === a.id ? "avatar-card-selected" : ""}`} onClick={() => onChange(a.id)}>
      <ParticipantAvatar avatarId={a.id} className="avatar-card-art" decorative />
      <span className="avatar-card-name">{a.name}</span>
      {value === a.id && <span className="avatar-selected-check"><Check aria-hidden="true" /><span className="sr-only">Selecionado</span></span>}
    </Button>)}
  </div>;
}