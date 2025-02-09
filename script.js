let items = [];
let currentPage = 0;
const itemsPerPage = 8;

async function loadLore() {
    try {
        const [loreData, recordsData] = await Promise.all([
            fetch("https://www.bungie.net/common/destiny2_content/json/es-mx/DestinyLoreDefinition-b236dc4b-cff6-4539-9e09-1525582fbe82.json").then(res => res.json()),
            fetch("https://www.bungie.net/common/destiny2_content/json/es-mx/DestinyRecordDefinition-b236dc4b-cff6-4539-9e09-1525582fbe82.json").then(res => res.json())
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

        // Ordenar por índice
        items.sort((a, b) => a.index - b.index);

        displayItems();

    } catch (error) {
        document.getElementById("content").innerText = "Error al cargar los datos.";
        console.error("Error:", error);
    }
}

function displayItems() {
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = items.slice(startIndex, endIndex);

    const contentDiv = document.getElementById("content");
    contentDiv.innerHTML = "";

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

    document.getElementById("prevButton").disabled = currentPage === 0;
    document.getElementById("nextButton").disabled = endIndex >= items.length;
}

function navigate(direction) {
    if (direction === 'prev' && currentPage > 0) {
        currentPage--;
    } else if (direction === 'next' && (currentPage + 1) * itemsPerPage < items.length) {
        currentPage++;
    }
    displayItems();
}

document.getElementById("prevButton").onclick = () => navigate('prev');
document.getElementById("nextButton").onclick = () => navigate('next');

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

loadLore();
