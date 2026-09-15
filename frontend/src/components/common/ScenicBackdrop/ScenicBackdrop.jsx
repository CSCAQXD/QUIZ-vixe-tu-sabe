import "./ScenicBackdrop.css";

function ScenicBackdrop({
  fenceClassName = "",
  groundClassName = "",
}) {
  return (
    <>
      <img
        alt=""
        aria-hidden="true"
        className={`scenic-backdrop__fence ${fenceClassName}`.trim()}
        src="/assets/illustrations/cerca.svg"
      />
      <img
        alt=""
        aria-hidden="true"
        className={`scenic-backdrop__ground ${groundClassName}`.trim()}
        src="/assets/illustrations/muro-tijolos.svg"
      />
    </>
  );
}

export default ScenicBackdrop;
