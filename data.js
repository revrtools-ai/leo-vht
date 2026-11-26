// Contenu du site : tout ce qui change souvent est ici.
window.SITE = {
  name: "Léo VHT",                       // À confirmer
  role: "Photographe & vidéaste",
  city: "Paris",
  email: "contact@exemple.fr",           // À remplacer
  instagram: "https://instagram.com/",   // À remplacer
};




window.CATEGORIES = ["Événementiel", "Portrait", "Sport", "Marque", "Lieux & food"];

// ——— Page d'accueil (la planche) ———
// Les photos qui s'affichent sur l'accueil. Pas besoin d'un dossier à part : il suffit de les lister ici.
// Un nom = une photo du dossier img, sans « -s » ni « .webp » (psg-01 = img/psg-01.webp).
// Une ligne par projet ; le site les mélange tout seul et les répète sur la planche infinie.
// Un clic sur une photo ouvre son projet. Liste vide [] = 3 photos par projet, choisies automatiquement.
window.ACCUEIL = [
  "psg-01", "psg-05", "psg-08",
  "cannes-01", "cannes-06", "cannes-10",
  "vitality-03", "vitality-01", "vitality-05",
  "zerance-03", "zerance-01", "zerance-06",
  "irmao-02", "irmao-01", "irmao-05",
  "leroy-merlin-01", "leroy-merlin-06", "leroy-merlin-10",
  "ratp-05", "ratp-01", "ratp-06",
  "kimpembe-02", "kimpembe-03", "kimpembe-04",
  "rohan-chabot-02", "rohan-chabot-01", "rohan-chabot-04",
  "bilal-01", "bilal-04", "bilal-06",
  "bnp-06", "bnp-01", "bnp-05",
  "veolia-02", "veolia-01", "veolia-05",
  "new3dge-01", "new3dge-05", "new3dge-07",
  "wine-tasting-04", "wine-tasting-01", "wine-tasting-05",
  "chez-simone-03", "chez-simone-01", "chez-simone-07",
  "apb-01", "apb-05", "apb-07",
];

// ——— Vidéos (onglet « Vidéos » de la page Projets) ———
// video  : lien YouTube ou Vimeo (le plus simple), ou fichier MP4 posé dans site/video/ (ex. "video/ratp.mp4")
// poster : image d'aperçu, ex. "img/ratp-03.webp" (facultatif pour YouTube : prise automatiquement)
// format : "vertical" pour une vidéo 9:16 (reel, TikTok), sinon horizontale 16:9
// Exemple à copier sous la ligne « window.VIDEOS = [ » en enlevant les // :
//   { title: "Aftermovie RATP", client: "Centre bus", cat: "Marque", type: "Film corporate", year: "2025",
//     video: "https://vimeo.com/123456789", poster: "img/ratp-01.webp" },
window.VIDEOS = [
];

// images : nombre de photos dans site/img (<slug>-01.webp, -02…)
// cover : photo de couverture · tile : vignette de la grille (recadrée en 3:2) · pos : cadrage de la vignette
window.PROJECTS = [
  { slug: "psg", title: "Lendemain de victoire", client: "Finale LDC · Paris", cat: "Sport", type: "Reportage de rue", year: "2025", images: 8, cover: 1, tile: 1,
    text: "La nuit qui a suivi la victoire en Ligue des champions, au milieu des supporters : fumigènes, drapeaux et visages." },
  { slug: "cannes", title: "Festival de Cannes", client: "Saudi Film Commission", cat: "Événementiel", type: "Reportage événement", year: "", images: 10, cover: 1, tile: 1,
    text: "Rencontres, interviews et coulisses du pavillon sur la Croisette, pendant toute la durée du festival." },
  { slug: "vitality", title: "IEM Dallas", client: "Team Vitality", cat: "Sport", type: "Esport · scène", year: "2025", images: 8, cover: 1, tile: 3,
    text: "De la tension des matchs à la remise du trophée, au plus près des joueurs." },
  { slug: "zerance", title: "Zerance", client: "Club esport", cat: "Sport", type: "Campagne · LAN · événement", year: "2024", images: 10, cover: 1, tile: 3, pos: "50% 40%",
    text: "Lancement de maillot, affiches de saison et compétitions : l'image d'un club du shooting au tournoi." },
  { slug: "irmao", title: "Irmao", client: "Traiteur", cat: "Lieux & food", type: "Photo culinaire", year: "", images: 8, cover: 1, tile: 2,
    text: "Deux séances pour la carte d'un traiteur : dressage, gestes et matières sur fond sombre." },
  { slug: "leroy-merlin", title: "Leroy Merlin", client: "Pub 100 ans · Saga", cat: "Marque", type: "Backstage de tournage", year: "", images: 10, cover: 1, tile: 1,
    text: "Les coulisses de deux films publicitaires : équipe, comédiens, retours plateau." },
  { slug: "ratp", title: "RATP", client: "Centre bus", cat: "Marque", type: "Réseaux sociaux · pub · reportage", year: "", images: 10, cover: 1, tile: 5,
    text: "Le quotidien d'un centre bus raconté par celles et ceux qui le font tourner." },
  { slug: "kimpembe", title: "Presnel Kimpembe", client: "Portrait · événement", cat: "Portrait", type: "Portrait", year: "2025", images: 4, cover: 2, tile: 2, pos: "50% 35%",
    text: "Un portrait posé, entre lumière basse et sculptures, en marge d'un événement." },
  { slug: "rohan-chabot", title: "Cabinet Rohan-Chabot", client: "Avocats", cat: "Portrait", type: "Portraits corporate", year: "2024", images: 6, cover: 1, tile: 2, pos: "50% 25%",
    text: "Portraits de l'équipe et photos des bureaux pour le nouveau site du cabinet." },
  { slug: "bilal", title: "Bilal El Atreby", client: "Portrait d'artiste", cat: "Portrait", type: "Portrait", year: "2022", images: 6, cover: 1, tile: 1, pos: "50% 35%",
    text: "Une série en studio autour d'une attitude : posée, puis tout l'inverse." },
  { slug: "bnp", title: "BNP Paribas AM", client: "Siège · La Défense", cat: "Lieux & food", type: "Reportage lieux", year: "", images: 8, cover: 1, tile: 6,
    text: "Les nouveaux espaces de travail, du hall au rooftop, pour la communication interne." },
  { slug: "veolia", title: "Veolia", client: "Terra Academia · Recyclerie", cat: "Événementiel", type: "Conférences · ateliers", year: "2022", images: 7, cover: 1, tile: 2, pos: "50% 30%",
    text: "Tables rondes, ateliers participatifs et portraits d'intervenants." },
  { slug: "new3dge", title: "New3dge", client: "Graduation show · jury", cat: "Événementiel", type: "Reportage événement", year: "2024–2026", images: 7, cover: 1, tile: 1,
    text: "Trois éditions du salon de l'école : projections, rencontres pros et jurys." },
  { slug: "wine-tasting", title: "Wine Tasting", client: "Soirée dégustation", cat: "Événementiel", type: "Reportage événement", year: "2024", images: 8, cover: 1, tile: 4,
    text: "Une dégustation dans un appartement haussmannien : bouteilles, gestes et conversations." },
  { slug: "chez-simone", title: "Chez Simone", client: "Ateliers Sissy · Pauline Torres", cat: "Marque", type: "Événement bien-être", year: "2025", images: 11, cover: 1, tile: 3,
    text: "Deux ateliers sport et yoga avec leurs coachs, pour les réseaux du studio." },
  { slug: "apb", title: "Groupe APB", client: "Isolation · chauffage · solaire", cat: "Marque", type: "Photo de marque", year: "", images: 7, cover: 1, tile: 1,
    text: "Les équipes sur chantier, des toits aux chaufferies, pour le site et les campagnes." },
];
