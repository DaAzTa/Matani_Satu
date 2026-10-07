#!/usr/bin/env node
// scripts/set-admin.mjs
// Menjadikan akun Firebase Auth sebagai admin (membuat dokumen admins/{uid}).
// Akun dibuat dulu di Firebase Console → Authentication → Users → Add user.
//
//   npm run set:admin -- admin@matanisatu.id
//   npm run set:admin -- admin@matanisatu.id --remove
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { initializeApp, cert, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const [email, flag] = process.argv.slice(2);
if (!email) {
  console.error("Pemakaian: npm run set:admin -- <email> [--remove]");
  process.exit(1);
}

const keyPath = resolve("serviceAccountKey.json");
initializeApp({
  credential: existsSync(keyPath) ? cert(JSON.parse(readFileSync(keyPath, "utf8"))) : applicationDefault(),
});

const user = await getAuth().getUserByEmail(email);
const ref = getFirestore().doc(`admins/${user.uid}`);

if (flag === "--remove") {
  await ref.delete();
  console.log(`✓ ${email} bukan admin lagi.`);
} else {
  await ref.set({ email, role: "admin", createdAt: FieldValue.serverTimestamp() });
  console.log(`✓ ${email} (uid ${user.uid}) sekarang admin.`);
}
