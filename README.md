<h1>React com redux parte 13 - Route com Redux</h1>

- Queremos direcionar o usuário para carrinho quando ele adiciona um item pela home,
poderiamos realizar da sequinte forma porém incorreta:

```js
handleAddProduct = id => {
    const { addToCartRequest } = this.props;

    addToCartRequest(id);

    this.props.history.push('/cart');
  };
```

- Porém como dentro do `addToCartRequest(id)` o js está executando uma chamada a uma api, pode ser que ela demore
e a navegação execute antes de ela terminar, e não adianta colocar um `await` na frente que não irá funcionar nesse caso.

- Dessa forma precisamos redirecionar para o carrinho lá dentro do saga.

- Inicialmente vamos adicionar a lib `history`:

```bash
yarn add history
```

- Ela serve para controla a parte de history da aplicação.

- Criamos o arquivo `src/services/history.js` adicionamos o seguinte dentro dele:

```js
import { createBrowserHistory } from 'history';

const history = createBrowserHistory();

export default history;
```

- No arquivo `App.js` adicionar o import do history:

```js
import history from './services/history';
```

- Ao invés de importar `BrowserRouter` importamos `Router`

- Alteramos também a tag `<BrowserRouter>` por `<Router>`

- E nessa tag `<Router>` adicionamos o seguinte:

```js
<Router history={history}>
```

- Agora no arquivo `src/store/modules/cart/sagas.js` importamos o `services/history`:

```js
import history from '../../../services/history';
```

- E na parte de adição dentro do else adicionamos:

```js
history.push('/cart');
```

- Agora o redirecionamento realmente é executado após a chamada da api.

- Para testar que isso realmente está funcionando podemos executar o seguinte comando do json-server:

```bash
json-server server.json -p 3333 -d 2000
```

- Dessa forma ele terá um delay de 2 segundos para realizar a chamada da api, e o history realmente só será chamado após a chamada da api.
