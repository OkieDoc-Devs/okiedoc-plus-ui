/**
 * Chat Service Module for Patient Module
 * Re-exports the shared chat service with patient-specific defaults
 */

// Re-export everything from the nurse chat service
export * from "../../Nurse/services/chatService.js";
export { default } from "../../Nurse/services/chatService.js";

// Re-export the useChat hook
export { useChat } from "../../Nurse/services/useChat.js";
