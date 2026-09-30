/** Workshop gallery slides. Notes are PLACEHOLDER until Jesse writes them (evidence rule): they are shown when a slide is opened. */
export interface GallerySlide {
  readonly title: string;
  readonly src: string;
  readonly video?: string;
  /** Width / height of the picture, so the card is the right shape before it loads. */
  readonly aspect: number;
  readonly note: string;
  /** Real description, written by Jesse. Absent until he supplies it: the lightbox then shows a marked "Caption to come" slot (never invented copy). */
  readonly caption?: string;
  /** Real meta lines (materials, place, date...), only ever facts Jesse has supplied. */
  readonly details?: readonly string[];
}

export const GALLERY_SLIDES: readonly GallerySlide[] = [
  { title: "The workshop", src: "/assets/carousel/clip1.jpg", aspect: 16 / 9, video: "/assets/carousel/clip1.mp4", note: "PLACEHOLDER (Jesse to write): 2-3 sentences about “The workshop”: what you are looking at, who made it and why it matters. Not final copy." },
  { title: "On the machine", src: "/assets/carousel/clip2.jpg", aspect: 9 / 16, video: "/assets/carousel/clip2.mp4", note: "PLACEHOLDER (Jesse to write): 2-3 sentences about “On the machine”: what you are looking at, who made it and why it matters. Not final copy." },
  { title: "The finished bag", src: "/assets/carousel/clip3.jpg", aspect: 9 / 16, video: "/assets/carousel/clip3.mp4", note: "PLACEHOLDER (Jesse to write): 2-3 sentences about “The finished bag”: what you are looking at, who made it and why it matters. Not final copy." },
  { title: "Sanchez Custom", src: "/assets/carousel/workshop.jpg", aspect: 16 / 9, note: "PLACEHOLDER (Jesse to write): 2-3 sentences about “Sanchez Custom”: what you are looking at, who made it and why it matters. Not final copy." },
  { title: "Out in the world", src: "/assets/carousel/clip4.jpg", aspect: 9 / 16, video: "/assets/carousel/clip4.mp4", note: "PLACEHOLDER (Jesse to write): 2-3 sentences about “Out in the world”: what you are looking at, who made it and why it matters. Not final copy." },
  { title: "Tools of the trade", src: "/assets/carousel/clip5.jpg", aspect: 9 / 16, video: "/assets/carousel/clip5.mp4", note: "PLACEHOLDER (Jesse to write): 2-3 sentences about “Tools of the trade”: what you are looking at, who made it and why it matters. Not final copy." },
];
