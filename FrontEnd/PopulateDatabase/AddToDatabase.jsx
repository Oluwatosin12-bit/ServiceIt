import users from './Users.json';
import { registerUser } from '../UserAuthentication/Auth';

const populateDatabase = async () => {
  for (const user of users) {
    try {
      const { name, email, username, selectedCategories, userLocation } = user;
      const password = 'Tosingee';
      await registerUser(email, password, username, name, selectedCategories, userLocation);
    } catch (error) {
      throw new Error(`Failed to register user ${user.username}:`, error.message);
    }
  }
};

export default populateDatabase;
