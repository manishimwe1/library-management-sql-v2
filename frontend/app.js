
const bookContainer = document.getElementById('book-container');
const navLink = document.getElementById('navLink');
const bookCard = document.getElementsByClassName('book-card')

const navLinks = [
    {
        label:'Home',
        active: true,
        link:'/'

    },
    {
        label:'Dashboard',
        active: false,
        link:'/frontend/dashboard/dashboard.html'

    },
    {
        label:'Books',
        active: false,
        link:'/frontend/books'

    },
    {
        label:'Add books',
        active: false,
        link:'/books'

    }
]

let clickedCard = null

const currentPath = window.location.pathname


async function displayBooks(){
    const response = await fetch('http://localhost:3000/api/books');
    const books = await response.json();
    books.map((book)=>{
        
        const bookElement = document.createElement('div');
        const bookCard = document.createElement('div');

        const bookImage = document.createElement('img');
        const bookName = document.createElement('h2');
        const bookAuthor = document.createElement('p');
        const bookDescription = document.createElement('p');
        const bookPrice = document.createElement('p');
        const bookSpan = document.createElement('span')
        
        bookImage.src = book.imageSrc;
        bookName.textContent = book.name;
        bookAuthor.textContent = `Author: ${book.author}`;
        bookDescription.textContent = book.description;
        bookPrice.textContent = `Price: `;
        bookSpan.textContent = `$${book.price.toFixed(2)}`;

        bookElement.className = 'book-element';
        bookName.className = 'book-title';
        bookAuthor.className = 'book-author';
        bookDescription.className = 'book-desc';
        bookPrice.className = 'book-price';
        bookImage.className = 'bookImage'
        bookCard.className = 'book-card';
        bookSpan.className = 'book-span-price'

        bookElement.appendChild(bookImage);
        bookCard.appendChild(bookName);
        bookCard.appendChild(bookAuthor);
        bookCard.appendChild(bookDescription);
        bookCard.appendChild(bookPrice);
        bookPrice.appendChild(bookSpan)


        bookElement.appendChild(bookCard);
        bookContainer.appendChild(bookElement);
        bookElement.addEventListener('click',(e)=>{
            viewBook(book.id)
            
        })

    })
}

function viewBook(bookId) {
    if(!bookId){
        return console.log('missing id');
        
    }
    window.location.href = `/frontend/view/?${bookId}`
}

function displayNavLinks(){
    navLinks.map((link,i)=>{
        const navLinkElement = document.createElement('li');
        const navLinkHref= document.createElement('a')

        navLinkHref.innerText = `${link.label}`
        navLinkHref.href = `${link.link}`
        navLinkElement.className = 'nav-link'
        navLinkElement.appendChild(navLinkHref)
        navLink.appendChild(navLinkElement)
    })
}

displayBooks()

displayNavLinks()
// bookCard.addEventListener('click',viewBook(book.id))