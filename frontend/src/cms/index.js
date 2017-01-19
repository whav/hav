require('./cms.css')

// carousel
let carousels = document.querySelectorAll('.carousel')
carousels.forEach((elem, index) => {
    let carouselItems = elem.querySelectorAll('.carousel-item');
    let carouselControls = elem.querySelector('.carousel-control');
    carouselControls.querySelectorAll('li').forEach((li, index) => {
        li.addEventListener(
            'click',
            (e) => {
                // clear out all active classes
                carouselItems.forEach((e) => e.classList.remove("active"));
                carouselControls.querySelectorAll('li').forEach((e) => e.classList.remove("active"));
                carouselItems[index].classList.add('active');
                li.classList.add('active');
            }
        )

        // and bind the click handler
    })
});