// Timeline JS complet amélioré

document.addEventListener("DOMContentLoaded", () => {
    const timelineLists = document.querySelectorAll(".js-timeline__list");

    timelineLists.forEach(list => {
        const items = list.querySelectorAll(".js-taf-container");

        items.forEach(item => {
            const link = item.querySelector(".js-taf__modal-trigger");
            const modalContent = item.querySelector(".js-taf__modal-content");
            
            if (!link || !modalContent) return;

            // Cacher au départ
            modalContent.style.display = "none";

            // Toggle modal au clic
            link.addEventListener("click", e => {
                e.preventDefault();
                const isVisible = modalContent.style.display === "block";
                modalContent.style.display = isVisible ? "none" : "block";
            });
        });
    });

    // Ajouter un toggle pour cacher/montrer tous les items si nécessaire
    const toggleAllBtns = document.querySelectorAll(".js-toggle-all");
    toggleAllBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            timelineLists.forEach(list => {
                list.querySelectorAll(".js-taf__modal-content").forEach(modal => {
                    modal.style.display = "block";
                });
            });
        });
    });

    // Supprimer le bouton "fait"
    document.querySelectorAll(".js-taf__btn-marquer-fait-non-fait").forEach(btn => {
        btn.remove();
    });
});
