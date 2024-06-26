import {auth} from "./FirebaseConfig";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";

const registerUser = async(signUpEmail, signUpPassword) => {
    try{
        const user = await createUserWithEmailAndPassword(auth, signUpEmail, signUpPassword)
        console.log(user)
        return true
    } catch(error){
        console.error("Error logging in:", error)
        return false
    }
}

const loginUser = async(loginEmail, loginPassword) => {
    try{
        const user = await signInWithEmailAndPassword(auth, loginEmail, loginPassword)
        console.log(user)
        return true
    } catch(error){
        console.error("Error logging in:", error)
        return false
    }
}

const logOutUser = async() =>{
    await signOut(auth);
}

export {registerUser, loginUser, logOutUser, auth, onAuthStateChanged}
