function clearForm() {
    const contactForm = document.querySelector('form[action*="formspree.io"]');
    if (contactForm) {
        contactForm.reset();
    }
}

document.addEventListener('DOMContentLoaded', clearForm);
window.addEventListener('pageshow', clearForm);