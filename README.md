<h1>React com redux parte 10 - (Saga) Middwares para actions</h1>

No caso de um e-commerce, quando precisamos adicionar um item ao carrinho, é necessário buscar
mais informações sobre o produto como peso estoque entre outras coisas, e para isso precisamos de chamada
a api, buscar os detalhes que faltam e sim adicionar ele ao carrinho.

- Instalar o `redux-saga`:

```bash
yarn add redux-saga
```


- Criar o arquivo `src/store/modules/cart/sagas.js`

- Aqui utilizaremos o `generators` [ES6 Generators estão mudando nosso modo de escrever JavaScript](https://medium.com/nossa-coletividad/es6-generators-estão-mudando-nosso-modo-de-escrever-javascript-e99f7c79bdd7)

- O `generators` é semelhante ao `async` e ao `await`, porém bem mais poderoso.

- No arquivo `src/store/modules/cart/saga.js` criaremos a seguinte function:

```js
function* addToCart() {

}
```

- Quando adicionarmos um item ao carrinho, não será chamado mais imediatamente o redux, mas sim essa function, para que busque os dados necessários do produto e depois então continue o fluxo como antes.

- Alterar também no arquivo `src/store/modules/cart/actions`, a function `addToCart`, não irá mais receber o produto inteiro mas sim  o id:

```js
export function addToCart(id) {
  return {
    type: '@cart/ADD',
    id
  };
}
```

- Na página `Home` também que executa o disparo dessa function alterar para enviar o id apenas ao invés de buscar o produto inteiro:

```js
handleAddProduct = id => {
  //...
  addToCart(id);
}
// ...
<button
  type="button"
  onClick={() => this.handleAddProduct(product.id)}
>
```

---

<h2>Trabalhando no arquivo cart/sagas</h2>

- Importar nossa api do axios:

```js
import api from '../../../services/api';
```

- Importar a lib `redux-saga/effects` obtendo a function `call`, esse metodo é responsavél por chamar metodos assíncronos que retorna `promise`, pois utilizando yeld não permite realizar isso.

```js
import { call } from 'redux-saga/effects';
```

- E agora na nossa function podemos implementar da seguinte forma:


```js
function* addToCart({ id }) {
  const response = yield call(api.get,`/products/${id}`);
}
```

- Perceba que o metodo `call`, não permite chamar diretamente a function `api.get(...)`, mas é necessário inserir os parametros de forma parametrizada.

- Mais informações de como utilizar metodos posts da api axios com o `call`:

- [Redux-Saga pass headers to axios.post call](https://stackoverflow.com/questions/53241315/redux-saga-pass-headers-to-axios-post-call) Ex.:

```js
function* createPostSaga(action) {
  const token = yield select(selectToken);
  const headerParams = {
    "Authorization": `JWT ${token}`
  };

  const apiCall = () => {
    return axios.post('/posts', {
      action.payload // only if not an object. Otherwise don't use outer {},
    },
    headerParams: headerParams,
   ).then(response => response.data)
    .catch(err => {
      throw err;
    });
  }

  console.log(token, headerParams);
  try {
    yield call(apiCall);
    yield call(getPosts());
  } catch (error) {
    console.log(error);
  }
}
```

- Continuando:

- Como o `sagas.js` na function `addToCart` ficou ouvindo a action `@cart/ADD`, precisamos ajustar essa action e criar uma nova action.

- Então no arquivo `src/store/modules/cart/actions.js` vamos alterar da seguinte forma:

```js
export function addToCartRequest(id) {
  return {
    type: '@cart/ADD_REQUEST',
    id
  };
}

export function addToCartSuccess(product) {
  return {
    type: '@cart/ADD_SUCCESS',
    product
  };
}

export function removeFromCart(id) {
  return { type: '@cart/REMOVE', id };
}

export function updateAmount(id, amount) {
  return { type: '@cart/UPDATE_AMOUNT', id, amount };
}

```

- A action `@cart/ADD_REQUEST` irá chamar o `saga` e o quando ela finalizar, o `saga` irá chamar a action `@cart/ADD_SUCCESS`

- Alteramos também o arquivo `src/store/modules/cart/reducer.js`:

```js
export default function cart(state = [], action) {
  switch (action.type) {
    case '@cart/ADD_SUCCESS':
      return produce(state, draft => {
        // console.log(draft.length);
        // console.log(Object.keys(draft));

        /* if (draft.length > 0) {
          console.log(Object.keys(draft[0]));
          console.log(draft[0].title);
        } */

        const productIndex = draft.findIndex(p => p.id === action.product.id);

        if (productIndex >= 0) {
          draft[productIndex].amount += 1;
        } else {
          draft.push({ ...action.product, amount: 1 });
        }
      });
    //...
  }
}

```

- E na página `Home` alteramos a chamada `addToCart` pois acabamos de altera-la:

```js
handleAddProduct = id => {
  const { addToCartRequest } = this.props;

  addToCartRequest(id);
};
```

---

<h2>Disparar um metódo dentro do saga</h2>

- Importo a action `addToCartSuccess`:

```js
import { addToCartSuccess } from './actions';
```

- No arquivo `src/store/modules/cart/sagas.js` utilizamos o `put` ele dispara uma action para o redux:

```js
import { call, put } from 'redux-saga/effects';
```

- E no final da function `addToCart` adiciono:

```js
yield put(addToCartSuccess(response.data))
```

- Até aí ok. Mas o que e como será chamada essa nossa function do saga?

- Precisamos importar mais um metodo do `redux-saga/effects` chamado `all` e o `takeLatest`:

```js
import { call, put, all, takeLatest } from 'redux-saga/effects';
```

- O `all` utilizamos para cadastrar vários listeners, para ficar ouvindo uma ou várias functions.

- O `takeLatest` diferente do `takeEvery`, no caso de o usário solicitar várias vezes a mesma função enquanto ainda estiver executnado alguma a anterior é descartada e só será considerada a última.

- Já o `takeEvery` é executado toda vez.

- Por fim vamos exportar o seguinte da function:

```js
export default all([takeLatest('@cart/ADD_REQUEST', addToCart)]);
```

- Os parametros do `takeLatest` o primeiro é a aciton que queremos ouvir, o segundo o que queremos executar.

---

<h2>Configurando o sagar na nossa aplicação</h2>

- Criar o arquivo `src/store/modules/rootSaga.js` que tem a mesma funcionalidade do `rootReducer` que é juntar todos os reducers em um único arquivo:

```js
import { all } from 'redux-saga/effects';

import cart from './cart/sagas';

// Exportamos um generator utilizando o function*
export default function* rootSaga() {
  // Podemos adicionar mais caso for necessario: all([cart, outro, ...])
  return yield all([cart]);
}
```

- Precisamos também alterar o arquivo `src/store/index.js`:

- Importamos o metodo `createSagaMiddleware` de dentro `redux-saga`:

```js
import createSagaMiddleware from 'redux-saga';
```

- do `redux` importamos o `applyMiddleware` e `compose`

- servem para criar e aplicar alguns middlewares no nosso store e também juntar algumas functions que faremos utilizando o `compose`

- Importar também o nosso arquivo `src/store/modules/rootSaga.js`:

```js
import rootSaga from './modules/rootSaga';
```

- Agora criamos uma const:

```js
const sagaMiddleware = createSagaMiddleware();
```

- No ambiente de desenvolvimento como já tenho o `console.tron.createEnhancer()`, precisamos unir o sagaMiddleware, e para não dar conflito utilizamos o compose:

```js
const enhancer =
  process.env.NODE_ENV === 'development' ? compose(console.tron.createEnhancer(), applyMiddleware(sagaMiddleware)) : null;
```

- E no ambiente de produção como não temos nenhuma function então não precisamos do compose apenas do applyMiddleware:

```js
const enhancer =
  process.env.NODE_ENV === 'development' ? compose(console.tron.createEnhancer(), applyMiddleware(sagaMiddleware)) : applyMiddleware(sagaMiddleware);
```

- E para finalizar antes do `export` inserimos a linha quer irá executar o middleware:

```js
sagaMiddleware.run(rootSaga);
```
