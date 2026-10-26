(() => {
  const root = document.getElementById('spotify');
  if (!root) return;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeUrl = url => /^https:\/\//.test(url || '') ? url : null;
  const periods = [
    ['short_term', 'This month', 'Based on approximately the last four weeks.'],
    ['medium_term', 'Last 6 months', 'Based on approximately the last six months.'],
    ['long_term', 'All time', 'Spotify’s long-term ranking: about a year of listening, plus new activity.']
  ];
  const row = (name, subtitle, image, url, rank) => {
    const art = safeUrl(image) ? `<img src="${esc(image)}" alt="" loading="lazy">` : '<span class="art"></span>';
    const label = safeUrl(url) ? `<a class="inl" href="${esc(url)}" target="_blank" rel="noopener">${esc(name)}</a>` : esc(name);
    return `<li>${rank ? `<span class="track-rank">${rank}</span>` : ''}${art}<div class="track-info"><div>${label}</div>${subtitle ? `<div class="sub">${esc(subtitle)}</div>` : ''}</div></li>`;
  };
  const ago = iso => {
    const seconds = (Date.now() - new Date(iso)) / 1000;
    if (!(seconds >= 0)) return '';
    for (const [length, unit] of [[31536000,'year'],[2592000,'month'],[86400,'day'],[3600,'hour'],[60,'minute']]) {
      const count = Math.floor(seconds / length);
      if (count >= 1) return `${count} ${unit}${count > 1 ? 's' : ''} ago`;
    }
    return 'just now';
  };
  const player = track => {
    const match = /^https:\/\/open\.spotify\.com\/(?:intl-[^/]+\/)?track\/([A-Za-z0-9]{22})(?:[?#].*)?$/.exec(track.url || '');
    if (!match) return '';
    return `<section class="top-player"><h3>Top track</h3><iframe title="Play ${esc(track.name)} on Spotify" src="https://open.spotify.com/embed/track/${match[1]}?theme=0" width="100%" height="80" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe><a class="inl player-link" href="${esc(track.url)}" target="_blank" rel="noopener">Open in Spotify ↗</a></section>`;
  };
  const showError = () => {
    root.innerHTML = '<p class="muted">Listening stats couldn’t load.</p><button class="stats-retry" type="button">Try again</button>';
    root.querySelector('button').addEventListener('click', load);
  };
  async function load() {
    root.innerHTML = '<p class="muted" role="status">Loading listening stats…</p>';
    try {
      const response = await fetch(`data/spotify.json?t=${Date.now()}`, {cache:'no-store'});
      if (!response.ok) throw new Error('Stats unavailable');
      const data = await response.json();
      const ranges = data.time_ranges || {};
      // Never relabel the existing monthly snapshot as another period.
      if (!ranges.short_term && (data.top_artists?.length || data.top_tracks?.length)) {
        ranges.short_term = {top_artists:data.top_artists || [], top_tracks:data.top_tracks || [], top_genres:data.top_genres || []};
      }
      root.innerHTML = `<div class="time-switch" role="group" aria-label="Listening time range">${periods.map(([key,label]) => `<button type="button" data-period="${key}" aria-pressed="${key === 'short_term'}" aria-controls="listening-stats">${label}</button>`).join('')}</div><p class="range-note muted" id="range-note"></p><p class="sr-only" role="status" id="range-status"></p><div id="listening-stats"></div><p class="muted upd"></p>`;
      const panel = root.querySelector('#listening-stats');
      const render = period => {
        const [,label,note] = periods.find(([key]) => key === period);
        root.querySelectorAll('[data-period]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.period === period)));
        root.querySelector('#range-note').textContent = note;
        root.querySelector('#range-status').textContent = `Showing ${label.toLowerCase()}.`;
        const stats = ranges[period];
        if (!stats) {
          panel.innerHTML = '<p class="stats-empty muted">These rankings haven’t synced yet. Check back after the next Spotify update.</p>';
        } else {
          const artists = stats.top_artists || [], tracks = stats.top_tracks || [], genres = stats.top_genres || [];
          let html = tracks[0] ? player(tracks[0]) : '';
          html += `<section class="stats-section"><h3>Top artists</h3>${artists.length ? `<ol class="tracks round">${artists.map((artist,index) => row(artist.name,'',artist.image,artist.url,index + 1)).join('')}</ol>` : '<p class="muted">No artist rankings available for this period.</p>'}</section>`;
          html += `<section class="stats-section"><h3>Top tracks</h3>${tracks.length ? `<ol class="tracks">${tracks.map((track,index) => row(track.name,(track.artists || []).join(', '),track.image,track.url,index + 1)).join('')}</ol>` : '<p class="muted">No track rankings available for this period.</p>'}</section>`;
          html += `<section class="stats-section"><h3>Top genres</h3>${genres.length ? `<ol class="genre-list">${genres.map(genre => `<li>${esc(genre.name)}</li>`).join('')}</ol><p class="muted genre-note">Based on genres shared by your top artists.</p>` : '<p class="muted">Genre stats aren’t available yet.</p>'}</section>`;
          panel.innerHTML = html;
        }
        const updated = ago(data.updated_at);
        root.querySelector('.upd').textContent = updated ? `Updated ${updated} · Spotify` : 'Spotify';
      };
      root.querySelectorAll('[data-period]').forEach(button => button.addEventListener('click', () => render(button.dataset.period)));
      render('short_term');
      if (data.now_playing) {
        const section = document.createElement('section');
        section.className = 'stats-section';
        section.innerHTML = `<h3>Now playing</h3><ul class="tracks">${row(data.now_playing.name,(data.now_playing.artists || []).join(', '),data.now_playing.image,data.now_playing.url)}</ul>`;
        panel.after(section);
      }
    } catch {
      showError();
    }
  }
  load();
})();
