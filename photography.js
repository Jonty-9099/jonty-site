(() => {
  const photos = [...document.querySelectorAll('.photo-gallery .photo')];
  if (!photos.length) return;

  const touch = matchMedia('(hover: none), (pointer: coarse)');
  let frame = 0;

  function updateColor() {
    frame = 0;
    let active = null;
    if (touch.matches) {
      const height = document.documentElement.clientHeight;
      const center = height / 2;
      let closest = Infinity;
      // Read geometry before changing classes; only the center band activates a photo.
      for (const photo of photos) {
        const rect = photo.getBoundingClientRect();
        if (rect.bottom <= height * .35 || rect.top >= height * .65) continue;
        const distance = Math.abs((rect.top + rect.bottom) / 2 - center);
        if (distance < closest) {
          closest = distance;
          active = photo;
        }
      }
    }
    for (const photo of photos) photo.classList.toggle('is-color', photo === active);
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(updateColor);
  }

  addEventListener('scroll', () => { if (touch.matches) schedule(); }, { passive: true });
  addEventListener('resize', schedule);
  addEventListener('pageshow', schedule);
  touch.addEventListener('change', schedule);
  document.querySelector('.photo-gallery').addEventListener('load', schedule, true);
  schedule();
})();
