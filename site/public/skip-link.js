/**
 * Native hash navigation scrolls to a landmark but does not reliably transfer
 * keyboard focus. A skip link must do both, so a keyboard user can continue
 * from the start of the main content.
 */
for (const link of document.querySelectorAll('a[data-skip-link][href^="#"]')) {
  link.addEventListener('click', (event) => {
    const target = document.querySelector(link.getAttribute('href') ?? '');
    if (!(target instanceof HTMLElement)) return;

    event.preventDefault();
    target.focus({ preventScroll: true });
    target.scrollIntoView({
      block: 'start',
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    });
    const nextUrl = new URL(location.href);
    nextUrl.hash = target.id;
    history.pushState(null, '', nextUrl);
  });
}
