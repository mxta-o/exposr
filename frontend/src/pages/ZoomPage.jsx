/* global React */
const { useEffect } = React;

function ZoomPage({ photo, onBack, onProfileClick }) {
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onBack(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onBack]);

  return (
    <div className="zoom-page" onClick={onBack}>
      <div className="zoom-polaroid" onClick={(e) => e.stopPropagation()}>
        <div className="zoom-polaroid__film">
          <img className="zoom-polaroid__img" src={photo.url} alt="" />
          <div className="polaroid__grain" />
          <div className="polaroid__leak" style={{ background: window.LIGHT_LEAKS[photo.id % 4] }} />
        </div>
        <div className="zoom-polaroid__strip">
          <button className="zoom-username" onClick={() => onProfileClick(photo.username)}>
            @{photo.username}
          </button>
        </div>
      </div>
    </div>
  );
}

window.ZoomPage = ZoomPage;
