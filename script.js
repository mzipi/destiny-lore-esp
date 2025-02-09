let items = [];
let currentPage = 0;
let itemsPerPage = 0;
let language = 'es-mx';

function updateItemsPerPage() {
    if (window.innerWidth < 768) {
        itemsPerPage = 1; // 1 card si el ancho es menor a 768px
    } else if (window.innerWidth < 1080) {
        itemsPerPage = 6; // 6 cards si el ancho es menor a 1080px
    } else {
        itemsPerPage = 8; // 8 cards por defecto
    }
}

window.addEventListener('resize', () => {
    updateItemsPerPage(); // Actualiza items por página
    displayItems(); // Muestra los items nuevamente
});

async function fetchManifestUrls(language) {
    try {
        const response = await fetch("https://www.bungie.net/Platform/Destiny2/Manifest/");
        const manifestData = await response.json();

        // Construir las URLs correctamente
        const recordUrl = `https://www.bungie.net${manifestData.Response.jsonWorldComponentContentPaths[language].DestinyRecordDefinition}`;
        const loreUrl = `https://www.bungie.net${manifestData.Response.jsonWorldComponentContentPaths[language].DestinyLoreDefinition}`;

        return { recordUrl, loreUrl };
    } catch (error) {
        console.error("Error fetching manifest URLs:", error);
    }
}

async function loadLore(recordUrl, loreUrl) {
    try {
        const [loreData, recordsData] = await Promise.all([
            fetch(loreUrl).then(res => res.json()),
            fetch(recordUrl).then(res => res.json())
        ]);

        if (!loreData || typeof loreData !== "object") {
            document.getElementById("content").innerText = "Error: No se encontró la información.";
            return;
        }

        const recordsMap = new Map();
        Object.values(recordsData).forEach(record => {
            if (record.loreHash) {
                recordsMap.set(record.loreHash, record);
            }
        });

        items = Object.values(loreData)
            .filter(loreItem => recordsMap.has(loreItem.hash))
            .map(loreItem => {
                const recordItem = recordsMap.get(loreItem.hash);
                return {
                    hash: loreItem.hash || "Sin hash",
                    index: loreItem.index || "Sin índice",
                    description: loreItem.displayProperties?.description || "Sin descripción",
                    name: loreItem.displayProperties?.name || "Sin nombre",
                    hasIcon: loreItem.displayProperties?.hasIcon || false,
                    icon: recordItem.displayProperties?.hasIcon ? `https://www.bungie.net${recordItem.displayProperties.iconSequences[1].frames}` : null,
                };
            });

        items.sort((a, b) => a.index - b.index);
        displayItems();
    } catch (error) {
        document.getElementById("content").innerText = "Error al cargar los datos.";
        console.error("Error:", error);
    }
}

function displayItems() {
    const contentDiv = document.getElementById("content");

    // Añadir la clase slide-out
    contentDiv.classList.add("slide-out");

    // Esperar a que termine la animación de salida
    setTimeout(() => {
        const startIndex = currentPage * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentItems = items.slice(startIndex, endIndex);

        contentDiv.innerHTML = ""; // Limpiar el contenido

        const fragment = document.createDocumentFragment();
        currentItems.forEach(item => {
            const card = document.createElement("div");
            card.className = "card";
            card.onclick = () => openModal(items.indexOf(item));

            if (item.icon) {
                const imgContainer = document.createElement("div");
                imgContainer.className = "image-container";

                const img = document.createElement("img");
                img.src = item.icon;
                img.alt = item.name;

                imgContainer.appendChild(img);
                card.appendChild(imgContainer);
            }

            const cardContent = document.createElement("div");
            cardContent.className = "card-content";

            const title = document.createElement("h2");
            title.textContent = item.name;

            cardContent.appendChild(title);
            card.appendChild(cardContent);
            fragment.appendChild(card);
        });

        contentDiv.appendChild(fragment);

        // Añadir la clase slide-in después de limpiar el contenido
        contentDiv.classList.remove("slide-out");
        contentDiv.classList.add("slide-in");

        document.getElementById("prevButton").disabled = currentPage === 0;
        document.getElementById("nextButton").disabled = endIndex >= items.length;
        
    }, 500); // Tiempo de espera igual a la duración de la animación
}


function navigate(direction) {
    if (direction === 'prev' && currentPage > 0) {
        currentPage--;
    } else if (direction === 'next' && (currentPage + 1) * itemsPerPage < items.length) {
        currentPage++;
    }
    displayItems();
}

document.getElementById("prevButton").onclick = () => {
    if (currentPage > 0) {
        currentPage--;
        displayItems();
    }
};

document.getElementById("nextButton").onclick = () => {
    if ((currentPage + 1) * itemsPerPage < items.length) {
        currentPage++;
        displayItems();
    }
};

function openModal(itemIndex) {
    const item = items[itemIndex];
    const modal = document.getElementById('myModal');
    const modalContent = document.querySelector('.modal-content');

    modalContent.innerHTML = `
        <span onclick="closeModal()" class="close-button">&times;</span>
        <h2>${item.name}</h2>
        <p>${item.description}</p>
        <div class="button-container">
            <button onclick="closeModal()">Cerrar</button>
        </div>
    `;

    modal.style.display = 'flex';

    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

function closeModal() {
    const modal = document.getElementById('myModal');
    modal.classList.remove('show');

    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

window.onclick = function(event) {
    const modal = document.getElementById('myModal');
    if (event.target === modal) {
        closeModal();
    }
};

async function init() {
    const { recordUrl, loreUrl } = await fetchManifestUrls(language);
    await loadLore(recordUrl, loreUrl);
}

// Función para cambiar el idioma
function changeLanguage() {
    language = language === 'es-mx' ? 'es' : 'es-mx'; // Alterna entre 'es-mx' y 'es'
    document.getElementById("languageButton").innerText = `${language === 'es-mx' ? 'ES' : 'MX'}`; // Actualiza el texto del botón
    init(); // Vuelve a cargar los datos con el nuevo idioma
}

document.getElementById("languageButton").onclick = changeLanguage;

init();
