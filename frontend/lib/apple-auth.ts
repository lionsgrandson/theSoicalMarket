// // lib/apple-auth.ts
// import jwt from 'jsonwebtoken';

// export function getAppleClientSecret() {
//   const teamId = process.env.APPLE_TEAM_ID!;
//   const clientId = process.env.APPLE_CLIENT_ID!;
//   const keyId = process.env.APPLE_KEY_ID!;
//   const privateKey = process.env.APPLE_PRIVATE_KEY!.replace(/\\n/g, '\n');
  
//   const now = Math.floor(Date.now() / 1000);
  
//   // Generate token valid for 6 months
//   return jwt.sign(
//     {
//       iss: teamId,
//       iat: now,
//       exp: now + 15777000,
//       aud: 'https://appleid.apple.com',
//       sub: clientId,
//     },
//     privateKey,
//     {
//       algorithm: 'ES256',
//       header: { alg: 'ES256', kid: keyId },
//     }
//   );
// }

// // Cache the token for 1 day to avoid generating on every request
// let cachedToken: { token: string; expiresAt: number } | null = null;

// export function getCachedAppleClientSecret() {
//   const now = Math.floor(Date.now() / 1000);
  
//   // Return cached token if still valid for at least 7 days
//   if (cachedToken && cachedToken.expiresAt > now + 604800) {
//     return cachedToken.token;
//   }
  
//   // Generate new token
//   const token = getAppleClientSecret();
//   const decoded = jwt.decode(token) as { exp: number };
  
//   cachedToken = {
//     token,
//     expiresAt: decoded.exp,
//   };
  
//   console.log(`🔄 Generated new Apple client secret, expires: ${new Date(decoded.exp * 1000).toISOString()}`);
  
//   return token;
// }