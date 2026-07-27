// Auth middleware temporarily disabled — will be re-enabled once auth is implemented.
// import { withAuth } from "next-auth/middleware";
//
// export default withAuth({
//   pages: {
//     signIn: "/login",
//   },
// });
//
// export const config = {
//   matcher: ["/dashboard/:path*"],
// };

export const config = {
  matcher: [],
};