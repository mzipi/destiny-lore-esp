let items = [];
let currentPage = 0;
let itemsPerPage = 1;
let language = localStorage.getItem("selectedLanguage") || 'es-mx';
let filteredItems = [];
const h2Elements = document.querySelectorAll('.card-content h2');

async function init() {
    updateItemsPerPage();
    const { recordUrl, loreUrl } = await fetchManifestUrls(language);
    await loadLore(recordUrl, loreUrl);
    displayItems(items); // Asegurar que se pasan los ítems cargados
}

function updateItemsPerPage() {
    if (window.innerWidth < 768) {
        itemsPerPage = 1;
    } else if (window.innerWidth < 1080 && window.innerHeight >= 845) {
        itemsPerPage = 4;
    } else if (window.innerWidth < 1080 && window.innerHeight < 845) {
        itemsPerPage = 2;
    } else {
        itemsPerPage = 8;
    }
}

async function fetchManifestUrls(language) {
    try {
        const response = await fetch("https://www.bungie.net/Platform/Destiny2/Manifest/");
        const manifestData = await response.json();

        // Construir las URLs correctamente
        const recordUrl = `https://www.bungie.net${manifestData.Response.jsonWorldComponentContentPaths[language].DestinyRecordDefinition}`;
        const loreUrl = `https://www.bungie.net${manifestData.Response.jsonWorldComponentContentPaths[language].DestinyLoreDefinition}`;

        console.log("recordUrl:", recordUrl);
        console.log("loreUrl:", loreUrl);

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
function displayItems(itemList = filteredItems.length > 0 ? filteredItems : items) {
    const contentDiv = document.getElementById("content");
    
    contentDiv.classList.add("slide-out");

    setTimeout(() => {
        contentDiv.innerHTML = "";
        const fragment = document.createDocumentFragment();

        const startIndex = currentPage * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentItems = itemList.slice(startIndex, endIndex);

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
        
            // Crear el contenedor del tooltip
            const tooltip = document.createElement("span");
            tooltip.className = "tooltip-text"; // Clase para el tooltip
            tooltip.textContent = item.name; // Texto completo
        
            // Añadir el tooltip al h2
            const tooltipContainer = document.createElement("div");
            tooltipContainer.className = "tooltip";
            tooltipContainer.appendChild(title);
            tooltipContainer.appendChild(tooltip);
            
            cardContent.appendChild(tooltipContainer);
            card.appendChild(cardContent);
            fragment.appendChild(card);
        });
        

        contentDiv.appendChild(fragment);

        contentDiv.classList.remove("slide-out");
        contentDiv.classList.add("slide-in");

        // Actualizar botones de paginación
        document.getElementById("prevButton").disabled = currentPage === 0;
        document.getElementById("nextButton").disabled = endIndex >= itemList.length;
    }, 500);
}

function openModal(itemIndex) {
    const item = items[itemIndex];
    const modal = document.getElementById('myModal');
    const modalContent = document.querySelector('.modal-content');

    modalContent.innerHTML = `
        <div class="modal-header">
            <h2>${item.name}</h2>
            <span onclick="closeModal()" class="close-button">&times;</span>
        </div>
        <div class="modal-body">
            <p>${item.description}</p>
        </div>
        <div class="modal-footer">
            <!--button onclick="closeModal()">Cerrar</button-->
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

function changeLanguage() {
    language = language === 'es-mx' ? 'es' : 'es-mx';
    localStorage.setItem("selectedLanguage", language);
    document.getElementById("languageButton").innerText = language === 'es-mx' ? 'MX' : 'ES';
    init();
}

function searchItems() {
    const query = document.getElementById("searchInput").value.toLowerCase();
    filteredItems = items.filter(item => 
        item.name.toLowerCase().includes(query) || 
        item.description.toLowerCase().includes(query)
    );

    currentPage = 0; // Reinicia la paginación
    displayItems(filteredItems);
}

window.addEventListener('resize', () => {
    updateItemsPerPage();
    displayItems();
});

window.onclick = function(event) {
    const modal = document.getElementById('myModal');
    if (event.target === modal) {
        closeModal();
    }
};

document.getElementById("prevButton").onclick = () => {
    if (currentPage > 0) {
        currentPage--;
        displayItems();
    }
};

document.getElementById("nextButton").onclick = () => {
    const itemList = filteredItems.length > 0 ? filteredItems : items;
    if ((currentPage + 1) * itemsPerPage < itemList.length) {
        currentPage++;
        displayItems();
    }
};

function toggleClearButton() {
    const input = document.getElementById("searchInput");
    const clearButton = document.getElementById("clearButton");
    clearButton.style.display = input.value ? "block" : "none";
}

function clearSearch() {
    document.getElementById("searchInput").value = ""; // Borrar texto
    toggleClearButton(); // Ocultar botón
    searchItems(); // Llamar a la función para resetear los resultados
}

document.getElementById("languageButton").innerText = language === 'es-mx' ? 'MX' : 'ES';
document.getElementById("languageButton").onclick = changeLanguage;

init();
toggleClearButton();

h2Elements.forEach(h2 => {
    h2.addEventListener('mouseover', () => {
        const tooltipText = h2.innerText; // Obtiene el texto completo
        const tooltip = h2.querySelector('.tooltip-text');
        tooltip.innerText = tooltipText; // Establece el texto del tooltip
    });
});