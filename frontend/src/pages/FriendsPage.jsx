/* global React */
const { useMemo } = React;

function FriendsPage({ feed, onPhotoClick }) {
  const { PolaroidCard } = window;
  const grouped = useMemo(() => {
    const map = {};
    feed.filter((p) => p.username !== 'arianacruz').forEach((p) => {
      if (!map[p.username]) map[p.username] = [];
      map[p.username].push(p);
    });
    return Object.entries(map);
  }, [feed]);

  return (
    <div className="page-content friends-page">
      {grouped.map(([username, photos], idx) => {
        const stripPhotos = [...photos, ...photos];
        return (
          <div key={username} className="friend-strip">
            <div className="friend-strip__header">
              <span className="friend-strip__label">@{username}</span>
            </div>
            <div className="friend-strip__track-wrap">
              <div
                className={`friend-strip__track ${idx % 2 === 0 ? 'track-left' : 'track-right'}`}
              >
                {stripPhotos.map((photo, i) => (
                  <div key={`${photo.id}-${i}`} className="friend-strip__frame">
                    <PolaroidCard photo={photo} onClick={onPhotoClick} index={i} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

window.FriendsPage = FriendsPage;
