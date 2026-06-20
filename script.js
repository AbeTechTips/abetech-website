// Dark mode — apply saved preference before paint to avoid flash
(function() {
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (saved === 'dark' || (!saved && prefersDark)) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();

// Nav scroll effect
const header = document.getElementById('site-header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

// Hamburger menu
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});

mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
  });
});

// Scroll-in animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.testimonial-card, .skill-card, .contact-card, .about-card, .cert-item').forEach(el => {
  el.classList.add('fade-in');
  observer.observe(el);
});

// Blog posts via Ghost RSS feed
const BLOG_RSS = 'https://blog.abetech.live/rss/';
const FALLBACK_POSTS = [
  {
    title: 'Using PiHole for Local DNS',
    date: 'April 7, 2025',
    url: 'https://blog.abetech.live/using-pihole-for-local-dns/',
    emoji: '🛡️'
  },
  {
    title: 'How to Backup Your Linux Servers Using RSync',
    date: 'November 27, 2024',
    url: 'https://blog.abetech.live/how-to-backup-your-linux-servers-using-rsync/',
    emoji: '💾'
  },
  {
    title: 'Build Your Own NAS with TrueNAS',
    date: 'October 2024',
    url: 'https://blog.abetech.live/store-files-like-a-pro-with-truenas/',
    emoji: '🗄️'
  }
];

function formatDate(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

function renderBlogCard({ title, date, url, img, emoji }) {
  const imgHtml = img
    ? `<img class="blog-card-img" src="${img}" alt="${title}" loading="lazy">`
    : `<div class="blog-card-img-placeholder">${emoji || '📝'}</div>`;
  return `
    <a href="${url}" target="_blank" rel="noopener" class="blog-card fade-in">
      ${imgHtml}
      <div class="blog-card-body">
        <span class="blog-card-date">${date}</span>
        <h3 class="blog-card-title">${title}</h3>
        <span class="blog-card-link">Read article &rarr;</span>
      </div>
    </a>`;
}

function renderPosts(posts) {
  const grid = document.getElementById('blog-grid');
  grid.innerHTML = posts.map(renderBlogCard).join('');
  grid.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

async function loadBlogPosts() {
  try {
    const resp = await fetch(BLOG_RSS, { mode: 'cors' });
    if (!resp.ok) throw new Error('RSS fetch failed');
    const text = await resp.text();
    const doc = new DOMParser().parseFromString(text, 'text/xml');
    const items = Array.from(doc.querySelectorAll('item')).slice(0, 3);
    if (!items.length) throw new Error('No items in feed');
    const posts = items.map(item => ({
      title: item.querySelector('title')?.textContent || '',
      date: formatDate(item.querySelector('pubDate')?.textContent || ''),
      url: item.querySelector('link')?.textContent || '#',
      img: item.querySelector('enclosure')?.getAttribute('url') || null,
      emoji: '📝'
    }));
    renderPosts(posts);
  } catch {
    renderPosts(FALLBACK_POSTS);
  }
}

loadBlogPosts();

// Theme toggle
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const next = isDark ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});
