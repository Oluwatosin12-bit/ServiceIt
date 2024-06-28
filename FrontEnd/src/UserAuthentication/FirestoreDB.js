import {database} from './FirebaseConfig';
import {collection, addDoc} from 'firebase/firestore';

async function addUser(userCredential, firstName, lastName, userName, signUpEmail){
    const uid = userCredential.user.uid;
    await addDoc(collection(database, "users"), {
        uid: uid,
        FirstName: firstName,
        LastName: lastName,
        UserName: userName,
        Email: signUpEmail,
    });
}

export {addUser}
