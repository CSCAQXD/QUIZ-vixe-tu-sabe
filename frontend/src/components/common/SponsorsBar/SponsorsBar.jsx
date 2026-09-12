import "./SponsorsBar.css";

const SPONSORS = [
  {
    alt: "Instituto Dragão do Mar",
    className: "sponsors-bar__logo sponsors-bar__logo--dragao",
    src: "/assets/brand/dragao-do-mar.svg",
  },
  {
    alt: "Casa de Saberes Cego Aderaldo",
    className: "sponsors-bar__logo sponsors-bar__logo--casa",
    src: "/assets/brand/casa-de-saberes.svg",
  },
  {
    alt: "Governo do Ceará",
    className: "sponsors-bar__logo sponsors-bar__logo--ceara",
    src: "/assets/brand/governo-ceara.svg",
  },
];

function SponsorsBar({ className = "" }) {
  return (
    <aside aria-label="Realização e apoio" className={`sponsors-bar ${className}`.trim()}>
      {SPONSORS.map((sponsor) => (
        <img
          alt={sponsor.alt}
          className={sponsor.className}
          key={sponsor.src}
          src={sponsor.src}
        />
      ))}
    </aside>
  );
}

export default SponsorsBar;
