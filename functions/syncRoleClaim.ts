import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { onDocumentUpdated } from 'firebase-functions/v2/firestore';

initializeApp();

export const syncRoleClaim = onDocumentUpdated('users/{userId}', async (event) => {
  const newRole = event.data?.after?.data()?.role;
  const uid = event.params.userId;
  if (newRole) {
    await getAuth().setCustomUserClaims(uid, { role: newRole });
  }
});
