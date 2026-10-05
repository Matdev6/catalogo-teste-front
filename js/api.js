const BASE_URL = "https://dummyjson.com/products"

async function request(url) {
	const response = await fetch(url)
	if (!response.ok) {
		const error = new Error(`Falha na requisição (HTTP ${response.status})`)
		error.status = response.status
		throw error
	}
	return response.json()
}

export function fetchProducts({ q, category, sortBy, order, limit, skip }) {
	const params = new URLSearchParams({ limit, skip })
	if (sortBy) {
		params.set("sortBy", sortBy)
		params.set("order", order)
	}

	let path = ""
	if (q) {
		path = "/search"
		params.set("q", q)
	} else if (category) {
		path = `/category/${encodeURIComponent(category)}`
	}

	return request(`${BASE_URL}${path}?${params}`)
}

export const fetchProduct = (id) => request(`${BASE_URL}/${encodeURIComponent(id)}`)
export const fetchCategories = () => request(`${BASE_URL}/categories`)
