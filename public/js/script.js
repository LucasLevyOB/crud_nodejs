const toggleButton = document.getElementById('toggle-sidebar');
const sideBar = document.getElementById('sidebar');
const datatable = document.getElementById('datatable');
const tbody = document.getElementById('datatable-tbody');
const thead = document.getElementById('datatable-thead');
const mainBody = document.getElementById('main-body');
const messageSelect = document.getElementById('message-pagination');

var offset = 10;
const quantityProducts = 5;
var empty = false

const fetchButton = document.getElementById('fetch');

function getProducts(offset, quantityProducts) {
    if(self.fetch) {
        fetch(`http://localhost:3000/products/select/${offset}/${quantityProducts}`)
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
    linkDelete.setAttribute('href', `/delete/${object.pro_id}`);
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


mainBody.addEventListener('scroll', element => {
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

$('#toast-add').toast('show');