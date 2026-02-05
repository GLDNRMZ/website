// Animated reveal for sections/cards
const revealEls = document.querySelectorAll('section, section h2 + div > div');
revealEls.forEach(el => {
	el.style.opacity = '0';
	el.style.transform = 'translateY(40px)';
	el.style.transition = 'opacity 0.7s cubic-bezier(.2,.6,.2,1), transform 0.7s cubic-bezier(.2,.6,.2,1)';
});
function revealOnScroll() {
	revealEls.forEach(el => {
		const rect = el.getBoundingClientRect();
		if (rect.top < window.innerHeight - 60) {
			el.style.opacity = '1';
			el.style.transform = 'none';
		}
	});
}
window.addEventListener('scroll', revealOnScroll);
window.addEventListener('DOMContentLoaded', revealOnScroll);

// Keyboard navigation for resource cards
const resourceCards = document.querySelectorAll('.resource-card');
resourceCards.forEach((card, idx) => {
	card.setAttribute('tabindex', '0');
	card.addEventListener('keydown', function(e) {
		if (e.key === 'Enter' || e.key === ' ') {
			const url = card.getAttribute('data-href');
			if (url) window.open(url, '_blank', 'noopener');
		}
		if (e.key === 'ArrowRight') {
			if (resourceCards[idx+1]) resourceCards[idx+1].focus();
		}
		if (e.key === 'ArrowLeft') {
			if (resourceCards[idx-1]) resourceCards[idx-1].focus();
		}
	});
});

// Accessibility for scroll-to-top button
if (window.scrollBtn) {
	scrollBtn.setAttribute('tabindex', '0');
	scrollBtn.addEventListener('keydown', function(e) {
		if (e.key === 'Enter' || e.key === ' ') {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	});
}
// Section highlighting in navbar
const navLinks = document.querySelectorAll('.navbar-links a[href^="#"]');
const sections = Array.from(navLinks).map(link => {
	const id = link.getAttribute('href').slice(1);
	return document.getElementById(id);
}).filter(Boolean);

window.addEventListener('scroll', () => {
	let current = '';
	const scrollPos = window.scrollY + 120;
	sections.forEach(section => {
		if (section.offsetTop <= scrollPos) {
			current = section.id;
		}
	});
	navLinks.forEach(link => {
		link.classList.remove('active');
		if (link.getAttribute('href') === '#' + current) {
			link.classList.add('active');
		}
	});
});

// Responsive hamburger menu for mobile
const navbar = document.querySelector('.navbar');
const navLinksList = document.querySelector('.navbar-links');
let burger = document.createElement('button');
burger.innerHTML = '&#9776;';
burger.setAttribute('aria-label', 'Open navigation menu');
burger.style.background = 'none';
burger.style.border = 'none';
burger.style.color = 'var(--brand)';
burger.style.fontSize = '2rem';
burger.style.cursor = 'pointer';
burger.style.display = 'none';
burger.style.marginLeft = '1rem';
navbar.insertBefore(burger, navLinksList);

function checkBurger() {
	if (window.innerWidth < 800) {
		burger.style.display = 'block';
		navLinksList.style.display = 'none';
	} else {
		burger.style.display = 'none';
		navLinksList.style.display = 'flex';
	}
}
checkBurger();
window.addEventListener('resize', checkBurger);
burger.addEventListener('click', () => {
	if (navLinksList.style.display === 'none') {
		navLinksList.style.display = 'flex';
	} else {
		navLinksList.style.display = 'none';
	}
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
	anchor.addEventListener('click', function (e) {
		const targetId = this.getAttribute('href').slice(1);
		const target = document.getElementById(targetId);
		if (target) {
			e.preventDefault();
			target.scrollIntoView({ behavior: 'smooth' });
		}
	});
});

// Scroll-to-top button
const scrollBtn = document.createElement('button');
scrollBtn.innerHTML = '↑';
scrollBtn.setAttribute('aria-label', 'Scroll to top');
scrollBtn.style.position = 'fixed';
scrollBtn.style.bottom = '2rem';
scrollBtn.style.right = '2rem';
scrollBtn.style.background = 'var(--brand)';
scrollBtn.style.color = '#0A0A0A';
scrollBtn.style.border = 'none';
scrollBtn.style.borderRadius = '50%';
scrollBtn.style.width = '48px';
scrollBtn.style.height = '48px';
scrollBtn.style.fontSize = '2rem';
scrollBtn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.25)';
scrollBtn.style.cursor = 'pointer';
scrollBtn.style.display = 'none';
scrollBtn.style.zIndex = '1000';
scrollBtn.style.transition = 'opacity 0.2s';
document.body.appendChild(scrollBtn);

window.addEventListener('scroll', function() {
	if (window.scrollY > 200) {
		scrollBtn.style.display = 'block';
		scrollBtn.style.opacity = '1';
	} else {
		scrollBtn.style.opacity = '0';
		setTimeout(() => { if(scrollBtn.style.opacity === '0') scrollBtn.style.display = 'none'; }, 200);
	}
});
scrollBtn.addEventListener('click', function() {
	window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Card hover elevation (for resource cards)
document.querySelectorAll('.resource-card').forEach(card => {
	card.addEventListener('mouseenter', function() {
		card.style.transform = 'translateY(-6px) scale(1.03)';
		card.style.boxShadow = '0 8px 24px rgba(0,0,0,0.25)';
		card.style.transition = 'transform 0.18s, box-shadow 0.18s';
	});
	card.addEventListener('mouseleave', function() {
		card.style.transform = '';
		card.style.boxShadow = '0 2px 8px rgba(10,15,28,0.15)';
	});
	card.addEventListener('click', function(e) {
		const url = card.getAttribute('data-href');
		if (url) window.open(url, '_blank', 'noopener');
	});
	card.addEventListener('keydown', function(e) {
		if (e.key === 'Enter' || e.key === ' ') {
			const url = card.getAttribute('data-href');
			if (url) window.open(url, '_blank', 'noopener');
		}
	});
});
