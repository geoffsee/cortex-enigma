export const CATEGORIES: Record<string, string[]> = {
  MEDIUM: ["painting", "drawing", "print", "sculpture", "photo", "video", "installation", "digital", "textile", "hybrid"],
  METHOD: ["carve", "cast", "model", "assemble", "paint", "draw", "print", "stitch", "code", "project"],
  SUBJECT: ["figure", "nature", "object", "narrative", "abstraction", "concept", "society"],
  STYLE: ["naturalist", "realist", "idealized", "symbolic", "expressive", "abstract", "conceptual", "surreal"],
  ELEMENTS: ["geometric", "organic", "chiaroscuro", "minimalist", "layered", "atmospheric", "volumetric", "planar"],
  FUNCTION: ["ritual", "decorative", "documentary", "political", "commercial", "contemplative", "critical"],
  CONTEXT: ["studio", "public", "sacred", "domestic", "institutional", "networked", "environmental"],
  HISTORY: ["prehistoric", "ancient", "medieval", "early modern", "modern", "postmodern", "contemporary"]
};

export const CATEGORY_TOOLTIPS: Record<string, string> = {
  MEDIUM: "What the artwork is made from or how it appears — e.g. oil painting, sculpture, digital art.",
  METHOD: "How the artwork is physically created — e.g. carved from stone, stitched by hand, or built with code.",
  SUBJECT: "What the artwork depicts or explores — e.g. the human figure, nature scenes, or pure abstraction.",
  STYLE: "The visual approach or aesthetic mood — e.g. realistic, dreamlike (surreal), or boldly expressive.",
  ELEMENTS: "The visual ingredients at play — e.g. hard geometric shapes, dramatic light and shadow, or soft atmospheric haze.",
  FUNCTION: "Why the artwork exists or what it does — e.g. purely decorative, making a political point, or inviting quiet reflection.",
  CONTEXT: "Where or how the artwork is meant to be seen — e.g. in a private studio, a public space, or experienced online.",
  HISTORY: "The art-historical period or movement the work draws from — e.g. medieval, modernist, or contemporary.",
};
