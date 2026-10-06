import { fetchProduct } from "../api.js"
import { toElement, esc } from "../dom.js"
import { statusBox, withImageFallback } from "../components.js"
import { formatPrice, formatRating, formatCategory, discountedPrice } from "../format.js"

const fact = (label, value) => `<div><dt>${label}</dt><dd>${value}</dd></div>`

function starsHtml(rating) {
	const full = Math.floor(rating)
	const half = rating - full >= 0.25 && rating - full < 0.75 ? 1 : 0
	const empty = 5 - full - half
	const fullStar = `<span class="star star--full" aria-hidden="true">★</span>`
	const halfStar = `<span class="star star--half" aria-hidden="true">★</span>`
	const emptyStar = `<span class="star star--empty" aria-hidden="true">★</span>`
	return (
		`<span class="star-rating" role="img" aria-label="Avaliação: ${rating.toFixed(1)} de 5 estrelas">` +
		fullStar.repeat(full) +
		halfStar.repeat(half) +
		emptyStar.repeat(empty) +
		`<span class="star-rating__value">${formatRating(rating)} de 5</span>` +
		`</span>`
	)
}

function breadcrumbHtml(backHref, category, title) {
	return `
		<nav class="breadcrumb" aria-label="Navegação estrutural">
			<ol>
				<li><a href="${esc(backHref)}">Catálogo</a></li>
				<li><span>${esc(formatCategory(category))}</span></li>
				<li><span aria-current="page">${esc(title)}</span></li>
			</ol>
		</nav>
	`
}

function productDetail(product, backHref) {
	const tags = product.tags?.length
		? `<ul class="tags" aria-label="Tags">${product.tags.map((tag) => `<li>${esc(tag)}</li>`).join("")}</ul>`
		: ""

	const originalPrice = product.price
	const finalPrice = discountedPrice(product.price, product.discountPercentage)
	const discountPct = product.discountPercentage.toFixed(0)

	const priceBlock = `
		<div class="price-block">
			<span class="price-block__original">${formatPrice(originalPrice)}</span>
			<span class="price-block__final">${formatPrice(finalPrice)}</span>
			<span class="price-block__badge">${discountPct}% OFF</span>
		</div>
	`

	const article = toElement(`
		<article class="detail">
			${breadcrumbHtml(backHref, product.category, product.title)}
			<div class="detail__grid">
				<img class="detail__image" src="${esc(product.images?.[0] ?? product.thumbnail)}" alt="${esc(product.title)}" width="480" height="480">
				<div>
					<span class="detail__category">${esc(formatCategory(product.category))}</span>
					<h1 tabindex="-1">${esc(product.title)}</h1>
					<span class="detail__brand">${esc(product.brand)}</span>
					${starsHtml(product.rating)}
					<p class="detail__desc">${esc(product.description)}</p>
					${priceBlock}
					<dl class="facts">
						${fact("Estoque", `${product.stock} unidades`)}
					</dl>
					${tags}
				</div>
			</div>
		</article>
	`)
	withImageFallback(article.querySelector(".detail__image"))
	return article
}

export async function renderDetail(root, id, backHref) {
	const view = `detail-${id}`
	root.dataset.view = view
	document.title = "Carregando produto…"
	root.replaceChildren(statusBox({ kind: "loading", title: "Carregando produto…" }))

	try {
		const product = await fetchProduct(id)
		if (root.dataset.view !== view) return

		document.title = `${product.title} | Catálogo de produtos`
		root.replaceChildren(productDetail(product, backHref))
		root.querySelector("h1").focus({ preventScroll: true })
	} catch (error) {
		if (root.dataset.view !== view) return

		const notFound = error.status === 404
		document.title = notFound ? "Produto não encontrado" : "Erro ao carregar produto"
		root.replaceChildren(
			toElement(`<a class="back" href="${esc(backHref)}">Voltar ao catálogo</a>`),
			statusBox({
				kind: "error",
				title: notFound ? "Produto não encontrado" : "Não foi possível carregar o produto",
				text: notFound ? `Não existe um produto com o código ${id}.` : "Verifique sua conexão e tente novamente.",
				actionLabel: notFound ? undefined : "Tentar novamente",
				onAction: () => renderDetail(root, id, backHref),
			}),
		)
	}
}
