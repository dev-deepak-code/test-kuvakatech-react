"use client";

import type React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatInputForm } from "./ChatInputForm";
import { CustomToast } from "../CustomToast";
import { DeleteConfirmationModal } from "../Modal/DeleteConfirmationModal";
import { RenameModal } from "../Modal/RenameModal";
import { AppSidebar } from "../Sidebar/Sidebar";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  images?: string[];
  timestamp: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  isPinned?: boolean;
}

interface ChatInterfaceProps {
  user: any;
  onLogout: () => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
}

export function ChatInterface({
  user,
  onLogout,
  theme,
  setTheme,
}: ChatInterfaceProps) {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [displayedMessages, setDisplayedMessages] = useState<Message[]>([]);
  const [allMessagesInCurrentChat, setAllMessagesInCurrentChat] = useState<
    Message[]
  >([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [imagePreviews, setImagePreviews] = useState<
    { id: string; url: string; file: File }[]
  >([]);
  const messagesPerPage = 20;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  const [isFetchingOlderMessages, setIsFetchingOlderMessages] = useState(false);
  const [showMessagesSkeleton, setShowMessagesSkeleton] = useState(false);
  const [isCreatingNewChat, setIsCreatingNewChat] = useState(false);

  const [showCustomToast, setShowCustomToast] = useState(false);
  const [customToastMessage, setCustomToastMessage] = useState("");
  const [customToastType, setCustomToastType] = useState<"success" | "error">(
    "success"
  );

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [chatIdToDelete, setChatIdToDelete] = useState<string | null>(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameChatId, setRenameChatId] = useState<string | null>(null);
  const [renameChatTitle, setRenameChatTitle] = useState("");

  const messageToAnchorRef = useRef<string | null>(null);
  const prevChatIdRef = useRef<string | null>(null);
  const isInitialLoadRef = useRef(true);

  const showToast = useCallback(
    (message: string, type: "success" | "error") => {
      setCustomToastMessage(message);
      setCustomToastType(type);
      setShowCustomToast(true);
      setTimeout(() => setShowCustomToast(false), 3000);
    },
    []
  );

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: behavior });
    }, 50);
  }, []);

  const migrateOldLocalStorageFormat = useCallback(() => {
    try {
      console.log("Checking for old localStorage format...");
      const oldState = localStorage.getItem("state");
      if (oldState) {
        console.log("Found old state format, attempting migration...");
        const parsedState = JSON.parse(oldState);

        if (parsedState.chatrooms && Array.isArray(parsedState.chatrooms)) {
          console.log(
            "Found",
            parsedState.chatrooms.length,
            "chatrooms to migrate"
          );
          const migratedSessions: ChatSession[] = parsedState.chatrooms.map(
            (chatroom: any) => {
              const messages: Message[] = [];

              if (parsedState.messages && parsedState.messages[chatroom.id]) {
                messages.push(
                  ...parsedState.messages[chatroom.id].map((msg: any) => ({
                    id: msg.id,
                    role: msg.type === "user" ? "user" : "assistant",
                    content: msg.content,
                    timestamp: msg.timestamp,
                    images: msg.images || [],
                  }))
                );
              }

              return {
                id: chatroom.id,
                title: chatroom.title,
                messages: messages,
                isPinned: chatroom.isPinned || false,
              };
            }
          );

          console.log(
            "Migration completed, saving",
            migratedSessions.length,
            "sessions"
          );
          localStorage.setItem(
            "chat_sessions",
            JSON.stringify(migratedSessions)
          );

          if (parsedState.currentChatroom) {
            localStorage.setItem(
              "last_chat_id",
              parsedState.currentChatroom.id
            );
          }

          localStorage.removeItem("state");
          console.log("Old state format removed");

          return migratedSessions;
        } else {
          console.log("No chatrooms found in old state");
        }
      } else {
        console.log("No old state format found");
      }
    } catch (error) {
      console.error("Failed to migrate old localStorage format:", error);
    }
    return null;
  }, []);

  useEffect(() => {
    try {
      console.log("Loading chat sessions from localStorage...");

      const migratedSessions = migrateOldLocalStorageFormat();

      if (migratedSessions) {
        console.log(
          "Migration successful, loaded",
          migratedSessions.length,
          "sessions"
        );
        setChatSessions(migratedSessions);
        const lastChatId = localStorage.getItem("last_chat_id");
        if (
          lastChatId &&
          migratedSessions.some((session) => session.id === lastChatId)
        ) {
          setCurrentChatId(lastChatId);
        } else if (migratedSessions.length > 0) {
          setCurrentChatId(migratedSessions[0].id);
        } else {
          setCurrentChatId(null);
        }
        return;
      }

      const storedSessions = localStorage.getItem("chat_sessions");
      if (storedSessions) {
        console.log("Loading from new format...");
        const parsedSessions: ChatSession[] = JSON.parse(storedSessions);
        setChatSessions(parsedSessions);

        const lastChatId = localStorage.getItem("last_chat_id");
        if (
          lastChatId &&
          parsedSessions.some((session) => session.id === lastChatId)
        ) {
          setCurrentChatId(lastChatId);
        } else if (parsedSessions.length > 0) {
          setCurrentChatId(parsedSessions[0].id);
        } else {
          setCurrentChatId(null);
        }
      } else {
        console.log("No stored sessions found");
      }
    } catch (error) {
      console.error("Failed to load chat sessions from localStorage:", error);
    }
  }, [migrateOldLocalStorageFormat]);

  useEffect(() => {
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      return;
    }

    console.log(
      "Saving chat sessions to localStorage:",
      chatSessions.length,
      "sessions"
    );
    localStorage.setItem("chat_sessions", JSON.stringify(chatSessions));
  }, [chatSessions]);

  useEffect(() => {
    if (isInitialLoadRef.current) {
      return;
    }

    if (currentChatId) {
      console.log("Saving current chat ID to localStorage:", currentChatId);
      localStorage.setItem("last_chat_id", currentChatId);
    } else {
      localStorage.removeItem("last_chat_id");
    }
  }, [currentChatId]);

  useEffect(() => {
    const hasChatIdChanged = currentChatId !== prevChatIdRef.current;

    if (currentChatId === null) {
      setAllMessagesInCurrentChat([]);
      setDisplayedMessages([]);
      setCurrentPage(1);
      setShowMessagesSkeleton(false);
    } else {
      const currentSession = chatSessions.find(
        (session) => session.id === currentChatId
      );

      if (currentSession) {
        if (
          hasChatIdChanged &&
          currentSession.messages.length > 0 &&
          !isCreatingNewChat
        ) {
          setShowMessagesSkeleton(true);
        }

        setAllMessagesInCurrentChat(currentSession.messages);
        const totalMessages = currentSession.messages.length;
        const messagesToDisplayCount = Math.min(totalMessages, messagesPerPage);
        const startIndex = totalMessages - messagesToDisplayCount;
        setDisplayedMessages(currentSession.messages.slice(startIndex));
        setCurrentPage(1);

        if (
          hasChatIdChanged &&
          currentSession.messages.length > 0 &&
          !isCreatingNewChat
        ) {
          setTimeout(() => {
            setShowMessagesSkeleton(false);
            scrollToBottom("instant");
          }, 500);
        } else {
          setShowMessagesSkeleton(false);
          scrollToBottom("instant");
        }
      } else {
        setAllMessagesInCurrentChat([]);
        setDisplayedMessages([]);
        setCurrentPage(1);
        setShowMessagesSkeleton(false);
      }
    }

    prevChatIdRef.current = currentChatId;

    if (isCreatingNewChat) {
      setIsCreatingNewChat(false);
    }
  }, [
    currentChatId,
    chatSessions,
    messagesPerPage,
    scrollToBottom,
    isCreatingNewChat,
  ]);

  useEffect(() => {
    const totalMessages = allMessagesInCurrentChat.length;
    const startIndex = Math.max(
      0,
      totalMessages - currentPage * messagesPerPage
    );
    const newDisplayed = allMessagesInCurrentChat.slice(startIndex);

    const shouldAdjust =
      messageToAnchorRef.current !== null &&
      newDisplayed.length > displayedMessages.length;

    setDisplayedMessages(newDisplayed);

    if (shouldAdjust && chatContainerRef.current) {
      requestAnimationFrame(() => {
        const anchorElement = document.getElementById(
          messageToAnchorRef.current!
        );
        if (anchorElement) {
          anchorElement.scrollIntoView({ block: "start", behavior: "instant" });
        }
        messageToAnchorRef.current = null;
      });
    }
  }, [allMessagesInCurrentChat, currentPage, messagesPerPage]);

  useEffect(() => {
    if (!isLoading && textInputRef.current) {
      textInputRef.current.focus();
    }
  }, [isLoading, currentChatId]);

  const handleNewChat = () => {
    setCurrentChatId(null);
    setInput("");
    setIsLoading(false);
    setIsThinking(false);
    setImagePreviews([]);
    showToast("New chat started!", "success");
  };

  const handleSelectChat = (id: string) => {
    setCurrentChatId(id);
  };

  const handleDeleteChat = (id: string) => {
    setChatSessions((prev) => {
      const updatedSessions = prev.filter((chat) => chat.id !== id);
      if (currentChatId === id) {
        if (updatedSessions.length > 0) {
          setCurrentChatId(updatedSessions[0].id);
        } else {
          setCurrentChatId(null);
        }
      }
      return updatedSessions;
    });
    showToast("Chat deleted successfully!", "success");
  };

  const handleUpdateChat = (id: string, updates: Partial<ChatSession>) => {
    setChatSessions((prev) =>
      prev.map((session) => {
        if (session.id === id) {
          const updatedSession = { ...session, ...updates };
          if (updates.title) {
            showToast("Chat renamed successfully!", "success");
          }
          if (typeof updates.isPinned === "boolean") {
            showToast(
              updates.isPinned ? "Chat pinned to top." : "Chat unpinned.",
              "success"
            );
          }
          return updatedSession;
        }
        return session;
      })
    );
  };

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop } = chatContainerRef.current;
      if (
        scrollTop === 0 &&
        displayedMessages.length < allMessagesInCurrentChat.length &&
        !isFetchingOlderMessages
      ) {
        setIsFetchingOlderMessages(true);

        if (displayedMessages.length > 0) {
          messageToAnchorRef.current = displayedMessages[0].id;
        } else {
          for (let i = 0; i < chatContainerRef.current.children.length; i++) {
            const child = chatContainerRef.current.children[i] as HTMLElement;
            if (child.id) {
              messageToAnchorRef.current = child.id;
              break;
            }
          }
        }

        setTimeout(() => {
          setCurrentPage((prev) => prev + 1);
          setIsFetchingOlderMessages(false);
        }, 500);
      }
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newFiles = files.filter(
      (file) =>
        !imagePreviews.some(
          (preview) =>
            preview.file.name === file.name && preview.file.size === file.size
        )
    );

    if (imagePreviews.length + newFiles.length > 5) {
      showToast("You can upload a maximum of 5 images at a time.", "error");
      return;
    }

    const newPreviews = newFiles.map((file) => ({
      id: URL.createObjectURL(file),
      url: URL.createObjectURL(file),
      file,
    }));

    setImagePreviews((prev) => [...prev, ...newPreviews]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (id: string) => {
    setImagePreviews((prev) => prev.filter((preview) => preview.id !== id));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && imagePreviews.length === 0) || isLoading) return;

    setShowMessagesSkeleton(false);

    let activeChatId = currentChatId;
    let messagesToSend: Message[] = [];

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      images:
        imagePreviews.length > 0
          ? await Promise.all(
              imagePreviews.map((p) => {
                return new Promise<string>((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onloadend = () => resolve(reader.result as string);
                  reader.onerror = reject;
                  reader.readAsDataURL(p.file);
                });
              })
            )
          : undefined,
      timestamp: new Date().toLocaleString(),
    };

    if (activeChatId === null) {
      setIsCreatingNewChat(true);
      const newId = Date.now().toString();
      const newTitle =
        userMessage.content.substring(0, 25) +
          (userMessage.content.length > 25 ? "..." : "") || "Image Message";
      const newSession: ChatSession = {
        id: newId,
        title: newTitle,
        messages: [userMessage],
        isPinned: false,
      };
      setChatSessions((prev) => [...prev, newSession]);
      setCurrentChatId(newId);
      activeChatId = newId;
      messagesToSend = [userMessage];
    } else {
      const currentSession = chatSessions.find(
        (session) => session.id === activeChatId
      );
      if (currentSession) {
        messagesToSend = [...currentSession.messages, userMessage];
        setChatSessions((prevSessions) =>
          prevSessions.map((session) =>
            session.id === activeChatId
              ? { ...session, messages: [...session.messages, userMessage] }
              : session
          )
        );
      } else {
        console.warn("Active chat ID not found, creating new session.");
        const newId = Date.now().toString();
        const newTitle =
          userMessage.content.substring(0, 25) +
            (userMessage.content.length > 25 ? "..." : "") || "Image Message";
        const newSession: ChatSession = {
          id: newId,
          title: newTitle,
          messages: [userMessage],
          isPinned: false,
        };
        setChatSessions((prev) => [...prev, newSession]);
        setCurrentChatId(newId);
        activeChatId = newId;
        messagesToSend = [userMessage];
      }
    }

    setAllMessagesInCurrentChat((prev) => [...prev, userMessage]);
    setInput("");
    setImagePreviews([]);

    setIsLoading(true);
    setIsThinking(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsThinking(false);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: messagesToSend }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const assistantMessageId = (Date.now() + 1).toString();
      const newAssistantMessage: Message = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date().toLocaleString(),
      };

      setAllMessagesInCurrentChat((prev) => [...prev, newAssistantMessage]);
      setChatSessions((prevSessions) =>
        prevSessions.map((session) =>
          session.id === activeChatId
            ? {
                ...session,
                messages: [...session.messages, newAssistantMessage],
              }
            : session
        )
      );

      let receivedContent = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              setIsLoading(false);
              return;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                receivedContent += parsed.content;
                setAllMessagesInCurrentChat((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: msg.content + parsed.content }
                      : msg
                  )
                );
                setChatSessions((prevSessions) =>
                  prevSessions.map((session) =>
                    session.id === activeChatId
                      ? {
                          ...session,
                          messages: session.messages.map((msg) =>
                            msg.id === assistantMessageId
                              ? {
                                  ...msg,
                                  content: msg.content + parsed.content,
                                }
                              : msg
                          ),
                        }
                      : session
                  )
                );
              }
            } catch (e) {}
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date().toLocaleString(),
      };
      setAllMessagesInCurrentChat((prev) => [...prev, errorMessage]);
      setChatSessions((prevSessions) =>
        prevSessions.map((session) =>
          session.id === activeChatId
            ? { ...session, messages: [...session.messages, errorMessage] }
            : session
        )
      );
      showToast("An error occurred. Please try again.", "error");
    } finally {
      setIsLoading(false);
      setIsThinking(false);
      setCurrentPage(
        Math.ceil(allMessagesInCurrentChat.length / messagesPerPage) || 1
      );
      scrollToBottom();
    }
  };

  const handleCopy = (text: string, messageId: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedMessageId(messageId);
        showToast("Message has been copied.", "success");
        setTimeout(() => {
          setCopiedMessageId(null);
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        showToast("Could not copy message to clipboard.", "error");
      });
  };

  const handleDeleteClick = (id: string) => {
    setChatIdToDelete(id);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = () => {
    if (chatIdToDelete) {
      handleDeleteChat(chatIdToDelete);
    }
    setShowDeleteConfirmation(false);
    setChatIdToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
    setChatIdToDelete(null);
  };

  const handleRenameClick = (session: ChatSession) => {
    setRenameChatId(session.id);
    setRenameChatTitle(session.title);
    setShowRenameModal(true);
  };

  const saveRename = () => {
    if (renameChatId && renameChatTitle.trim()) {
      handleUpdateChat(renameChatId, { title: renameChatTitle.trim() });
    }
    setShowRenameModal(false);
    setRenameChatId(null);
    setRenameChatTitle("");
  };

  const cancelRename = () => {
    setShowRenameModal(false);
    setRenameChatId(null);
    setRenameChatTitle("");
  };

  return (
    <div
      className={`flex h-screen font-sans ${
        theme === "dark" ? "text-text-primary-dark" : "text-text-primary"
      }`}
    >
      <CustomToast
        show={showCustomToast}
        message={customToastMessage}
        type={customToastType}
      />

      <AppSidebar
        chatSessions={chatSessions}
        currentChatId={currentChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteClick}
        onLogout={onLogout}
        onUpdateChat={handleUpdateChat}
        onRenameChat={handleRenameClick}
        showToast={showToast}
        theme={theme}
        setTheme={setTheme}
      />

      <div
        className={`flex-1 flex flex-col ${
          theme === "dark" ? "bg-bg-dark" : "bg-bg-light"
        }`}
      >
        <ChatHeader user={user} theme={theme} />

        <ChatMessages
          displayedMessages={displayedMessages}
          isLoading={isLoading}
          isThinking={isThinking}
          theme={theme}
          user={user}
          handleCopy={handleCopy}
          copiedMessageId={copiedMessageId}
          messagesEndRef={messagesEndRef}
          chatContainerRef={chatContainerRef}
          handleScroll={handleScroll}
          showMessagesSkeleton={showMessagesSkeleton}
        />

        <ChatInputForm
          input={input}
          setInput={setInput}
          isLoading={isLoading}
          imagePreviews={imagePreviews}
          handleImageUpload={handleImageUpload}
          handleRemoveImage={handleRemoveImage}
          handleSubmit={handleSubmit}
          fileInputRef={fileInputRef}
          textInputRef={textInputRef}
          theme={theme}
        />
      </div>

      <DeleteConfirmationModal
        show={showDeleteConfirmation}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
        theme={theme}
      />

      <RenameModal
        show={showRenameModal}
        title={renameChatTitle}
        onTitleChange={setRenameChatTitle}
        onCancel={cancelRename}
        onSave={saveRename}
        theme={theme}
      />
    </div>
  );
}
