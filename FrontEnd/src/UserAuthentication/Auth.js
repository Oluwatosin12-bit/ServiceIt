import {auth} from "./FirebaseConfig";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";

const registerUser = async(email, password) => {
    try{
        const user = await createUserWithEmailAndPassword(auth, email, password);
        return user;
    } catch(error){
        console.error("Error logging in:", error);
    };
};

const loginUser = async(email, password) => {
    try{
        const user = await signInWithEmailAndPassword(auth, email, password);
        return user;
    } catch(error){
        console.error("Error logging in:", error);
    };
};

const logOutUser = async() =>{
    await signOut(auth);
};

export {registerUser, loginUser, logOutUser, auth, onAuthStateChanged};
