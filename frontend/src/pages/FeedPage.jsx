/* global React */
const { useMemo } = React;

function FeedPage({ feed, onPhotoClick }) {
  const { PolaroidCard } = window;
  const friends = feed.filter((p) => p.username !== 'arianacruz');
  const shuffled = useMemo(() => [...friends].sort(() => Math.random() - 0.5), []);
  return (
    <div className="page-content">
      <div className="photo-grid photo-grid--5">
        {shuffled.map((photo, i) => (
          <PolaroidCard key={photo.id} photo={photo} onClick={onPhotoClick} index={i} showLabel />
        ))}
      </div>
    </div>
  );
}

window.FeedPage = FeedPage;
