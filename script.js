
const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");

menuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("active");
});




const cards = document.querySelectorAll('.card-cardapio');

function updateCenterCard() {

    const center = window.innerWidth / 2;

    cards.forEach(card => {

        const rect = card.getBoundingClientRect();

        const cardCenter = rect.left + rect.width / 2;

        const distance = Math.abs(center - cardCenter);

        if(distance < 200){
            card.style.transform = "scale(1.08)";
            card.style.opacity = "1";
        }else{
            card.style.transform = "scale(0.9)";
            card.style.opacity = "0.6";
        }

    });
}

document.querySelector('.cards')
.addEventListener('scroll', updateCenterCard);

updateCenterCard();
