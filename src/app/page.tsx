export default async function Home() {

	interface fetchInterface {
		hash: number;
		displayProperties: {
			name: string;
			description: string;
		}
	}

	const response = await fetch("https://www.bungie.net/common/destiny2_content/json/es-mx/DestinyLoreDefinition-7881b91d-c6d2-4921-9fd0-c9bdfa4f38ca.json")
	const data: fetchInterface = await response.json()

	const books = Object.values(data)

	return (
		<div>
			<ul>
				{books.map(book => {
					return(
						<li key={book.hash}>
							<h1>{book.subtitle}</h1>
							<h2>{book.displayProperties.name}</h2>
							<p>{book.displayProperties.description}</p>
						</li>
					)
				})}
			</ul>
		</div>
	)
}