/* global React */

function AlbumPage({ user, feed, isOwn, isRolled, onToggleRoll }) {
  const { PolaroidCard } = window;
  const { useState, useEffect } = React;
  const { supabaseService } = window;
  
  const username = user.username;
  const [userPhotos, setUserPhotos] = useState([]);
  const [loading, setLoading] = useState(isOwn);

  useEffect(() => {
    if (!isOwn || !supabaseService) {
      setLoading(false);
      return;
    }

    const fetchUserPhotos = async () => {
      try {
        const userId = localStorage.getItem('exposr_user_id');
        if (!userId) return;

        // List files from backend API
        const files = await supabaseService.getUserPhotos(userId);
        
        // Transform to photo objects (backend returns file URLs)
        const photos = files.map((file) => {
          return {
            id: file.id,
            username,
            url: file.url,
            name: file.name,
          };
        });

        setUserPhotos(photos);
      } catch (err) {
        console.error('Error fetching user photos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPhotos();
  }, [isOwn, username]);

  // Use Supabase photos if own profile, otherwise use feed
  const photos = isOwn ? userPhotos : feed.filter((p) => p.username === username);
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
        {loading ? (
          <p className="album-empty">loading your photos...</p>
        ) : photos.length === 0 ? (
          <p className="album-empty">no photos yet this week.</p>
        ) : (
          photos.map((photo, i) => (
            <PolaroidCard key={photo.id} photo={photo} index={i} />
          ))
        )}
      </div>
    </div>
  );
}

window.AlbumPage = AlbumPage;
