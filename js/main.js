// {
//     id: string | number,
//     title: string,
//     author: string,
//     year: number,
//     isComplete: boolean,
// }
const bookshelf = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';

function validateNumberInput(input) {
    const maxLength = 4;
    if (input.value.length > maxLength) {
        input.value = input.value.slice(0, maxLength);
        document.getElementById('error_message').textContent = `Panjang maksimal ${maxLength} karakter !`;
    } else {
        document.getElementById('error_message').textContent = '';
    }
}


document.addEventListener('DOMContentLoaded', function() {

    const submitForm /* HTMLFormElement */ = document.getElementById('inputBook');

    submitForm.addEventListener('submit', function(event) {
        event.preventDefault();
        addBook();
    });

    // if (isStorageExist()) {
    //     loadDataFromStorage();
    // }
});

function addBook() {
    console.log(document.getElementById('inputBookIsComplete').checked)
    const generatedID = generateId();
    const inputBookTitle = document.getElementById('inputBookTitle').value;
    const inputBookAuthor = document.getElementById('inputBookAuthor').value;
    const inputBookYear = document.getElementById('inputBookYear').value;
    let isComplete = document.getElementById('inputBookIsComplete').checked;
    let bookObject = generateBookObject(generatedID, inputBookTitle, inputBookAuthor, inputBookYear, isComplete);
    bookshelf.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();

    document.getElementById('inputBookTitle').value = '';
    document.getElementById('inputBookAuthor').value = '';
    document.getElementById('inputBookYear').value = '';
}

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted) {
    return {
        id,
        title,
        author,
        year,
        isCompleted
    }
}

function saveData() {
    if (isStorageExist()) {
        const parsed /* string */ = JSON.stringify(bookshelf);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function isStorageExist() /* boolean */ {
    if (typeof(Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

document.addEventListener(RENDER_EVENT, function() {
    const unreadBook = document.getElementById('incompleteBookshelfList');
    const readedBook = document.getElementById('completeBookshelfList');

    // clearing list item
    unreadBook.innerHTML = '';
    readedBook.innerHTML = '';

    for (const bookItem of bookshelf) {
        const bookElement = makeBook(bookItem);

        if (bookItem.isCompleted) {
            readedBook.append(bookElement);
        } else {
            unreadBook.append(bookElement);
        }
    }
})

function findBookIndex(id) {
    for (const index in bookshelf) {
        if (bookshelf[index].id === id) {
            return index;
        }
    }
    return -1;
}

function statusRead(id, status) {
    const bookTarget = findBookIndex(id);

    if (bookTarget === -1) return;
    bookshelf[bookTarget].isCompleted = status;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function removeBook(id) {
    const bookTarget = findBookIndex(id);

    if (bookTarget === -1) return;

    bookshelf.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function makeBook(bookObject) {
    const { id, title, author, year, isCompleted } = bookObject;

    const titleEl = document.createElement('h3');
    titleEl.innerText = title;

    const authorEl = document.createElement('p');
    authorEl.innerText = `Penulis : ${author}`;

    const yearEl = document.createElement('p');
    yearEl.innerText = `Tahun : ${year}`;

    const bookDetail = document.createElement('div')
    bookDetail.classList.add('book_detail');
    bookDetail.append(titleEl, authorEl, yearEl);

    let classFirstActEl = 'gg-check-o';
    let classSecondActEl = 'gg-close-o';
    if (isCompleted) {
        classFirstActEl = 'gg-undo';
        classSecondActEl = 'gg-close-o';
    }
    const firstActEl = document.createElement('i');
    firstActEl.classList.add(classFirstActEl);
    const secondActEl = document.createElement('i');
    secondActEl.classList.add(classSecondActEl);

    firstActEl.addEventListener('click', function() {
        let status = isCompleted ? false : true;
        statusRead(id, status);
    });
    secondActEl.addEventListener('click', function() {
        removeBook(id);
        // pop up konfirmasi
    });
    const act = document.createElement('div');
    act.classList.add('action');
    act.append(firstActEl, secondActEl);

    const container = document.createElement('div');
    container.classList.add('book_item');
    container.append(bookDetail, act);

    return container;
}