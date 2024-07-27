import { useEffect, useState } from "react";
import {
  getUserData,
  createPost,
} from "../UserAuthentication/FirestoreDB";
import postsData from "./UsersPosts.json";

const populatePosts = async () => {
  for (const user of postsData) {
    try {
      const { uid, posts } = user;
      const userData = await getUserData(uid);
      for (const post of posts) {
        const formData = {
          serviceTitle: post.serviceTitle,
          serviceCategories: post.serviceCategories,
          serviceLocations: post.serviceLocations,
          serviceAvailability: post.serviceAvailability,
          servicePrice: post.servicePrice,
          serviceDescription: post.serviceDescription,
        };
        const imageUpload =
          "https://firebasestorage.googleapis.com/v0/b/serviceit-9042a.appspot.com/o/Car%20Repair%2Fhow-often-change-oil.avif4f161974-e1fb-4ac3-b050-10a12829a41d?alt=media&token=29c464a7-8cda-443b-886a-e1cb3029d994";
        await createPost(formData, imageUpload, uid, userData);
      }
    } catch (error) {
      throw new Error(
        `Failed to create posts for user with UID ${user.uid}:`,
        error
      );
    }
  }
};



export default populatePosts;
