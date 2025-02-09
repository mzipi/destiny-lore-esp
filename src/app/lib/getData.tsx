export default async function getData() {

    interface booksInterface {
		hash: number;
        subtitle: string;
		displayProperties: {
			name: string;
			description: string;
            hasIcon: boolean;
			icon?: string;
		}
	}

	const response = await fetch("https://www.bungie.net/common/destiny2_content/json/es-mx/DestinyLoreDefinition-b236dc4b-cff6-4539-9e09-1525582fbe82.json")
	const data: booksInterface = await response.json()
	const books = Object.values(data)
	return books.slice(0, 1)
}