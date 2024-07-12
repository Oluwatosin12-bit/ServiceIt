import { getMessaging, getToken, onMessage } from "firebase/messaging";

const messaging = getMessaging(userID);

getToken(messaging, { vapidKey: 'BIk2IwWnyh6QKW0Y6c4ZCNLuNltnCcaGT4hxKNdJl6wgpvQhYfDIkZZ34iU14Ox5zSflGAPL5dmDRbv7GENQrqA'})
  .then((currentToken) => {
    if (currentToken) {
      // Save the token to Firestore for the logged-in user
      const userDocRef = doc(database, 'users', userID);

      setDoc(userDocRef, { fcmToken: currentToken }, { merge: true });
    } else {
      // No token available, request permission to generate one
      requestPermission();
    }
  }).catch((err) => {
    console.log('An error occurred while retrieving token. ', err);
  });

onMessage(messaging, (payload) => {
  console.log('Message received. ', payload);
});
