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
    <div className="page-content">
      {grouped.map(([username, photos]) => (
        <div key={username} className="friend-section">
          <p className="friend-section__name">@{username}</p>
          <div className="photo-grid photo-grid--6">
            {photos.map((photo, i) => (
              <PolaroidCard key={photo.id} photo={photo} onClick={onPhotoClick} index={i} />
            ))}
          </div>
        </div>
      ))}
      <div className="scroll-hint">
        <div className="scroll-hint__btn">v</div>
      </div>
    </div>
  );
}

window.FriendsPage = FriendsPage;
