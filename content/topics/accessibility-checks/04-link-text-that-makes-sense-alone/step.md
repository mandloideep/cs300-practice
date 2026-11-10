---
title: Link text that makes sense on its own
mode: edit
entry: src/main.jsx
inspector:
  views: [dom, boundaries]
  watch: [ProductCard]
required: [product-links-name-the-product, no-two-links-share-a-name, logo-link-has-a-name]
---

A screen reader can list every link on a page by its text, and a keyboard user moves from link to link with **Tab**; either way, each link is heard or seen apart from the words around it.
On the Products page that list reads "View details" six times, and the logo in the header is an image link with no text at all, so it is read as an unnamed link or as the image's address.
Step through the picture to hear what a screen reader says for an image with no `alt`, with `alt` text, and with an empty `alt`.

```demo name="alt-text"
{ "src": "logo.svg", "alt": "Shop home" }
```

```predict
A screen reader user opens the list of links on the Products page. How many entries can they tell apart?
- Nine, one for each link
= Four: Home, Products, the unnamed logo link, and View details, which appears six times
- None, because the list only shows addresses
```

## The product title is the link

Make each product's title the link to its page, so the link says where it goes.

```jsx file="src/App.jsx" action="replace" anchor='      <span className="product-title">{product.title}</span>'
      <Link className="product-title" to={"/products/" + product.id}>
        {product.title}
      </Link>
```

The separate "View details" link now goes to the same page as the title, so it is one more stop that says less; delete it.

```jsx file="src/App.jsx" action="delete" anchor='      <Link to={"/products/" + product.id}>View details</Link>'
```

## Name the logo link

An image inside a link gives the link its name through its `alt`, so the `alt` says where the link goes, not what the picture looks like.

```jsx file="src/App.jsx" action="replace" anchor='          <img src={logo} width="32" height="32" />'
          <img src={logo} width="32" height="32" alt="Shop home" />
```

Run the code, press **Products**, and press **Tab** through the page: every stop names a product or a place, and the first stop, the logo, is **Shop home** in the inspector's DOM view.

## Read more

### Why "View details" fails

Each "View details" means something only next to its product's title, and a link list or a **Tab** walk takes the link away from its neighbors.
Six links with one name that go to six places are the failure a checker reports as "links with the same name have different purposes".
`aria-label="View details for Powder Canister"` would also fix it, but the visible text and the name would then differ, and a voice control user who says "click View details" would not reach the link they mean; making the visible text say it is the simpler fix.

### alt on an image that is not a link

An image that carries information gets `alt` text that gives the same information, such as a chart's main number.
An image that is only decoration gets `alt=""`, so that a screen reader skips it.
An image with no `alt` attribute at all is the worst case, because a screen reader then guesses, often by reading the file name or the address.

### Link or button

A link goes somewhere, and a button does something on this page; a "Remove" control is a `button`, and "Powder Canister" is a link.
The keyboard treats them differently too: **Enter** follows a link, and **Enter** or **Space** presses a button.

**If it breaks:** If the console says `Link is not defined`, the import from `react-router` lost `Link`; it is still used by the product title.
If a product title is no longer bold, the `Link` lost `className="product-title"`.
If the checks say a link has no name, look in the DOM view for an `a` with neither text nor an `img` with `alt` inside.

**Check:** Run the code, press **Products**, and **Tab** through the page: the logo is **Shop home**, each product title is a link to its own page, and no link says "View details".
Then press **Run checks**.

```quiz
Which link text works best for a link to the Capstone's book detail page?
- Click here
- More
= The book's title, Robot Garden
> A link's text is its name when it is heard or seen on its own; the title says where the link goes, and it is different for every book.
```
