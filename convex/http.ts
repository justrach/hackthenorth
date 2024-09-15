import { httpRouter } from "convex/server";
import { getEmail, getList, getEmailUserList, getAllMessagesAction } from "./userFunctions";

const http = httpRouter();

// Route for email
http.route({
  path: "/email",
  method: "GET",
  handler: getEmail,
});

// Route for list
http.route({
  path: "/list",
  method: "GET",
  handler: getList,
});

// Route for emailuserlist
http.route({
  path: "/emailuserlist",
  method: "GET",
  handler: getEmailUserList,
});

// New route for getting all messages
http.route({
  path: "/messages",
  method: "GET",
  handler: getAllMessagesAction,
});

// Convex expects the router to be the default export of `convex/http.js`.
export default http;