document.addEventListener('DOMContentLoaded', function() {
    const partForm = document.getElementById('partForm');
    const partList = document.getElementById('partList');
    const tagSearch = document.getElementById('tagSearch');
    const quantityFilter = document.getElementById('quantityFilter');
    const tagFilter = document.getElementById('tagFilter');
    const quantitySearchBtn = document.getElementById('quantitySearchBtn');
    const tagSearchBtn = document.getElementById('tagSearchBtn');
    const backupBtn = document.getElementById('backupBtn');

    function displayData(parts) {
        partList.innerHTML = '';
        parts.forEach((part, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${part.name}</td>
                <td>${part.quantity}</td>
                <td>${part.tags.join(', ')}</td>
                <td>
                    <button class="edit-btn">編集</button>
                    <button class="delete-btn">削除</button>
                </td>
            `;
            const editButton = row.querySelector('.edit-btn');
            const deleteButton = row.querySelector('.delete-btn');
            editButton.addEventListener('click', function() {
                const editQuantityInput = document.getElementById('editQuantity');
                const editTagsInput = document.getElementById('editTags');
                const saveEditBtn = document.getElementById('saveEditBtn');
                const cancelEditBtn = document.getElementById('cancelEditBtn');

                editQuantityInput.value = part.quantity;
                editTagsInput.value = part.tags.join(', ');

                document.getElementById('popupContainer').style.display = 'block';

                saveEditBtn.onclick = function() {
                    const newQuantity = parseInt(editQuantityInput.value);
                    const newTags = editTagsInput.value.split(',').map(tag => tag.trim());

                    if (!isNaN(newQuantity) && newQuantity >= 0) {
                        part.quantity = newQuantity;
                        part.tags = newTags;
                        saveDataToLocalStorage(parts);
                        displayData(parts);
                        document.getElementById('popupContainer').style.display = 'none';
                    } else {
                        alert('数量は正の整数で入力してください。');
                    }
                };

                cancelEditBtn.onclick = function() {
                    document.getElementById('popupContainer').style.display = 'none';
                };
            });

            deleteButton.addEventListener('click', function() {
                parts.splice(index, 1);
                saveDataToLocalStorage(parts);
                displayData(parts);
            });

            partList.appendChild(row);
        });
    }

    function getDataFromLocalStorage() {
        return JSON.parse(localStorage.getItem('parts')) || [];
    }

    function saveDataToLocalStorage(data) {
        localStorage.setItem('parts', JSON.stringify(data));
    }

    function backupData() {
        const parts = getDataFromLocalStorage();
        const jsonData = JSON.stringify(parts);
        const csvData = convertToCSV(parts);

        // Download JSON backup
        downloadData(jsonData, 'backup.json', 'application/json');

        // Download CSV backup
        downloadData(csvData, 'backup.csv', 'text/csv');
    }

    function downloadData(data, filename, type) {
        const blob = new Blob([data], { type: type });
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();

        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }

    function convertToCSV(data) {
        const header = Object.keys(data[0]).join(',');
        const body = data.map(obj => Object.values(obj).join(',')).join('\n');
        return `${header}\n${body}`;
    }

    function init() {
        const parts = getDataFromLocalStorage();
        displayData(parts);
    }

    init(); // ページの初期化時にデータを表示

    partForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const partName = document.getElementById('partName').value;
        const partQuantity = document.getElementById('partQuantity').value;
        const partTags = document.getElementById('partTags').value.split(',').map(tag => tag.trim());

        if (partName && partQuantity) {
            const parts = getDataFromLocalStorage();
            parts.push({ name: partName, quantity: parseInt(partQuantity), tags: partTags });
            saveDataToLocalStorage(parts);
            displayData(parts);
            partForm.reset();
        } else {
            alert('部品名と数量は必須です。');
        }
    });

    quantitySearchBtn.addEventListener('click', function() {
        quantityFilter.style.display = 'block';
        tagFilter.style.display = 'none';
    });

    tagSearchBtn.addEventListener('click', function() {
        tagFilter.style.display = 'block';
        quantityFilter.style.display = 'none';
    });

    tagSearch.addEventListener('input', function() {
        const searchValue = tagSearch.value.toLowerCase();
        const parts = getDataFromLocalStorage();
        const filteredParts = parts.filter(part => {
            return part.tags.some(tag => tag.toLowerCase().includes(searchValue));
        });
        displayData(filteredParts);
    });

    document.getElementById('minQuantity').addEventListener('input', filterByQuantity);
    document.getElementById('maxQuantity').addEventListener('input', filterByQuantity);

    backupBtn.addEventListener('click', backupData);

    function filterByQuantity() {
        const minQuantity = parseInt(document.getElementById('minQuantity').value);
        const maxQuantity = parseInt(document.getElementById('maxQuantity').value);
        const parts = getDataFromLocalStorage();
        const filteredParts = parts.filter(part => {
            if (isNaN(minQuantity) && isNaN(maxQuantity)) {
                return true;
            }
            if (isNaN(minQuantity)) {
                return part.quantity <= maxQuantity;
            }
            if (isNaN(maxQuantity)) {
                return part.quantity >= minQuantity;
            }
            return part.quantity >= minQuantity && part.quantity <= maxQuantity;
        });
        displayData(filteredParts);
    }

    document.getElementById('popupContainer').addEventListener('click', function(event) {
        if (event.target === this) {
            this.style.display = 'none';
        }
    });
});
