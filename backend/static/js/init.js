const menuButton = document.querySelector('.js-hamburger');
const menu = document.querySelector('nav#js-menu');

menuButton.addEventListener('click', (e) => {
    const target = e.target;
    console.log('clicked', target, menu);
    // target.classList.toggle('hidden');
    menu.classList.toggle('md:hidden');
})
document.querySelectorAll('.js-hamburger').forEach(b => b.addEventListener('click', e => {


}))
