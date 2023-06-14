export function GET() {
	const number = Math.floor(Math.random() * 6) + 1;

	const randomNumber = {
		number
	};

	return new Response(JSON.stringify(randomNumber), {
		headers: {
			'Content-Type': 'application/json'
		}
	});
}
