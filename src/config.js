export const config = {
  // ✏️ EDIT THESE
  herName: "Trixie",
  fromName: "Macky",

  // Ang araw na naging kayo (YYYY-MM-DD). Dito kinukuha ang bilang ng buwan.
  // Oct 30, 2026 = 3rd monthsary, kaya July 30, 2026 ang start.
  startDate: "2026-07-30",

  // Pang-test lang: lagyan ng number (hal. 3) para makita ang 3 tulips ngayon.
  // Gawing null ulit bago i-push.
  monthOverride: null,

  // Ilang malalaking 3D tulips ang nasa harap (pinakabagong mga buwan).
  // Ang mas luma ay napupunta sa maliit na hanay sa ibaba para
  // hindi bumigat ang page kahit tumagal ang inyong kwento. 6 ang maganda.
  featuredCount: 6,

  // Isang message kada tulip, sunod-sunod: message #1 sa 1st monthsary,
  // #2 sa 2nd, at iba pa. May 36 dito (3 taon). Kapag naubos, umuulit
  // mula sa umpisa, kaya dagdagan mo ito bago dumating ang 36th monthsary 💗
  // Palitan mo kahit ilan para mas maging "ikaw" ang tunog.
  messages: [
    "ikaw talaga ang pinaka magandang nangyari sakin from 2022 until now.",
    "sobrang saya ko dahil dumating ka at nakilala kita.",
    "mahal na mahal kitaa bebee, sobrang thankful ako sa lahat ng moments natin.",
    "pangakong dito lang ako para sayo, kahit anong mangyari.",
    "di ko alam pano ko sasabihin sayo kung gaano kita kamahal, pero sana ramdam mo.",
    "sana sa ganitong paraan, ramdam mo kung gaano kita kamahal.",
    "di ako magaling sa mga ganitong bagay kaya eto nalang ginawa ko for u hehe",
    "ang bilis ng oras pag ikaw kasama ko, sana pwede i pause minsan.",
    "thank you kasi lagi mo ko iniintindi kahit minsan ang kulit ko HAHAHA",
    "kahit pagod ako, gusto pa rin kita kausap at makasama.",
    "ikaw yung isa sa mga bagay na ayokong mawala sakin.",
    "ikaw pahinga ko sa lahat ng nakakapagod na bagay.",
    "iba talaga feeling pag ikaw nag message sakin hehe.",
    "di naman laging perfect lahat satin pero masaya ako kasi ikaw kasama ko.",
    "sana makasama kita sa lahat ng gusto ko pang ma achieve sa buhay.",
    "sorry pag ang kulit kulit ko minsan, mahal na mahal kasi kita eh HAHAHA",
    "kahit ilang months or years pa lumipas, ikaw pa rin gusto ko.",
    "favorite person ko talaga ikaw, kahit minsan inaasar mo ko HAHAHA",
    "simple lang to pero pinag effortan ko talaga para sayo.",
    "ikaw pa rin pipiliin ko palagi, walang eme.",
    "miss ko na agad yakap mo kahit kakakita lang natin minsan HAHAHA",
    "di ko alam ano mangyayari satin in the future pero gusto ko ikaw kasama ko.",
    "mas ginaganahan ako sa buhay kasi nandyan ka.",
    "mahal kita kahit sa mga araw na di tayo okay, aayusin pa rin natin.",
    "minsan napapaisip ako sa future pero masaya ako pag iniisip kong kasama kita.",
    "ikaw talaga favorite part ng araw ko.",
    "kinikilig pa rin ako sayo hanggang ngayon, grabe ka HAHAHA",
    "sa lahat ng tao ikaw talaga gusto ko, ikaw lang naman eh.",
    "more monthsary pa satin mahal ko, marami pa tayong dates na icecelebrate hehe.",
    "ikaw pa rin naman talaga, sino pa ba HAHAHA",
    "alam kong di ako perfect pero i promise na susubukan ko lagi maging better para satin.",
    "pag masaya ka, masaya na rin ako hehe.",
    "thank you sa tiwala mo sakin, di ko sasayangin yun.",
    "kung may pinaka magandang dumating sa buhay ko, ikaw na yun.",
    "kahit wala tayong ginagawa basta kasama kita, okay na ko.",
    "minsan naiisip ko pano kaya buhay ko kung di kita nakilala HAHAHA.",
    "kahit ang daming problema, gumagaan lahat pag ikaw kausap ko.",
    "sana sa mga susunod na taon tayo pa rin, magkasama pa rin.",
    "parang araw araw mas lalo kitang minamahal, pano ba yan HAHAHA",
    "thank you kasi kahit minsan mahirap akong intindihin, nandyan ka pa rin.",
    "kung uulitin ko lahat from the start, ikaw pa rin talaga gusto kong makilala.",
  ],

  // Lalabas pagkatapos mabuksan lahat ng tulips
  finale: {
    title: "Para sa’yo, mahal ko",
    text:
      "Hindi ko pa kayang bumili ng bouquet,\n" +
      "kaya ginawa ko na lang ito para sa’yo.\n\n" +
      "Every 30th, may bagong bulaklak. Promise. 🌷",
  },

  // Lalabas pagkatapos mabuksan lahat ng tulips sa bouquet tuwing anniversary
  // (12th, 24th, 36th... na buwan). Ang {years} ay napapalitan ng bilang ng taon.
  anniversaryFinale: {
    title: "Isang bouquet para sa’yo",
    text:
      "Isang bulaklak kada buwan, hanggang naging bouquet.\n\n" +
      "Salamat sa {years} taon, mahal ko.\n" +
      "Marami pa tayong bubuuin na ganito. 💐",
  },

  intro: { title: "I made something for you", button: "Tap to open" },

  music: {
    type: "youtube",
    youtubeId: "8lbRDzhjqeM",
    file: "/song.mp3",
    volume: 0.6,
    startAt: 123,
  },
  couplePhoto: "/us.jpg",

  // Countdown lock: she can't open the gift until this date/time
  unlockAt: "2026-10-30T00:00:00", // oras ng phone niya (12:00 AM ng 30th)
  previewKey: "macky123", // palitan mo, sikreto mo lang ito
  lock: {
    title: "Something is blooming...",
    hint: "Come back on the 30th 💗",
  },

  // Tulip colors (tip → middle → base). Repeats when it runs out.
  palettes: [
    { c1: "#ffc2d9", c2: "#ff5c9d", c3: "#b8135a" }, // pink
    { c1: "#ff8a8a", c2: "#e5243b", c3: "#8f0f26" }, // red
    { c1: "#fff3a0", c2: "#ffc83d", c3: "#d98a00" }, // yellow
    { c1: "#e0b3ff", c2: "#a855f7", c3: "#5b1d99" }, // purple
    { c1: "#ffd0a8", c2: "#ff8a4c", c3: "#c2410c" }, // orange
    { c1: "#ffffff", c2: "#fbd5e5", c3: "#d99ab5" }, // white
    { c1: "#ff9be0", c2: "#e81cb5", c3: "#7a0a62" }, // magenta
    { c1: "#d6f0ff", c2: "#7cc4ff", c3: "#2a6fb8" }, // sky blue
    { c1: "#ffb199", c2: "#ff6b5b", c3: "#b32d1f" }, // coral
    { c1: "#d8fff0", c2: "#6fe3b5", c3: "#1f8f6a" }, // mint
    { c1: "#f0e6ff", c2: "#c4a1ff", c3: "#7c5cc4" }, // lavender
    { c1: "#d46a8a", c2: "#8e1b44", c3: "#4a0a24" }, // wine
  ],
};
