/* global React */

function PolaroidCard({ photo, onClick, index, showLabel }) {
  const { LIGHT_LEAKS } = window;
  return (
    <div
      className="polaroid"
      style={{ '--i': index }}
      onClick={() => onClick && onClick(photo)}
    >
      <div className="polaroid__film">
        <img className="polaroid__img" src={photo.url} alt="" loading="lazy" />
        <div className="polaroid__grain" />
        <div className="polaroid__leak" style={{ background: LIGHT_LEAKS[photo.id % 4] }} />
      </div>
      <div className="polaroid__strip">
        {showLabel && <span className="polaroid__label">@{photo.username}</span>}
      </div>
    </div>
  );
}

window.PolaroidCard = PolaroidCard;
