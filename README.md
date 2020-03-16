<h1>React com redux parte 12 - Verificar estoque no carrinho</h1>

- No arquivo `src/store/modules/cart/reducer.js` ajustar a listener da action `@cart/ADD_SUCCESS` :

```js
case '@cart/ADD_SUCCESS':
  return produce(state, draft => {
    const { product } = action;

    draft.push(product);
  });

```

- No arquivo `src/store/modules/cart/saga.js` ajustar a function `addToCart` :

```js
import { formatPrice } from '../../../util/format';

function* addToCart({ id }) {
  const response = yield call(api.get, `/products/${id}`);

  const data = {
    ...response.data,
    amount: 1,
    priceFormated: formatPrice(response.data.price)
  }

  yield put(addToCartSuccess(data));
}
```

- Para verificar se o produto já não foi adicionado ao carrinho precisamos importar uma function `select`
do `redux-saga/effects`, para acessar o estado da aplicação:

```js
import { call, select, put, all, takeLatest } from 'redux-saga/effects';
```

- Importar também a action:

```js
import { addToCartSuccess, updateAmount } from './actions';
```

- E no inicio da function `addToCart` realizamos a verificação, lembrando sempre que utiliza um effect no saga é necessário o `yield` na frente:

```js
const productExists = yield select(state => state.cart.find(p => p.id === id))


if (productExists) {
  const amount = productExists.amount + 1;
// Alterar o amount disparar uma action
  yield put(updateAmount(id, amount));
} else {
  const response = yield call(api.get, `/products/${id}`);

  const data = {
    ...response.data,
    amount: 1,
    priceFormated: formatPrice(response.data.price)
  }

  yield put(addToCartSuccess(data));
}

```
---

<h2>Verificar o estoque</h2>

- No arquivo `src/store/modules/cart/sagas.js` alterar o inicio da function `addToCart`:

```js
function* addToCart({ id }) {
  const productExists = yield select(state =>
    state.cart.find(p => p.id === id)
  );

  const stock = yield call(api.get, `/stock/${id}`);
  const stockAmount = stock.data.amount;
  const currentAmount = productExists ? productExists.amount : 0;

  const amount = currentAmount + 1;

  if (amount > stockAmount) {
    console.tron.warn('ERROR stock');

    return;
  }
  //...
}
```

---

<h2>Exibindo msg para o usuário quando não tem estoque</h2>

- Instalar a lib `react-toastify`:

```bash
yarn add react-toastify
```

- No `App.js` importar:

```js
import { ToastContainer } from 'react-toastify';
```

- E adicionar aos demais elementos:

```js
<Provider store={store}>
  <BrowserRouter>
    <Header />
    <Routes />

    <ToastContainer autoClose={3000} />

    <GlobalStyle />
  </BrowserRouter>
</Provider>
```

- No arquivo de style `src/style/global.js` adicionar os estilos do toastify:

```js
import 'react-toastify/dist/ReactToastify.css';
```

- No `src/store/modules/cart/saga.js` importar o `toast`

```js
import { toast } from 'react-toastify';
```

e logo após o if `if (amount > stockAmount) {` adicionar o seguinte:


```js
toast.error('Quantidade solicitada fora de estoque');
```


---

<h2>Verificar Estoque no carrinho</h2>

- Ajustar a actions em `src/store/modules/cart/actions.js` substituir a function `updateAmount`:

```js
export function updateAmountRequest(id, amount) {
  return { type: '@cart/UPDATE_AMOUNT_REQUEST', id, amount };
}

export function updateAmountSuccess(id, amount) {
  return { type: '@cart/UPDATE_AMOUNT_SUCCESS', id, amount };
}
```

- Na página `cart` alterar `updateAmount` por `updateAmountRequest`

- No arquivo `src/store/modules/cart/sagas.js` alterar `updateAmount` por `updateAmountSuccess`

- Alterar também `export default all([takeLatest('@cart/ADD_REQUEST', addToCart)]);` por:

```js
export default all([
  takeLatest('@cart/ADD_REQUEST', addToCart),
  takeLatest('@cart/UPDATE_AMOUNT_REQUEST', updateAmount),

  ]);
```

- Dessa forma ela irá ouvir também a action `@cart/UPDATE_AMOUNT_REQUEST`

- Criar a function ainda dentro do `saga.js`:

```js
function* updateAmount({ id, amount }){
  // Não permitir diminuir a quantidade para menos ou igual que zero
  if (amount <= 0) {
    return;
  }

  // Realizar chamada a api:

  const stock = yield call(api.get,`stock/${id}`);
  const stockAmount = stock.data.amount;

  if (amount > sockAmount) {
    console.tron.warn('ERROR stock');
    toast.error('Quantidade solicitada fora de estoque');
    return;
  }

  yield put(updateAmountSuccess(id, amount));
}
```

- No `src/store/modules/cart/reducer.js` alterar onde está o seguinte:

```js
case '@cart/UPDATE_AMOUNT':
  if (action.amount <= 0) {
    return state;
  }
  return produce(state, draft => {
    const productIndex = draft.findIndex(p => p.id === action.id);

    if (productIndex >= 0) {
      draft[productIndex].amount = Number(action.amount);
    }
  });
```

- Para o seguinte:

```js
case '@cart/UPDATE_AMOUNT_SUCCESS':
  return produce(state, draft => {
    const productIndex = draft.findIndex(p => p.id === action.id);

    if (productIndex >= 0) {
      draft[productIndex].amount = Number(action.amount);
    }
  });
```


---

Sempre que precisar chamar api, ou um request assim por diante para realzar alguma verificação dentro do redux, utilizamos o saga.
