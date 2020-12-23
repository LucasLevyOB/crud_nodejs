const toggleButton = document.getElementById('toggle-sidebar');
const sideBar = document.getElementById('sidebar');
const datatable = document.getElementById('datatable');
const tbody = document.getElementById('datatable-tbody');
const thead = document.getElementById('datatable-thead');

function sortTable(elem) {
    const thValue = elem.target.getAttribute('value');
    const order = elem.target.getAttribute('order');
    const tableLenght = datatable.rows.length;
    for(let i = 0; i < tableLenght; i++) {
        for(let j = 2; j < tableLenght; j++) {
            const previus = datatable.rows[j - 1].cells[thValue].innerText;
            const current = datatable.rows[j].cells[thValue].innerText;
            const previusTreaty = !isNaN(previus) ? parseFloat(previus) : previus;
            const currentTreaty = !isNaN(current) ? parseFloat(current) : current;
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
        elem.target.children[0].setAttribute('src', 'img/down-arrow.png');
    } else {
        elem.target.setAttribute('order', 'asc');
        elem.target.children[0].setAttribute('src', 'img/up-arrow.png');
    }
}

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