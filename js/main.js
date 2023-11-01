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

    const submitForm = document.getElementById('inputBook');

    submitForm.addEventListener('submit', function(event) {
        event.preventDefault();
        addBook();
    });
});

function addBook() {
    const generatedID = generateId();
    const inputBookTitle = document.getElementById('inputBookTitle').value;
    const inputBookAuthor = document.getElementById('inputBookAuthor').value;
    const inputBookYear = document.getElementById('inputBookYear').value;
    const inputBookYearToNumber = parseInt(inputBookYear);
    let isComplete = document.getElementById('inputBookIsComplete').checked;
    const bookID = document.getElementById('book_id').value;
    if (bookID != '') {
        let index = findBookIndex(bookID);
        bookshelf[index].title = inputBookTitle;
        bookshelf[index].author = inputBookAuthor;
        bookshelf[index].year = inputBookYearToNumber;
        bookshelf[index].isCompleted = isComplete;
    } else {
        let bookObject = generateBookObject(generatedID, inputBookTitle, inputBookAuthor, inputBookYearToNumber, isComplete);
        bookshelf.push(bookObject);
        alert('Buku berhasil ditambah.');
    }
    saveData();
    document.dispatchEvent(new Event(RENDER_EVENT));
    emptyInputs(['inputBookTitle', 'inputBookAuthor', 'inputBookYear', 'book_id']);
}

function emptyInputs(inputs) {
    inputs.forEach(element => {
        document.getElementById(element).value = '';

    });
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
        const parsed = JSON.stringify(bookshelf);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function isStorageExist() {
    if (typeof(Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

document.addEventListener(RENDER_EVENT, function(e) {
    const unreadBook = document.getElementById('incompleteBookshelfList');
    const readBook = document.getElementById('completeBookshelfList');

    unreadBook.innerHTML = '';
    readBook.innerHTML = '';
    const bookItems = e.detail == undefined ? bookshelf : e.detail;

    for (const bookItem of bookItems) {
        const bookElement = makeBook(bookItem);

        if (bookItem.isCompleted) {
            readBook.append(bookElement);
        } else {
            unreadBook.append(bookElement);
        }
    }
})

function findBookIndex(id) {
    for (const index in bookshelf) {
        if (bookshelf[index].id == id) {
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

function editBook(id) {
    const index = findBookIndex(id);
    const book = bookshelf[index];
    const inputTitle = document.getElementById('inputBookTitle');
    const inputAuthor = document.getElementById('inputBookAuthor');
    const inputYear = document.getElementById('inputBookYear');
    const checkbox = document.getElementById('inputBookIsComplete');
    const inputBookid = document.getElementById('book_id');

    inputTitle.value = book.title;
    inputAuthor.value = book.author;
    inputYear.value = book.year;
    checkbox.checked = book.isCompleted;
    inputBookid.value = book.id;
}

function removeBook(id) {
    const bookTarget = findBookIndex(id);

    if (bookTarget === -1) return;

    bookshelf.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
    emptyInputs(['inputBookTitle', 'inputBookAuthor', 'inputBookYear', 'book_id']);
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

    let classFirstActEl = 'finished';
    let classSecondActEl = 'edit';
    let classThirdActEl = 'remove';
    if (isCompleted) {
        classFirstActEl = 'unfinished';
        classSecondActEl = 'edit';
        classThirdActEl = 'remove';
    }

    const firstActEl = document.createElement('button');
    firstActEl.classList.add(classFirstActEl);
    firstActEl.innerText = classFirstActEl;
    const secondActEl = document.createElement('button');
    secondActEl.classList.add(classSecondActEl);
    secondActEl.innerText = classSecondActEl;
    const thirdActEl = document.createElement('button');
    thirdActEl.classList.add(classThirdActEl);
    thirdActEl.innerText = classThirdActEl;

    firstActEl.addEventListener('click', function() {
        let status = isCompleted ? false : true;
        statusRead(id, status);
    });

    secondActEl.addEventListener('click', function() {
        editBook(id);
    })

    thirdActEl.addEventListener('click', function() {

        const confirmation = window.confirm('Apakah Anda yakin ingin menghapus buku ini?');

        if (confirmation) {
            alert('Buku berhasil dihapus.');
            removeBook(id);
        } else {
            alert('Buku batal dihapus.');
        }
    });

    const act = document.createElement('div');
    act.classList.add('action');
    act.append(firstActEl, secondActEl, thirdActEl);

    const container = document.createElement('div');
    container.classList.add('book_item');
    container.append(bookDetail, act);
    return container;
}

function findBookTitle(title) {
    let books = [];
    for (const index in bookshelf) {
        if (bookshelf[index].title.includes(title)) {
            books.push(bookshelf[index]);
        }
    }
    return books;
}

const searchBook = document.getElementById('searchBook');
searchBook.addEventListener('click', function(e) {
    e.preventDefault();
    let searchInput = document.getElementById('searchBookTitle').value;
    let books = findBookTitle(searchInput);

    document.dispatchEvent(new CustomEvent(RENDER_EVENT, { detail: books }));
})