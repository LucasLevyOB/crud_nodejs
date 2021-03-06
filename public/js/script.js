const toggleButton = document.getElementById('toggle-sidebar');
const sideBar = document.getElementById('sidebar');
const datatable = document.getElementById('datatable');
const tbody = document.getElementById('datatable-tbody');
const thead = document.getElementById('datatable-thead');
const mainBody = document.getElementById('main-body');
const messageSelect = document.getElementById('message-pagination');
const inputProductName = document.getElementById('product-name');
const inputProductPrice = document.getElementById('product-price');
const inputProductQuantity = document.getElementById('product-quantity');
const inputProductSolds = document.getElementById('product-solds');
const searchButton = document.getElementById('search-button');
const searchInput = document.getElementById('search-input');
const scroll = document.getElementsByClassName('scroll')[0];
const messageSearch = document.getElementById('message-search');
const deleteModal = document.getElementById('delete-modal');
const anchorDeleteModal = document.getElementById('anchor-delete-modal');

var offset = 10;
const quantityProducts = 5;
var empty = false;

try {
    tbody.addEventListener('click', elem => {
        const element = elem.target;
        if(element.getAttribute('product-id')) {
            $('#delete-modal').modal('show');
            anchorDeleteModal.setAttribute('href', `/delete/${element.getAttribute('product-id')}`)
        }
    })
} catch(error) {}

try {
    searchButton.addEventListener('click', elem => {
        elem.preventDefault();
        if(searchInput.value === '') {
            datatable.classList.add('d-none');
            messageSearch.innerText = 'Por favor digite algo no campo de pesquisa.';
            messageSearch.classList.remove('d-none');
            return false;
        }
        searchProducts(searchInput.value, tbody);
    });
} catch(error) {

}

function searchProducts(value, tbodyTable) {
    if(self.fetch) {
        datatable.classList.add('d-none');
        messageSearch.innerText = 'Carregando...';
        messageSearch.classList.remove('d-none');
        fetch(`http://localhost:3000/produtos/select/${value}`)
        .then(response => response.json())
        .then(jsonArray => {
            if(jsonArray.length !== 0) {
                tbody.innerHTML = '';
                datatable.classList.remove('d-none');
                messageSearch.classList.add('d-none');
                jsonArray.map(object => {
                    addValuesTable(tbody, object);
                });
                return false;
            }
            datatable.classList.add('d-none');
            messageSearch.innerText = 'Nenhum produto encontrado.';
            messageSearch.classList.remove('d-none');
        })
        .catch( error => {
            datatable.classList.add('d-none');
            messageSearch.innerText = 'Houve um erro inesperado, desculpe!';
            messageSearch.classList.remove('d-none');
            console.error('Erro: ', error);
        });
    } else {
        console.error('Não possui suporte à Fetch API');
    }
}

function getProducts(offset, quantityProducts) {
    if(self.fetch) {
        fetch(`http://localhost:3000/produtos/select/${offset}/${quantityProducts}`)
        .then(response => response.json())
        .then(jsonArray => {
            jsonArray.map(object => {
                // const array = convertObjectArray(object);
                addValuesTable(tbody, object);
            })
            if(jsonArray.length === 0) {
                empty = true;
            }
            // console.log(jsonArray);
        })
        .catch( error => {
            console.error('Erro: ', error);
        });
    } else {
        console.error('Não possui suporte à Fetch API');
    }
}

function createElementH(element) {
    const createdElement = document.createElement(element);
    return createdElement;
}

function createTextContent(text) {
    const newContent = document.createTextNode(text);
    return newContent;
}

function createElementChild(element, child) {
    element.appendChild(child);
}

function convertObjectArray(object) {
    const array = Object.values(object);
    return array;
}

function treatPrice(number) {
    return number.toFixed(2).toString().replace('.', ',');
}

function addValuesTable(tbodyTable, object) {
    const tr = createElementH('tr');
    const td1 = createElementH('td');
    const content1 = createTextContent(object.pro_name);
    createElementChild(td1, content1);
    createElementChild(tr, td1);
    const td2 = createElementH('td');
    const content2 = createTextContent(treatPrice(object.pro_price));
    createElementChild(td2, content2);
    createElementChild(tr, td2);
    const td3 = createElementH('td');
    const content3 = createTextContent(object.pro_quantity);
    createElementChild(td3, content3);
    createElementChild(tr, td3);
    const td4 = createElementH('td');
    const content4 = createTextContent(object.pro_solds);
    createElementChild(td4, content4);
    createElementChild(tr, td4);
    const td5 = createElementH('td');
    const linkUpdate = createElementH('a');
    linkUpdate.setAttribute('href', `/update/${object.pro_id}`);
    const iconUpdate = createElementH('i');
    iconUpdate.classList.add('fas', 'fa-edit', 'fa-2x', 'actions-icons', 'edit-icon');
    createElementChild(linkUpdate, iconUpdate);
    const linkDelete = createElementH('a');
    // href="#" class="delete-icon-anchor" product-id="<%= product.pro_id %>"
    linkDelete.setAttribute('href', '#');
    linkDelete.setAttribute('product-id', object.pro_id);
    linkDelete.classList.add('delete-icon-anchor');
    const iconDelete = createElementH('i');
    iconDelete.classList.add('fas', 'fa-trash-alt', 'fa-2x', 'actions-icons', 'delete-icon');
    createElementChild(linkDelete, iconDelete);
    createElementChild(td5, linkUpdate);
    createElementChild(td5, linkDelete);
    createElementChild(tr, td5);
    createElementChild(tbodyTable, tr);
}
// function addValuesTable(tbodyTable, array) {
//     // console.log(array)
//     const tr = createElementH('tr');
//     array.map(value => {
//         const td = createElementH('td');
//         const content = createTextContent(value);
//         createElementChild(td, content);
//         createElementChild(tr, td);
//     });
//     createElementChild(tbodyTable, tr);
// }

function sortTable(elem) {
    if(!elem.target.getAttribute('value')) {
        return false;
    }
    const thValue = elem.target.getAttribute('value');
    const order = elem.target.getAttribute('order');
    const tableLenght = datatable.rows.length;
    for(let i = 0; i < tableLenght; i++) {
        for(let j = 2; j < tableLenght; j++) {
            const previus = datatable.rows[j - 1].cells[thValue].innerText;
            const current = datatable.rows[j].cells[thValue].innerText;
            const previusTreaty = !isNaN(previus.replace(',', '.')) ? parseFloat(previus.replace(',', '.')) : previus;
            const currentTreaty = !isNaN(current.replace(',', '.')) ? parseFloat(current.replace(',', '.')) : current;
            if(order === 'asc') {
                if(previusTreaty > currentTreaty) {
                    const removed = tbody.removeChild(datatable.rows[j - 1]);
                    tbody.insertBefore(removed, datatable.rows[j]);
                }
            } else {
                if(previusTreaty < currentTreaty) {
                    const removed = tbody.removeChild(datatable.rows[j - 1]);
                    tbody.insertBefore(removed, datatable.rows[j]);
                }
            }
        }
    }
    if(order === 'asc') {
        elem.target.setAttribute('order', 'desc');
        elem.target.children[0].classList.remove('fa-sort-down');
        elem.target.children[0].classList.add('fa-sort-up');
    } else {
        elem.target.setAttribute('order', 'asc');
        elem.target.children[0].classList.remove('fa-sort-up');
        elem.target.children[0].classList.add('fa-sort-down');
    }
}

try {
    inputProductName.focus();
    inputProductPrice.addEventListener('keypress', elem => {
        if(elem.target.value.length > 5 && elem.target.value.indexOf(',') === -1) {
            elem.target.value = elem.target.value.slice(0, 5) + ',';
        }
        if(!elem.key.match(/[0-9]|\,/)) {
            elem.preventDefault();
        }
    })
    inputProductQuantity.addEventListener('keypress', elem => {
        if(!elem.key.match(/[0-9]/)) {
            elem.preventDefault();
        }
    })
    inputProductSolds.addEventListener('keypress', elem => {
        if(!elem.key.match(/[0-9]/)) {
            elem.preventDefault();
        }
    })
} catch(error) {}

try {
    scroll.addEventListener('scroll', element => {
        const elementHeight = element.target.scrollHeight;
        const positionScroll = element.target.scrollTop + element.target.clientHeight;
        if(positionScroll >= elementHeight - 10 && empty === false) {
            getProducts(offset, quantityProducts);
            offset+= 5;
        }
        if(empty === true) {
            messageSelect.style.display = 'block';
        }
    })
} catch(error) {}

try {
    toggleButton.addEventListener('click', () => {
        sideBar.classList.toggle('show-sidebar');
        toggleButton.children[0].classList.toggle('d-none');
        toggleButton.children[1].classList.toggle('d-none');
    });
} catch (error) {
    // console.log(error);
}

try {
    thead.addEventListener('click', sortTable);
} catch (error) {
    // console.log(error);
}
try {
    fetchButton.addEventListener('click', getFetch);
} catch(error) {

}
$('.product-toast').toast('show');
$('#toast-success').toast('show');
$('#toast-error').toast('show');