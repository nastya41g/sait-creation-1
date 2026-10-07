export type Game = {
  id: number;
  title: string;
  genre: string;
  developer: string;
  price: number;
  rating: number;
  image: string;
  description: string;
};

const CDN = "https://cdn.poehali.dev/projects/40188c72-a0d2-418f-8473-3080745e7d30/files/";

export const IMAGES = {
  cyber: CDN + "36b47633-1535-46c5-a0a2-d4ba099e33ba.jpg",
  knight: CDN + "b8e8af11-eed1-492a-a661-c537cacf5f95.jpg",
  space: CDN + "ad5498fb-165a-428b-9e5b-dc0255291960.jpg",
  starfall: CDN + "acb8614e-971a-41b4-950e-9deca0ff5c22.jpg",
  hollow: CDN + "43f03f65-fd9a-4030-b4fc-66502fe72a7a.jpg",
  rally: CDN + "5030b3d3-b094-49cd-80b1-47b584d61e60.jpg",
  pixel: CDN + "783149ac-f476-45b7-885e-f4536aeb4101.jpg",
  rune: CDN + "48438619-8513-4056-aab4-20e640ae9f38.jpg",
};

export const SLIDES = [
  { id: 1, title: "Cyber Drift 2077", price: 2499, image: IMAGES.cyber, tag: "Новинка" },
  { id: 2, title: "Ashen Crown", price: 1999, image: IMAGES.knight, tag: "Новинка недели" },
  { id: 3, title: "Void Runner", price: 1799, image: IMAGES.space, tag: "Ранний доступ" },
];

export const GAMES: Game[] = [
  { id: 1, title: "Starfall Legion", genre: "Стратегия", developer: "Nova Forge", price: 1499, rating: 5, image: IMAGES.starfall, description: "Масштабная стратегия о войне легионов под падающими звёздами." },
  { id: 2, title: "Hollow Pines", genre: "Хоррор", developer: "Ember Lab", price: 899, rating: 4, image: IMAGES.hollow, description: "Туманный лес, заброшенная хижина и тайна, которую лучше не знать." },
  { id: 3, title: "Apex Rally", genre: "Гонки", developer: "Drift Works", price: 1299, rating: 4, image: IMAGES.rally, description: "Раллийные трассы в горах, пыль из-под колёс и честная физика." },
  { id: 4, title: "Runebound", genre: "RPG", developer: "North Hall", price: 1999, rating: 5, image: IMAGES.rune, description: "Северная ролевая сага о магии рун и древних клятвах." },
  { id: 5, title: "Pixel Siege", genre: "Инди", developer: "Tiny Keep", price: 499, rating: 3, image: IMAGES.pixel, description: "Уютная осада крошечного замка — для коротких вечерних сессий." },
  { id: 6, title: "Cyber Drift 2077", genre: "Экшен", developer: "Neon Shift", price: 2499, rating: 5, image: IMAGES.cyber, description: "Ночной город, неоновые трассы и погони на пределе скорости." },
  { id: 7, title: "Ashen Crown", genre: "RPG", developer: "Grey Tower", price: 1999, rating: 4, image: IMAGES.knight, description: "Тёмное фэнтези о рыцаре, который ищет потерянную корону." },
  { id: 8, title: "Void Runner", genre: "Шутер", developer: "Orbit Games", price: 1799, rating: 4, image: IMAGES.space, description: "Космический шутер среди астероидов и колец гигантской планеты." },
];

export const GENRES = ["Экшен", "RPG", "Стратегия", "Гонки", "Хоррор", "Инди", "Шутер", "Симулятор", "Спорт"];

export const formatPrice = (n: number) => n.toLocaleString("ru-RU") + " ₽";
