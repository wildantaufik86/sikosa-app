export const ERROR_MSG = {
  // AUTH
  UNAUTHORIZED: "Unauthorized access",
  FORBIDDEN: "Access denied",

  // CONSULTATION
  CONSULTATION_NOT_FOUND: "Consultation not found",
  CONSULTATION_NOT_ACTIVE: "Consultation not active",

  // CHAT ROOM
  CHAT_ROOM_NOT_FOUND: "Chat room not found",
  CHAT_ROOM_INACTIVE: "Chat room is not active",
  NOT_PARTICIPANT: "User not part of chat room",

  // VALIDATION
  REQUIRED_CONSULTATION_ID: "Consultation ID required",
  INVALID_ID: "Invalid consultation ID",
  INVALID_USER: "Invalid user",
  USER_NOT_FOUND: "User not found",
  REGISTER_ROLE_FORBIDDEN: "Forbidden register role",

  MESSAGE_REQUIRED: "Message is required",
  EMPTY_MESSAGE: "Message is required", // alias untuk backward compatibility
  MESSAGE_TOO_LONG: "Message too long",
  INVALID_MESSAGE_CONTENT: "Invalid message content",

  // SYSTEM
  INTERNAL_SERVER_ERROR: "Internal server error",
  FAILED_SEND_MESSAGE: "Failed to send message",
  FAILED_FETCH_MESSAGES: "Failed to fetch messages",

  // JWT TOKEN
  INVALID_TOKEN: "Invalid Token",
  TOKEN_EXPIRED: "Token Expired",

  // article
  ARTICLE_NOT_FOUND: "Article not found",
};
