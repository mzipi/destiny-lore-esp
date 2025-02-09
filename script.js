let items = [];
let currentPage = 0;
const itemsPerPage = 10;

async function loadLore() {
    try {
        const response = await fetch("https://www.bungie.net/common/destiny2_content/json/es-mx/DestinyLoreDefinition-b236dc4b-cff6-4539-9e09-1525582fbe82.json");
        const data = await response.json();

        if (!data || typeof data !== "object") {
            document.getElementById("content").innerText = "Error: No se encontró la información.";
            return;
        }

        Object.keys(data).forEach(key => {
            const item = data[key];
            items.push({
                key: key || "Sin key",
                hash: item.hash || "Sin hash",
                index: item.index || "Sin índice",
                subtitle: item.subtitle || "Sin subtítulo",
                description: item.displayProperties?.description || "Sin descripción",
                name: item.displayProperties?.name || "Sin nombre",
                hasIcon: item.displayProperties?.hasIcon || false,
                icon: item.displayProperties?.hasIcon ? `https://www.bungie.net${item.displayProperties.icon}` : null,
                redacted: item.redacted || false,
                blacklisted: item.blacklisted || false
            });
        });

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

    currentItems.forEach(item => {
        contentDiv.innerHTML += `
            <div class="card" onclick="openModal(${items.indexOf(item)})">
                ${item.icon ? `<img src="${item.icon}" alt="${item.name}">` : ""}
                <h2>${item.name}</h2>
                <h3>${item.subtitle}</h3>
            </div>
        `;
    });

    document.getElementById("prevButton").disabled = currentPage === 0;
    document.getElementById("nextButton").disabled = endIndex >= items.length;
}

function openModal(itemIndex) {
    const item = items[itemIndex];
    const modal = document.getElementById('myModal');
    const modalContent = document.querySelector('.modal-content');

    modalContent.innerHTML = `
        <span onclick="closeModal()" style="cursor:pointer; float:right;">&times;</span>
        <h2>${item.name}</h2>
        <h3>${item.subtitle}</h3>
        <p>${item.description}</p>
        <small>Index: ${item.index}</small><br>
        <small>Hash: ${item.hash}</small><br>
        <small>Key: ${item.key}</small><br>
        <small>Icon: ${item.hasIcon}</small><br>
        <small>Redacted: ${item.redacted}</small><br>
        <small>Blacklisted: ${item.blacklisted}</small><br>
        <div class="button-container">
            <button onclick="closeModal()">Cerrar</button>
        </div>
    `;

    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('myModal').style.display = 'none';
}

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
    if ((currentPage + 1) * itemsPerPage < items.length) {
        currentPage++;
        displayItems();
    }
};

loadLore();
