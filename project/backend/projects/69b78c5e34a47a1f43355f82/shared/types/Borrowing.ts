```typescript
// File: shared/types/Borrowing.ts

/**
 * Defines the borrowing type and interface
 */

// Define the borrowing status enum
enum BorrowingStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  RETURNED = 'RETURNED',
}

// Define the borrowing type
type BorrowingType = {
  id: string;
  userId: string;
  bookId: string;
  borrowingDate: Date;
  returnDate: Date | null;
  status: BorrowingStatus;
};

// Define the borrowing interface
interface IBorrowing {
  id: string;
  userId: string;
  bookId: string;
  borrowingDate: Date;
  returnDate: Date | null;
  status: BorrowingStatus;

  // Method to update the borrowing status
  updateStatus(status: BorrowingStatus): void;

  // Method to return the book
  returnBook(returnDate: Date): void;
}

// Define the borrowing class
class Borrowing implements IBorrowing {
  id: string;
  userId: string;
  bookId: string;
  borrowingDate: Date;
  returnDate: Date | null;
  status: BorrowingStatus;

  constructor(id: string, userId: string, bookId: string, borrowingDate: Date) {
    this.id = id;
    this.userId = userId;
    this.bookId = bookId;
    this.borrowingDate = borrowingDate;
    this.returnDate = null;
    this.status = BorrowingStatus.PENDING;
  }

  // Method to update the borrowing status
  updateStatus(status: BorrowingStatus): void {
    this.status = status;
  }

  // Method to return the book
  returnBook(returnDate: Date): void {
    this.returnDate = returnDate;
    this.status = BorrowingStatus.RETURNED;
  }
}

// Example usage:
const borrowing = new Borrowing('1', 'user1', 'book1', new Date());
console.log(borrowing);

borrowing.updateStatus(BorrowingStatus.APPROVED);
console.log(borrowing);

borrowing.returnBook(new Date());
console.log(borrowing);
```

This code defines the borrowing type and interface, including the borrowing status enum, borrowing type, and borrowing interface. It also defines a borrowing class that implements the borrowing interface, with methods to update the borrowing status and return the book. The example usage demonstrates how to create a new borrowing instance, update its status, and return the book. 

The borrowing type and interface can be used in the frontend and backend of the application, with the frontend using HTML, CSS, and JS, and the backend using Core PHP and MongoDB as the database. 

In the frontend, the borrowing type and interface can be used to display the borrowing information and update the borrowing status. In the backend, the borrowing type and interface can be used to store and retrieve the borrowing information from the MongoDB database, and to update the borrowing status using Core PHP. 

For example, in the frontend, you can use the borrowing type and interface to display the borrowing information in a table, with columns for the borrowing ID, user ID, book ID, borrowing date, return date, and status. You can also use the borrowing interface to update the borrowing status when the user clicks a button to return the book. 

In the backend, you can use the borrowing type and interface to store the borrowing information in the MongoDB database, and to retrieve the borrowing information when the user requests it. You can also use the borrowing interface to update the borrowing status when the user returns the book, by calling the updateStatus method on the borrowing instance. 

Overall, the borrowing type and interface provide a standardized way to represent and manipulate borrowing information, and can be used in both the frontend and backend of the application to provide a seamless and consistent user experience. 

Here is an example of how to use the borrowing type and interface in the frontend:
```javascript
// Get the borrowing information from the backend
fetch('/api/borrowing')
  .then(response => response.json())
  .then(borrowing => {
    // Display the borrowing information in a table
    const table = document.getElementById('borrowing-table');
    const row = table.insertRow();
    row.insertCell().textContent = borrowing.id;
    row.insertCell().textContent = borrowing.userId;
    row.insertCell().textContent = borrowing.bookId;
    row.insertCell().textContent = borrowing.borrowingDate;
    row.insertCell().textContent = borrowing.returnDate;
    row.insertCell().textContent = borrowing.status;

    // Update the borrowing status when the user clicks a button to return the book
    const returnButton = document.getElementById('return-button');
    returnButton.addEventListener('click', () => {
      borrowing.updateStatus(BorrowingStatus.RETURNED);
      // Send the updated borrowing information to the backend
      fetch('/api/borrowing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(borrowing),
      });
    });
  });
```

And here is an example of how to use the borrowing type and interface in the backend:
```php
// Get the borrowing information from the database
$borrowing = Borrowing::findOne(['id' => '1']);

// Update the borrowing status when the user returns the book
if ($borrowing) {
  $borrowing->updateStatus(BorrowingStatus::RETURNED);
  // Save the updated borrowing information to the database
  $borrowing->save();
}

// Send the updated borrowing information to the frontend
header('Content-Type: application/json');
echo json_encode($borrowing);
```

Note that these examples are just illustrations, and you will need to modify them to fit your specific use case. Additionally, you will need to implement the necessary security measures to protect the borrowing information and prevent unauthorized access.