/* global React */

function AlbumPage({ user, feed, isOwn, isRolled, onToggleRoll }) {
  const { PolaroidCard } = window;
  const username = user.username;
  const photos = feed.filter((p) => p.username === username);
  const seed = username.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const rolls = isOwn ? photos.length : ((seed * 13) % 800 + 200);
  const rolling = isOwn ? 5 : Math.floor(rolls * 0.45);

  return (
    <div className="album-page">
      <div className="album-header">
        <div className="album-user">
          <div className="album-avatar">{username[0].toUpperCase()}</div>
          <div>
            <h2 className="album-username">@{username}</h2>
            <p className="album-stats">{rolls} rolls   {rolling} rolling with</p>
          </div>
        </div>
        {!isOwn && (
          <button className="roll-with-btn" onClick={onToggleRoll}>
            {isRolled ? 'rolling' : '+ roll with'}
          </button>
        )}
      </div>
      <div className="photo-grid photo-grid--4 photo-grid--dark">
        {photos.map((photo, i) => (
          <PolaroidCard key={photo.id} photo={photo} index={i} />
        ))}
        {photos.length === 0 && (
          <p className="album-empty">no photos yet this week.</p>
        )}
      </div>
    </div>
  );
}

window.AlbumPage = AlbumPage;
