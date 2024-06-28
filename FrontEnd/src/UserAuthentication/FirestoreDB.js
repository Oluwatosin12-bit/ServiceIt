import {database} from './FirebaseConfig';
import {collection, addDoc, doc, setDoc} from 'firebase/firestore';

async function addUser(userCredential, firstName, lastName, userName, signUpEmail){
    const uid = userCredential.user.uid;
    const userDocRef = doc(database, "users", uid);
    await setDoc(userDocRef, {
        uid: uid,
        FirstName: firstName,
        LastName: lastName,
        UserName: userName,
        Email: signUpEmail,
    });
}

export {addUser}
