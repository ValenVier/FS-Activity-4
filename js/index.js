class Carrito {
  #productos 
  #currency
  #carrito

  constructor(obj) {
    this.#productos = obj.products;
    this.#currency = obj.currency;
    this.prodArray = [];
    this.#productos.forEach(element => {
      const a = {
        "SKU": element.SKU,
        "title": element.title,
        "price": element.price,
        "quantity": "0"
      }
      this.prodArray.push(a);
    });
    this.#carrito = {
      "total": "0",
      "currency": this.#currency,
      "products":this.prodArray
    }
  }

  actualizarUnidades(sku, unidades) {
    // Actualiza el número de unidades que se quieren comprar de un producto
    //Update the number of units you want to buy of a product. 
    const a = this.obtenerInformacionProducto(sku);
    a.quantity = unidades;
    
    this.obtenerCarrito();
  }

  obtenerInformacionProducto(sku) {
    // Devuelve los datos de un producto además de las unidades seleccionadas
    // Returns the data of a product in addition to the selected units.
    let a;
    this.#carrito.products.forEach(product => {
      if(product.SKU === sku){
        a=product;
      }      
    });
    return a;
  }

  obtenerCarrito() {
    // Devuelve información de los productos añadidos al carrito y el total calculado
    // Returns information about the products added to the cart and the calculated total.
    let b=0;
    this.#carrito.products.forEach(product => {
      b += Number(product.price) * Number(product.quantity);
    });
    this.#carrito.total = b > 0 ? b.toFixed(2)+this.#currency : 0+this.#currency;
    actualizarCarrito(this.#carrito);
  }
}

// Empiezo a construir la página cuando se haya cargado el DOM
// I start building the page when the DOM is loaded.
document.addEventListener('DOMContentLoaded', () => {
  // Llamada asíncrona a la API
  //Asynchronous API call
  fetch("https://jsonblob.com/api/jsonBlob/1122186662649282560")
  .then(res => res.json())
  .then(init)
})

const init = (obj) => {
  // Llamo a los creadores de las tablas del carrito y de los productos
  // I call the makers of the cart and product tables
  createProductsTable(obj);
  createTotalTable(obj);

  const carrito = new Carrito(obj);

  // Pongo escuchadores
  // I set listeners
  let token;
  // Token para saber si el cambio proviene de un botón o del teclado
  // Token to find out if the change comes from a button or from the keyboard
  document.querySelectorAll('.table__button--minus').forEach(elem => elem.addEventListener("click",(elem) => {
    operar(token=false,elem,obj,carrito)
  }));
  document.querySelectorAll('.table__button--plus').forEach(elem => elem.addEventListener("click",(elem) => {
    operar(token=false,elem,obj,carrito)
  }));

  // Recojo información que mete el usuario en el input
  // I collect information entered by the user in the input
  obj.products.forEach(element => {
    const id = document.getElementById('input'+element.SKU)
    id.oninput = function(){
      operar(token=true,element,obj,carrito,value = id.value);
    }
  });
  
}

function operar (token,elem,obj,carrito,...val) {
  // Cambiar el valor del input y del precio en la tabla de productos
  // Change input and price value in the product table
  let ref = '';
  let value = 0;
  let producto = '';
  let precioTotal = 0;
  if (token){
    ref = elem.SKU;
    precioTotal = Number(val[0]) * Number(elem.price)
    val[0] < 0 || val[0] === '' ? value = 0 : val[0][0] === '0' ? value = val[0].slice(1) : value = val[0];
    document.getElementById('input'+ref).value = value;    
  }else{
    ref = elem.target.getAttribute('data-id');
    const oper = elem.target.getAttribute('data-oper')
  
    value = Number(document.getElementById('input'+ref).value);
    oper === 'plus' ? value++ : value !== 0 ? value-- : value = 0 ;
    document.getElementById('input'+ref).value = value;
    
    producto = obj.products.find(product => product.SKU === ref);
    precioTotal = value * Number(producto.price);
  } 

  document.querySelector('[data-id=total'+ref+']').innerHTML = precioTotal > 0 ? precioTotal.toFixed(2)+obj.currency : 0+obj.currency;
  carrito.actualizarUnidades(ref, value);
}

function createProductsTable (obj) {
  // Creo tabla de productos
  // I create product table
  const listadoCabecera = ['Producto', 'Cantidad', 'Unidad', 'Total'];

  let table = document.createElement('table');
  table.classList.add('table');
  table.setAttribute('id','table__products');
  let thead = document.createElement('thead');
  let tbody = document.createElement('tbody');
  table.appendChild(thead);
  table.appendChild(tbody);

  document.getElementById('products').appendChild(table);
  
  const trh = document.createElement('tr');
  trh.classList.add('table__row0');

  // Cabecera -- Table Header
  let a=0;
  listadoCabecera.forEach(heading => {
    const th = document.createElement('th');
    th.innerHTML = heading;
    th.classList.add('text--normal');
    if(a===0){
      th.setAttribute('colspan','2');
    }
    trh.appendChild(th);
    a++;
  })
  thead.appendChild(trh);

  // Lista de productos -- Products list
  obj.products.forEach(product => {
    const trd = document.createElement('tr');
    trd.classList.add('table__row');
    const td0 = createProduct(product.title, product.SKU);
    const td1 = createButton(product.SKU);
    const td2 = document.createElement('td');
    td2.classList.add('table__data');
    const td3 = document.createElement('td');
    td3.classList.add('table__data');
    td3.setAttribute('data-id','total'+product.SKU);;
    td2.innerHTML = product.price + obj.currency;
    td3.innerHTML = 0+obj.currency;
    trd.appendChild(td0);
    trd.appendChild(td1);
    trd.appendChild(td2);
    trd.appendChild(td3);
    tbody.appendChild(trd);
  }) 
}

function createProduct(prod, ref){
  // Crear cada fila de producto -- Create each product row
  const span1 = document.createElement('span');
  span1.classList.add('text--product');
  span1.innerHTML = prod;

  const span2 = document.createElement('span');
  const p = document.createElement('p');
  p.innerHTML = `Ref: ${ref}`;

  span2.appendChild(p);

  const td = document.createElement('td');
  td.classList.add('table__data');
  td.setAttribute('colspan','2');
  td.appendChild(span1);
  td.appendChild(span2); 
  
  return td;
}

function createButton(ref){
  // Crear los botones y el input de cada fila -- Create the buttons and input for each row
  const buttonMinus = document.createElement('button');
  buttonMinus.classList.add('table__button--minus');
  buttonMinus.setAttribute('data-id',ref);
  buttonMinus.setAttribute('data-oper','minus');
  buttonMinus.innerHTML = '-';
  
  const buttonPlus = document.createElement('button');
  buttonPlus.classList.add('table__button--plus');
  buttonPlus.setAttribute('data-id',ref);
  buttonPlus.setAttribute('data-oper','plus');
  buttonPlus.innerHTML = '+';

  const input = document.createElement('input');
  input.classList.add('table__input');
  input.setAttribute('id','input'+ref);
  input.setAttribute('type','number');
  input.setAttribute('value','0');
  input.setAttribute('min','0');

  const td = document.createElement('td');
  td.classList.add('table__data');
  td.appendChild(buttonMinus);
  td.appendChild(input);
  td.appendChild(buttonPlus);
  
  return td;
}

function createTotalTable(obj){
  //Crear carrito inicial -- Create initial cart
  let table = document.createElement('table');
  table.classList.add('table2');
  table.setAttribute('id','table__total');
  let thead = document.createElement('thead');
  let tbody = document.createElement('tbody');
  tbody.setAttribute('id','total__tbody');
  table.appendChild(thead);
  table.appendChild(tbody);

  document.getElementById('total').appendChild(table);

  const trh = document.createElement('tr');
  trh.classList.add('table__row0');
  const th = document.createElement('th');
  th.classList.add('text--left','header--total');
  th.setAttribute('colspan','2');
  th.innerHTML = 'Total';

  trh.appendChild(th);
  thead.appendChild(trh);

  separador()
  total('0€')
}

function actualizarCarrito(carrito){
  // Modificar carrito con las cantidades de cada producto
  // Modify cart with the quantities of each product
  const tbody = document.getElementById('total__tbody');
  tbody.innerHTML = '';
  carrito.products.forEach(element => {
    if(element.quantity > 0) {
      let precio = (Number(element.price)*Number(element.quantity)).toFixed(2);
      precio > 0 ? precio = precio+carrito.currency : precio = "0" + carrito.currency;
      actualizarProductosCarrito(element.title,element.quantity,precio);
    }
  });
  separador();
  total(carrito.total);
}

function actualizarProductosCarrito(title, quantity, precio){
  // Añade los productos con su precio total -- Add the products with their total price
  const tbody = document.getElementById('total__tbody');
 
  const trTot = document.createElement('tr');
  trTot.classList.add('table__row2');
  const tdTot1 = document.createElement('td');
  const p1 = document.createElement('p');
  p1.classList.add('text--left');
  p1.innerHTML = title +' ('+quantity+')';
  tdTot1.appendChild(p1);
  const tdTot2 = document.createElement('td');
  const p2 = document.createElement('p');
  p2.classList.add('text--right');
  p2.innerHTML = precio;
  tdTot2.appendChild(p2);
  
  trTot.appendChild(tdTot1);
  trTot.appendChild(tdTot2);
  tbody.appendChild(trTot);
}

function separador(){
  // fila para mostrar el borde -- row to show the border
  const tbody = document.getElementById('total__tbody');
  const trd = document.createElement('tr');
  trd.classList.add('table__row2');
  const td = document.createElement('td');
  td.classList.add('text--separator');
  td.setAttribute('colspan','2');
  td.innerHTML = '&nbsp;';
  
  trd.appendChild(td);
  tbody.appendChild(trd);
}

function total(tot){
  // Fila del total -- Total row
  const tbody = document.getElementById('total__tbody');
  const trTot = document.createElement('tr');
  trTot.classList.add('table__row3');
  const tdTot1 = document.createElement('td');
  const p1 = document.createElement('p');
  p1.classList.add('text--left');
  p1.innerHTML = 'Total';
  tdTot1.appendChild(p1);
  const tdTot2 = document.createElement('td');
  const p2 = document.createElement('p');
  p2.classList.add('text--right');
  p2.innerHTML = tot;
  tdTot2.appendChild(p2);
  
  trTot.appendChild(tdTot1);
  trTot.appendChild(tdTot2);
  tbody.appendChild(trTot);
}