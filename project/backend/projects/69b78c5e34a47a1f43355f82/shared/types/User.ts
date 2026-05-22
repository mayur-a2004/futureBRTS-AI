```typescript
// shared/types/User.ts

/**
 * User Type and Interface Definition
 *
 * This file defines the User type and interface, which represents a user in the system.
 * It includes properties for user ID, name, email, password, and role.
 */

// Import required types and interfaces
import { ObjectId } from 'mongodb';

// Define the User interface
export interface User {
  /**
   * Unique identifier for the user
   */
  _id: ObjectId;

  /**
   * User's name
   */
  name: string;

  /**
   * User's email address
   */
  email: string;

  /**
   * User's password (hashed for security)
   */
  password: string;

  /**
   * User's role (e.g., admin, moderator, user)
   */
  role: string;

  /**
   * Timestamp for when the user account was created
   */
  createdAt: Date;

  /**
   * Timestamp for when the user account was last updated
   */
  updatedAt: Date;
}

// Define the User type
export type UserType = {
  /**
   * User's name
   */
  name: string;

  /**
   * User's email address
   */
  email: string;

  /**
   * User's password (hashed for security)
   */
  password: string;

  /**
   * User's role (e.g., admin, moderator, user)
   */
  role: string;
};

// Define the User registration interface
export interface UserRegistration {
  /**
   * User's name
   */
  name: string;

  /**
   * User's email address
   */
  email: string;

  /**
   * User's password (hashed for security)
   */
  password: string;

  /**
   * User's role (e.g., admin, moderator, user)
   */
  role: string;
}

// Define the User login interface
export interface UserLogin {
  /**
   * User's email address
   */
  email: string;

  /**
   * User's password (hashed for security)
   */
  password: string;
}

// Define the User update interface
export interface UserUpdate {
  /**
   * User's name
   */
  name?: string;

  /**
   * User's email address
   */
  email?: string;

  /**
   * User's password (hashed for security)
   */
  password?: string;

  /**
   * User's role (e.g., admin, moderator, user)
   */
  role?: string;
}
```

This code defines the User type and interface, including properties for user ID, name, email, password, and role. It also defines additional interfaces for user registration, login, and update. These interfaces can be used throughout the application to ensure consistency and type safety when working with user data.

Example use cases:

* Creating a new user: `const user: User = { _id: new ObjectId(), name: 'John Doe', email: 'john.doe@example.com', password: 'hashedPassword', role: 'user', createdAt: new Date(), updatedAt: new Date() };`
* Registering a new user: `const registration: UserRegistration = { name: 'Jane Doe', email: 'jane.doe@example.com', password: 'hashedPassword', role: 'user' };`
* Logging in a user: `const login: UserLogin = { email: 'john.doe@example.com', password: 'hashedPassword' };`
* Updating a user: `const update: UserUpdate = { name: 'John Doe Updated', email: 'john.doe.updated@example.com' };`

Note that this code assumes the use of MongoDB as the database, and the `ObjectId` type is imported from the `mongodb` package. The `Date` type is used for timestamps, and the `string` type is used for user data. The `UserType` type is a simplified version of the `User` interface, without the `_id`, `createdAt`, and `updatedAt` properties.