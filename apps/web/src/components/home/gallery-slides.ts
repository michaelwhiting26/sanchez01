/** Workshop gallery slides. Notes are PLACEHOLDER until Jesse writes them (evidence rule): they are shown when a slide is opened. */
export interface GallerySlide {
  readonly title: string;
  readonly src: string;
  readonly video?: string;
  readonly note: string;
}

export const GALLERY_SLIDES: readonly GallerySlide[] = [
  { title: "The workshop", src: "/assets/carousel/clip1.jpg", video: "/assets/carousel/clip1.mp4", note: "PLACEHOLDER (Jesse to write): 2-3 sentences about “The workshop”: what you are looking at, who made it and why it matters. Not final copy." },
  { title: "On the machine", src: "/assets/carousel/clip2.jpg", video: "/assets/carousel/clip2.mp4", note: "PLACEHOLDER (Jesse to write): 2-3 sentences about “On the machine”: what you are looking at, who made it and why it matters. Not final copy." },
  { title: "The finished bag", src: "/assets/carousel/clip3.jpg", video: "/assets/carousel/clip3.mp4", note: "PLACEHOLDER (Jesse to write): 2-3 sentences about “The finished bag”: what you are looking at, who made it and why it matters. Not final copy." },
  { title: "Sanchez Custom", src: "/assets/carousel/workshop.jpg", note: "PLACEHOLDER (Jesse to write): 2-3 sentences about “Sanchez Custom”: what you are looking at, who made it and why it matters. Not final copy." },
  { title: "Out in the world", src: "/assets/carousel/clip4.jpg", video: "/assets/carousel/clip4.mp4", note: "PLACEHOLDER (Jesse to write): 2-3 sentences about “Out in the world”: what you are looking at, who made it and why it matters. Not final copy." },
  { title: "Tools of the trade", src: "/assets/carousel/clip5.jpg", video: "/assets/carousel/clip5.mp4", note: "PLACEHOLDER (Jesse to write): 2-3 sentences about “Tools of the trade”: what you are looking at, who made it and why it matters. Not final copy." },
];
