// register gsap plugins
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// selector alias
const select = (e) => document.querySelector(e);
const selectAll = (e) => document.querySelectorAll(e);

const sections = document.querySelectorAll('.rg__column');

const allLinks = gsap.utils.toArray('.portfolio__categories a');
const pageBackground = select('.fill-background');
const largeImage = select('.portfolio__image--l');
const smallImage = select('.portfolio__image--s');
const lInside = select('.portfolio__image--l .image_inside');
const sInside = select('.portfolio__image--s .image_inside');

const loader = select('.loader');
const progressBar = select('.loader__progress-bar');
const maskContent = select('.loader__mask--content');
const mask = select('.loader__mask');

let bodyScrollBar;

/**
 * initialize loader animation
 */
function init() {
  const loadingTimeline = gsap.timeline({
    // Init page animation when loding complete
    onComplete: initPageTransition,
  });

  loadingTimeline
    .set(pageBackground, { backgroundColor: '#BC9296' })
    .set(loader, { autoAlpha: 1 })
    .to(progressBar, { duration: 2, width: '100%', ease: 'none' }, 0);

  let loadedImageCount = 0,
    imageCount;
  const container = select('#main');

  // Set up imagesLoaded library
  const imgLoad = imagesLoaded(container);
  imageCount = imgLoad.images.length;

  updateProgress(0);

  // triggered updateProgress function after each image is loaded
  imgLoad.on('progress', function () {
    loadedImageCount++;
    updateProgress(loadedImageCount);
  });

  function updateProgress(value) {
    gsap.to(loadingTimeline, {
      progress: value / imageCount,
      duration: 0.25,
      ease: 'none',
    });
  }
}

init();

/**  PAGE TRANSITIONS
 * => Barba.js
 */
function PageTransitionIn({ container }) {
  /** Timeline to stretch the loader over the whole screen **/
  const tl = gsap.timeline({
    defaults: {
      duration: 1.1,
      ease: 'power1.inOut',
    },
  });

  tl.set(mask, { backgroundColor: '#758A94' })
    .fromTo(loader, { yPercent: -100 }, { yPercent: 0 })
    .fromTo(
      maskContent,
      { autoAlpha: 0, yPercent: 80 },
      { duration: 1.1, autoAlpha: 1, yPercent: -20 }
    )
    .to(container, { y: 150 }, 0);

  return tl;
}

function PageTransitionOut({ container }) {
  /** Timeline to move the loader way down **/
  const tl = gsap.timeline({
    defaults: {
      duration: 1.1,
      ease: 'power1.inOut',
    },
    onComplete: () => initContent(),
  });

  tl.to(loader, { yPercent: 100 })
    .to(maskContent, { yPercent: -80 }, 0)
    .from(container, { y: -150 }, 0);

  return tl;
}

function initPageTransition() {
  /** Prevent double click default  **/
  barba.hooks.before(() => {
    document.querySelector('html').classList.add('is-transitioning');
  });
  barba.hooks.after(() => {
    document.querySelector('html').classList.remove('is-transitioning');
  });

  /** Scroll to the top of the page **/
  barba.hooks.enter(() => {
    window.scrollTo(0, 0);
  });

  /** Init barba **/
  barba.init({
    transitions: [
      {
        once() {
          /**  Do ... on the initial load  **/
          initLoader();
        },
        async leave({ current }) {
          /** Animate loading screen  **/
          await PageTransitionIn(current);
        },
        enter({ next }) {
          /** Animate loading screen away  **/
          PageTransitionOut(next);
        },
      },
    ],
  });
}

/**
 * INIT LOADER
 */
function initLoader() {
  const t1 = gsap.timeline({
    defaults: {
      duration: 1,
      ease: 'power2.out',
    },
    onComplete: () => initContent(),
  });

  const loaderInner = select('.loader .inner');
  const image = select('.loader__image img');
  const mask = select('.loader__image--mask');
  const line1 = select('.loader__title--mask:nth-child(1) span');
  const line2 = select('.loader__title--mask:nth-child(2) span');
  const lines = selectAll('.loader__title--mask');
  const loaderContent = select('.loader__content');

  t1.set(loaderContent, { autoAlpha: 1 })
    .set(mask, { yPercent: 100 })
    .set(image, { yPercent: -80 })
    .set([line1, line2], { yPercent: 100 })
    .to(maskContent, { autoAlpha: 0 })
    .to(
      loaderInner,
      {
        scaleY: 1,
      },
      '<0.5'
    )
    .to(loaderContent, { scaleY: 1 }, '<0.1')
    .to(lines, { yPercent: -500, stagger: 0.2 }, '<0.1')
    .to([loader, loaderContent], { yPercent: -100 })
    .from('#main', { y: 150 }, '<')
    .to(pageBackground, { backgroundColor: '#a3abb1', ease: 'none' }, '<');
}

/**
 * INIT CONTENT
 */
function initContent() {
  select('body').classList.remove('is-loading');

  initSmoothScrollbar();
  initNavigation();
  initHeaderTilt();
  initHoverReveal();
  initPortfolioHover();
  initParallax();
  initPinSteps();
  initScrollTo();
}

/** GET THE TEXT HEIGHT **/
const getTextHeight = (textCopy) => textCopy.clientHeight;

/** Quick example with gsap tween 
 gsap.to('.fill-background', { backgroundColor: color, ease: 'none' });**/
/**  CSS Custom Property   **/
const updateBodyColor = (color) => {
  document.documentElement.style.setProperty('--bcg-fill-color', color);
};

/**  SMOOTH SCROLLING
 * => smoothScrollbar.js
 */
function initSmoothScrollbar() {
  bodyScrollBar = Scrollbar.init(document.querySelector('#viewport'), {
    damping: 0.07,
  });

  /** Remove the horizontal scrollbar of the library from the DOM **/
  bodyScrollBar.track.xAxis.element.remove();

  /** Add .scrollerProxy, for handle third part li issues
   * keep ScrollTrigger and sync with SmoothScrollbar **/
  ScrollTrigger.scrollerProxy(document.body, {
    scrollTop(value) {
      if (arguments.length) {
        bodyScrollBar.scrollTop = value; // setter
      }
      return bodyScrollBar.scrollTop; // getter
    },
  });

  /** When the SmoothScrollBar is updated,
   * tell ScrollTrigger to update too
   */
  bodyScrollBar.addListener(ScrollTrigger.update);
}

/**
 * NAVIGATION
 */
function initNavigation() {
  const mainNavLinks = gsap.utils.toArray('.main-nav a');
  const mainNavLinksRev = gsap.utils.toArray('.main-nav a').reverse();

  mainNavLinks.forEach((link) => {
    link.addEventListener('mouseleave', (e) => {
      link.classList.add('animate-out');
      setTimeout(() => {
        link.classList.remove('animate-out');
      }, 300);
    });
  });

  /** NAV ANIMATION (direction) **/
  function navAnimation(direction) {
    //console.log(direction)
    const scrollingDown = direction === 1;
    const links = scrollingDown ? mainNavLinks : mainNavLinksRev;
    return gsap.to(links, {
      duration: 0.3,
      stagger: 0.08,
      autoAlpha: () => (scrollingDown ? 0 : 1),
      y: () => (scrollingDown ? 20 : 0),
      ease: 'power4.easeOut',
    });
  }

  ScrollTrigger.create({
    trigger: '#main',
    start: 'top top-=100',
    end: 'bottom bottom-=200',
    toggleClass: {
      targets: 'body',
      className: 'has-scrolled',
    },
    //markers: true,
    onEnter: ({ direction }) => navAnimation(direction),
    onLeaveBack: ({ direction }) => navAnimation(direction),
  });
}

/**
 * HEADER TILT EVENT FUNCTION
 */
function initHeaderTilt() {
  document.querySelector('header').addEventListener('mousemove', moveImages);
}

/**  MOVE IMAGES ANIMATION  **/
function moveImages(e) {
  //console.log(e);

  const { offsetX, offsetY, target } = e;
  const { clientWidth, clientHeight } = target;
  //console.log(offsetX, offsetY, clientWidth, clientHeight);

  const xPos = offsetX / clientWidth - 0.5;
  const yPos = offsetY / clientHeight - 0.5;

  const leftImages = gsap.utils.toArray('.hg__left .hg__image');
  const rightImages = gsap.utils.toArray('.hg__right .hg__image');
  const modifier = (index) => index * 1.2 + 0.5;

  /** Move left 3 images  **/
  leftImages.forEach((image, index) => {
    gsap.to(image, {
      duration: 1.2,
      x: xPos * 20 * modifier(index),
      y: yPos * 30 * modifier(index),
      rotationY: xPos * 10,
      rotationX: yPos * 8,
      ease: 'power4.out',
    });
  });

  /** Move right 3 images  **/
  rightImages.forEach((image, index) => {
    gsap.to(image, {
      duration: 1.2,
      x: xPos * 20 * modifier(index),
      y: yPos * 30 * modifier(index),
      rotationY: xPos * 10,
      rotationX: yPos * 8,
      ease: 'power4.out',
    });
  });

  /**  Move the Center Decor Circle   **/
  gsap.to('.decor__circle', {
    duration: 1.7,
    x: 80 * xPos,
    y: 90 * yPos,
    ease: 'power4.out',
  });
}

/**
 * HOVER COLUMNS REVEAL ANIMATION
 */
function initHoverReveal() {
  sections.forEach((section) => {
    section.imageBlock = section.querySelector('.rg__image');
    section.image = section.querySelector('.rg__image img');
    section.mask = section.querySelector('.rg__image--mask');
    section.text = section.querySelector('.rg__text');
    section.textCopy = section.querySelector('.rg__text--copy');
    section.textMask = section.querySelector('.rg__text--mask');
    section.textP = section.querySelector('.rg__text--copy p');

    /** Reset initial position **/
    gsap.set([section.imageBlock, section.textMask], { yPercent: -101 });
    gsap.set(section.image, { scale: 1.3 });
    gsap.set([section.mask, section.textP], { yPercent: 100 });

    /** Add event listeners to each section   **/
    section.addEventListener('mouseenter', createHoverReveal);
    section.addEventListener('mouseleave', createHoverReveal);
  });
}

/** COLUMNS REVEAL TIMELINE **/
function createHoverReveal(e) {
  //console.log(e.type)
  const { imageBlock, image, mask, text, textCopy, textMask, textP } = e.target;

  let tl = gsap.timeline({
    defaults: {
      duration: 1,
      ease: 'power4.out',
    },
  });

  if (e.type === 'mouseenter') {
    tl.to([mask, imageBlock, textMask, textP], { yPercent: 0 })
      .to(text, { y: () => -getTextHeight(textCopy) / 2 }, 0)
      .to(image, { duration: 1.4, scale: 1 }, 0);
  } else if (e.type === 'mouseleave') {
    tl.to([mask, textP], { yPercent: 100 })
      .to([imageBlock, textMask], { yPercent: -101 }, 0)
      .to(text, { y: 0 }, 0)
      .to(image, { scale: 1.3 }, 0);
  }

  return tl;
}

/**
 * PORTFOLIO HOVER ANIMATION
 * => INIT
 */
function initPortfolioHover() {
  allLinks.forEach((link) => {
    link.addEventListener('mouseenter', createPortfolioHover);
    link.addEventListener('mouseleave', createPortfolioHover);
    link.addEventListener('mousemove', createPortfolioMove);
  });
}
/** => CREATE HOVER **/
function createPortfolioHover(e) {
  /**  Change images to the right urls
   *  Fade in images
   *  All siblings to white and fade out
   *  Active link to white
   *  Update page background  **/
  if (e.type === 'mouseenter') {
    const { color, imagelarge, imagesmall } = e.target.dataset;
    //console.log(color, imagelarge, imagesmall);
    const allSiblings = allLinks.filter((item) => item !== e.target);
    const tl = gsap.timeline();
    tl.set(lInside, { backgroundImage: `url(${imagelarge})` })
      .set(sInside, { backgroundImage: `url(${imagesmall})` })
      .to([largeImage, smallImage], { duration: 1, autoAlpha: 1 })
      .to(allSiblings, { color: '#fff', autoAlpha: 0.2 }, 0)
      .to(e.target, { color: '#fff', autoAlpha: 1 }, 0)
      .to(pageBackground, { backgroundColor: color, ease: 'none' }, 0);

    /** Fade out images
     *  All links back to back
     *  Change background color back to default **/
  } else if (e.type === 'mouseleave') {
    const tl = gsap.timeline();
    tl.to([largeImage, smallImage], { autoAlpha: 0 })
      .to(allLinks, { color: '#000000', autoAlpha: 1 }, 0)
      .to(pageBackground, { backgroundColor: '#ACB7AE', ease: 'none' }, 0);
  }
}
/** => CREATE MOVE **/
function createPortfolioMove(e) {
  const { clientY } = e;

  /** Move large image **/
  gsap.to(largeImage, {
    duration: 1.2,
    y: getPortfolioOffset(clientY) / 3,
    ease: 'Power3.inOut',
  });

  /** Move small image **/
  gsap.to(smallImage, {
    duration: 1.5,
    y: getPortfolioOffset(clientY) / 2,
    ease: 'Power3.inOut',
  });
}

/** GET THE PORTFOLIO HEIGHT **/
function getPortfolioOffset(clientY) {
  const heightSection =
    document.querySelector('.portfolio__categories').clientHeight / 6;

  return -(heightSection - clientY);
}

/**
 * PARALLAX ANIMATION
 */
function initParallax() {
  /**  Select all sections .with-parallax  **/
  gsap.utils.toArray('.with-parallax').forEach((section) => {
    /** Get the Image  **/
    const image = section.querySelector('img');
    /** Create a Tween **/
    gsap.to(image, {
      yPercent: 30,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        scrub: true,
        // markers: true
      },
    });
  });
}

/** PIN FIXED NAV & UPDATE BGC **/
function initPinSteps() {
  ScrollTrigger.create({
    trigger: '.fixed-nav',
    start: 'top center',
    endTrigger: '#stage4',
    end: 'center center',
    //markers: true,
    pin: true,
    pinReparent: true,
  });

  const getVh = () => {
    const vh = Math.max(
      document.documentElement.clientHeight || 0,
      window.innerHeight || 0
    );

    return vh;
  };

  gsap.utils.toArray('.stage').forEach((stage, index) => {
    const navLinks = gsap.utils.toArray('.fixed-nav li');

    ScrollTrigger.create({
      trigger: stage,
      start: 'top center',
      end: () => `+=${stage.clientHeight + getVh() / 10}`,
      //markers: true,
      toggleClass: {
        targets: navLinks[index],
        className: 'is-active',
      },
      onEnter: () => updateBodyColor(stage.dataset.color),
      onEnterBack: () => updateBodyColor(stage.dataset.color),
    });
  });
}

/** LINKS FIXED NAV SCROLL TO **/
function initScrollTo() {
  /** Find all links and animate  **/
  gsap.utils.toArray('.fixed-nav a').forEach((link) => {
    const target = link.getAttribute('href');

    link.addEventListener('click', (e) => {
      e.preventDefault();
      bodyScrollBar.scrollIntoView(document.querySelector(target), {
        damping: 0.07,
        offsetTop: 100,
      });
    });
  });
}

/** DEFINE BREAKPOINTS **/
const mq = window.matchMedia('(min-width: 768px)');

/** RESET PROPS **/
function resetProps(el) {
  //console.log(el);
  /** Kill all Tweens  **/
  gsap.killTweensOf('*');
  /**  Reset all props  **/
  if (el.length) {
    el.forEach((el) => {
      el && gsap.set(el, { clearProps: 'all' });
    });
  }
}

/** MEDIA QUERIY CHANGE **/
function handleWidthChange(mq) {
  /** if breakpoint match  **/
  if (mq.matches) {
    /** setup hover animation **/
    initHoverReveal();
  } else {
    //console.log('We are on mobile!');
    /**  Remove event listener for each section **/
    sections.forEach((section) => {
      section.removeEventListener('mouseenter', createHoverReveal);
      section.removeEventListener('mouseleave', createHoverReveal);

      const { imageBlock, image, mask, text, textCopy, textMask, textP } =
        section;
      resetProps([imageBlock, image, mask, text, textCopy, textMask, textP]);
    });
  }
}

handleWidthChange(mq);

/** CHANGE ADD LISTENER TO THE BREAKPOINT **/
mq.addListener(handleWidthChange);

/**  WNDOW EVENT LOAD
window.addEventListener('load', function () {
  init();
});
 **/
