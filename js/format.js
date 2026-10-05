const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "USD" })

export const formatPrice = (value) => money.format(value)
export const formatRating = (value) => value.toFixed(1).replace(".", ",")
export const discountedPrice = (price, percentage) => price * (1 - percentage / 100)

export function formatCategory(slug) {
	const text = slug.replace(/-/g, " ")
	return text.charAt(0).toUpperCase() + text.slice(1)
}
