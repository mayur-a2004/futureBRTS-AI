const express = require('express');
const router = express.Router();
const libraryController = require('../controllers/libraryController');

router.get('/libraries', libraryController.getAllLibraries);
router.get('/libraries/:id', libraryController.getLibraryById);
router.post('/libraries', libraryController.createLibrary);
router.put('/libraries/:id', libraryController.updateLibrary);
router.delete('/libraries/:id', libraryController.deleteLibrary);

router.get('/libraries/:id/books', libraryController.getBooksByLibrary);
router.get('/libraries/:id/books/:bookId', libraryController.getBookByLibraryAndBookId);
router.post('/libraries/:id/books', libraryController.addBookToLibrary);
router.put('/libraries/:id/books/:bookId', libraryController.updateBookInLibrary);
router.delete('/libraries/:id/books/:bookId', libraryController.removeBookFromLibrary);

router.get('/libraries/:id/members', libraryController.getMembersByLibrary);
router.get('/libraries/:id/members/:memberId', libraryController.getMemberByLibraryAndMemberId);
router.post('/libraries/:id/members', libraryController.addMemberToLibrary);
router.put('/libraries/:id/members/:memberId', libraryController.updateMemberInLibrary);
router.delete('/libraries/:id/members/:memberId', libraryController.removeMemberFromLibrary);

router.get('/libraries/:id/borrowed-books', libraryController.getBorrowedBooksByLibrary);
router.get('/libraries/:id/borrowed-books/:bookId', libraryController.getBorrowedBookByLibraryAndBookId);
router.post('/libraries/:id/borrowed-books', libraryController.borrowBookFromLibrary);
router.put('/libraries/:id/borrowed-books/:bookId', libraryController.returnBorrowedBookToLibrary);
router.delete('/libraries/:id/borrowed-books/:bookId', libraryController.deleteBorrowedBookFromLibrary);

module.exports = router;