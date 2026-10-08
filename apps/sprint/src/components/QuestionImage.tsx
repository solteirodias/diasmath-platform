import { useState } from "react";
import { ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useQuestionImage } from "@/hooks/use-question-image";

export function QuestionImage({ path, legacyUrl, playerId, questionId, large = false }: {
  path?: string | null | undefined; legacyUrl?: string | null | undefined; playerId?: string | undefined; questionId?: string | undefined; large?: boolean;
}) {
  const { url, error } = useQuestionImage(path, legacyUrl, playerId, questionId);
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(false);
  if (!path && !legacyUrl) return null;
  if (!url) return <p role="status" className="py-6 text-sm text-ash">{error || "Carregando imagem…"}</p>;
  return <>
    <div className="relative w-full">
      <Button variant="ghost" className="h-auto w-full p-0 whitespace-normal hover:bg-transparent" aria-label="Ampliar imagem da questão" onClick={() => setOpen(true)}>
        <img src={url} alt="Imagem da questão" className={`w-full object-contain rounded-lg ${large ? "max-h-[65vh]" : "max-h-[55vh]"}`} />
      </Button>
      <Button variant="secondary" size="icon" className="absolute right-2 bottom-2" title="Ampliar imagem" aria-label="Ampliar imagem" onClick={() => setOpen(true)}><ZoomIn /></Button>
    </div>
    <Dialog open={open} onOpenChange={(value) => { setOpen(value); setZoom(false); }}>
      <DialogContent className="max-w-[96vw] max-h-[94vh] bg-paper text-ink p-4">
        <DialogTitle>Imagem da questão</DialogTitle>
        <Button variant="outline" className="justify-self-start" onClick={() => setZoom(!zoom)}>{zoom ? <ZoomOut /> : <ZoomIn />}{zoom ? "Ajustar imagem" : "Zoom"}</Button>
        <div className="overflow-auto max-h-[76vh]">
          <img src={url} alt="Imagem da questão ampliada" className={zoom ? "max-w-none w-[200%] object-contain" : "w-full max-h-[76vh] object-contain"} />
        </div>
      </DialogContent>
    </Dialog>
  </>;
}