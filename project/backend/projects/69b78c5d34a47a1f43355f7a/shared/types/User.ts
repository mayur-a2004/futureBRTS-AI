```typescript
// File: shared/types/User.ts

/**
 * Represents a user in the system.
 */
export interface User {
  /**
   * Unique identifier for the user.
   */
  id: string;

  /**
   * The user's username.
   */
  username: string;

  /**
   * The user's email address.
   */
  email: string;

  /**
   * The user's password (hashed for security).
   */
  password: string;

  /**
   * The user's first name.
   */
  firstName: string;

  /**
   * The user's last name.
   */
  lastName: string;

  /**
   * The user's role in the system (e.g. admin, moderator, user).
   */
  role: string;

  /**
   * The date the user account was created.
   */
  createdAt: Date;

  /**
   * The date the user account was last updated.
   */
  updatedAt: Date;

  /**
   * The user's profile picture URL.
   */
  profilePicture?: string;

  /**
   * The user's bio or description.
   */
  bio?: string;

  /**
   * The user's social media links.
   */
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
}

/**
 * Represents a user's login credentials.
 */
export interface UserCredentials {
  /**
   * The user's username or email address.
   */
  usernameOrEmail: string;

  /**
   * The user's password.
   */
  password: string;
}

/**
 * Represents a user's registration information.
 */
export interface UserRegistration {
  /**
   * The user's username.
   */
  username: string;

  /**
   * The user's email address.
   */
  email: string;

  /**
   * The user's password.
   */
  password: string;

  /**
   * The user's first name.
   */
  firstName: string;

  /**
   * The user's last name.
   */
  lastName: string;
}

/**
 * Represents a user's update information.
 */
export interface UserUpdate {
  /**
   * The user's new username.
   */
  username?: string;

  /**
   * The user's new email address.
   */
  email?: string;

  /**
   * The user's new password.
   */
  password?: string;

  /**
   * The user's new first name.
   */
  firstName?: string;

  /**
   * The user's new last name.
   */
  lastName?: string;

  /**
   * The user's new profile picture URL.
   */
  profilePicture?: string;

  /**
   * The user's new bio or description.
   */
  bio?: string;

  /**
   * The user's new social media links.
   */
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
}
```

This code defines the `User` interface, which represents a user in the system. It includes properties for the user's ID, username, email address, password, first name, last name, role, creation date, update date, profile picture, bio, and social media links.

It also defines three additional interfaces: `UserCredentials`, `UserRegistration`, and `UserUpdate`. These interfaces represent the data required for user login, registration, and update operations, respectively.

The `UserCredentials` interface includes properties for the user's username or email address and password.

The `UserRegistration` interface includes properties for the user's username, email address, password, first name, and last name.

The `UserUpdate` interface includes properties for the user's new username, email address, password, first name, last name, profile picture, bio, and social media links. These properties are all optional, allowing for partial updates to the user's information.

Example usage:
```typescript
const user: User = {
  id: '12345',
  username: 'johnDoe',
  email: 'johndoe@example.com',
  password: 'hashedPassword',
  firstName: 'John',
  lastName: 'Doe',
  role: 'user',
  createdAt: new Date(),
  updatedAt: new Date(),
  profilePicture: 'https://example.com/johndoe.jpg',
  bio: 'This is my bio',
  socialMedia: {
    facebook: 'https://facebook.com/johndoe',
    twitter: 'https://twitter.com/johndoe',
    instagram: 'https://instagram.com/johndoe',
  },
};

const credentials: UserCredentials = {
  usernameOrEmail: 'johndoe@example.com',
  password: 'mysecretpassword',
};

const registration: UserRegistration = {
  username: 'janeDoe',
  email: 'janedoe@example.com',
  password: 'mysecretpassword',
  firstName: 'Jane',
  lastName: 'Doe',
};

const update: UserUpdate = {
  username: 'janeDoeUpdated',
  email: 'janedoeupdated@example.com',
  profilePicture: 'https://example.com/janedoeupdated.jpg',
  bio: 'This is my updated bio',
};
```