export const AVATARS = [
  { id: "avatar-01", name: "Lia", description: "Menina negra com cabelo cacheado e livro", skin: "deep", hair: "curls", color: "coral", accessory: "book" },
  { id: "avatar-02", name: "Theo", description: "Menino de cabelo castanho com fones", skin: "light", hair: "short", color: "blue", accessory: "headphones" },
  { id: "avatar-03", name: "Yumi", description: "Menina de cabelo preto com óculos", skin: "warm", hair: "bob", color: "mint", accessory: "glasses" },
  { id: "avatar-04", name: "Davi", description: "Menino negro com boné amarelo", skin: "deep", hair: "short", color: "gold", accessory: "cap" },
  { id: "avatar-05", name: "Bia", description: "Menina com cabelo rosa e tablet", skin: "light", hair: "pink", color: "pink", accessory: "tablet" },
  { id: "avatar-06", name: "Caio", description: "Estudante com moletom de dinossauro", skin: "tan", hair: "short", color: "mint", accessory: "dino" },
  { id: "avatar-07", name: "Spri", description: "Robô DIASMATH com antena e símbolo de soma", skin: "light", hair: "short", color: "blue", accessory: "robot" },
  { id: "avatar-08", name: "Nina", description: "Menina ruiva com duas marias-chiquinhas", skin: "light", hair: "pigtails", color: "gold", accessory: "none" },
  { id: "avatar-09", name: "Iago", description: "Menino esportivo com faixa na cabeça", skin: "tan", hair: "short", color: "coral", accessory: "sport" },
  { id: "avatar-10", name: "Maya", description: "Menina de pele escura com tranças e óculos", skin: "deep", hair: "braids", color: "pink", accessory: "glasses" },
  { id: "avatar-11", name: "Leo", description: "Menino loiro com um livro", skin: "light", hair: "blond", color: "mint", accessory: "book" },
  { id: "avatar-12", name: "Sofia", description: "Menina de cabelo azul com fones", skin: "tan", hair: "blue", color: "blue", accessory: "headphones" },
  { id: "avatar-13", name: "Ravi", description: "Menino de pele morena com óculos redondos", skin: "warm", hair: "short", color: "gold", accessory: "glasses" },
  { id: "avatar-14", name: "Zoe", description: "Menina negra com coque e tablet", skin: "deep", hair: "bun", color: "coral", accessory: "tablet" },
  { id: "avatar-15", name: "Tom", description: "Menino ruivo com boné azul", skin: "light", hair: "red", color: "blue", accessory: "cap" },
  { id: "avatar-16", name: "Ayla", description: "Menina de cabelo longo e preto com livro", skin: "tan", hair: "long", color: "mint", accessory: "book" },
  { id: "avatar-17", name: "Gui", description: "Menino negro com cabelo cacheado e fones", skin: "deep", hair: "curls", color: "pink", accessory: "headphones" },
  { id: "avatar-18", name: "Luna", description: "Menina loira esportiva com faixa", skin: "light", hair: "blond", color: "gold", accessory: "sport" },
  { id: "avatar-19", name: "Noah", description: "Menino de cabelo verde com tablet", skin: "warm", hair: "green", color: "mint", accessory: "tablet" },
  { id: "avatar-20", name: "Mel", description: "Menina morena com cabelo cacheado e laço", skin: "tan", hair: "curls", color: "coral", accessory: "bow" },
] as const;

export type AvatarId = (typeof AVATARS)[number]["id"];
export function isAvatarId(value: unknown): value is AvatarId {
  return AVATARS.some((avatar) => avatar.id === value);
}
export function getAvatar(value: string | null | undefined) {
  return AVATARS.find((avatar) => avatar.id === value);
}