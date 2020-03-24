<h1>React com redux parte 13 - Converter para Hooks</h1>

- Instalar o `eslint-plugin-react-hooks`:

```bash
yarn add eslint-plugin-react-hooks -D
```

- No arquivo `eslintrc.js` adicionar em `plugins`:

```js
'react-hooks'
```

- em `rules` adicionar:

```js
'react-hooks/rules-of-hooks': 'error',
'react-hooks/exhaustive-deps': 'warn',
```

- Na Página Home alterar de class para function:

```js
function Home({ amount, addToCartRequest }) {
```

- Importar o `useState` e o `useEffect`:

```js
import React, { useState, useEffect } from 'react';
```

- Substituir o `state` por:

```js
const [products, setProducts] = useState([]);
```

- Alterar as functions de classes anteriores por:

```js
useEffect(() => {
    async function loadProducts() {
      const response = await api.get('/products');

      const data = response.data.map(product => ({
        ...product,
        priceFormatted: formatPrice(product.price)
      }));

      setProducts(data);
    }

    loadProducts();
  }, []);

  function handleAddProduct(id) {
    addToCartRequest(id);
  }
```

- Remover o `this.` das chamadas de de functions

----

<h2>Ajustes para utilização do `connect` utilizando hooks</h2>

- No arquivo: `src/components/Header/index.js`, importar o seguinte:

```js
import { useDispatch, useSelector } from 'react-redux';
```

- Alterar a function Header:

```js
export default function Header() {
  const cartSize = useSelector(state => state.cart.length);
  //...

}
```

- Voltando para página `Home` realizar alguns ajustes:

```js
export default function Home() {
  //...
}
```


```js
const amount = useSelector(state =>
    state.cart.reduce((sumAmount, product) => {
      sumAmount[product.id] = product.amount;
      return sumAmount;
    }, {})
  );

const dispatch = useDispatch();
```

- Remover toda parte após a function `Home()`

- Alterar o conteudo da function `handleAddProduct`:

```js
dispatch(CartActions.addToCartRequest(id));
```


---

<h2>Ajustes no Cart</h2>

- Na página Cart:

- importar o seguinte:

```js
import { useSelector, useDispatch } from 'react-redux';
```

- Remover o import:

```js
import { bindActionCreators } from 'redux';
```

- Remover todos os parametros que vem das props, dessa forma ficará assim:

```js
function Cart() {
  //...

}
```

- Adicionar o seguinte a function `Cart`:

```js
const total = useSelector(state =>
    formatPrice(
      state.cart.reduce((sumTotal, product) => {
        return sumTotal + product.amount * product.price;
      }, 0)
    )
  );

  const cart = useSelector(state =>
    state.cart.map(product => ({
      ...product,
      subtotal: formatPrice(product.amount * product.price)
    }))
  );

  const dispatch = useDispatch();
```

- Ajustar as functions `increment` e `decrement`:

```js
function increment(product) {
    const { id, amount } = product;
    dispatch(CartActions.updateAmountRequest(id, amount + 1));
  }

  function decrement(product) {
    const { id, amount } = product;
    dispatch(CartActions.updateAmountRequest(id, amount - 1));
  }
```

- E porfim o botão para remover o item:

```js
<button
  type="button"
  onClick={() =>
    dispatch(CartActions.removeFromCart(product.id))
  }
>
```

- Dessa forma facilitou muito o hooks para trabalhar com redux

- Toda vez que precisar acessar uma informação do estado do redux utilizamos o `useSelector`

- Quando precisamos disparar uma action do redux utilizamos o `useDispatch`
