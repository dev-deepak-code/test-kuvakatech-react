"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  PanelLeft,
  Plus,
  LogOut,
  MoreVertical,
  Pin,
  Sun,
  Moon,
  Search,
} from "lucide-react";

interface ChatSession {
  id: string;
  title: string;
  messages: any[];
  isPinned?: boolean;
}

interface AppSidebarProps {
  chatSessions: ChatSession[];
  currentChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onLogout: () => void;
  onUpdateChat: (id: string, updates: Partial<ChatSession>) => void;
  onRenameChat: (session: ChatSession) => void;
  showToast: (message: string, type: "success" | "error") => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function AppSidebar({
  chatSessions,
  currentChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onLogout,
  onUpdateChat,
  onRenameChat,
  showToast,
  theme,
  setTheme,
}: AppSidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const [showDropdownForChatId, setShowDropdownForChatId] = useState<
    string | null
  >(null);
  const [highlightedDropdownItemIndex, setHighlightedDropdownItemIndex] =
    useState<number | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const moreVerticalButtonRefs = useRef<Map<string, HTMLButtonElement>>(
    new Map()
  );
  const dropdownItemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
        setIsMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdownForChatId(null);
        setHighlightedDropdownItemIndex(null);
      }
    };

    if (showDropdownForChatId) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdownForChatId]);

  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setIsMobileOpen((prev) => !prev);
    } else {
      setIsOpen((prev) => !prev);
      setIsHovered(false);
    }
  }, [isMobile]);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [theme, setTheme]);

  const effectiveOpen = isOpen || isHovered || isMobileOpen;

  const filteredAndSortedChatSessions = useMemo(() => {
    const filtered = chatSessions.filter((session) =>
      session.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
    return [...filtered].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return Number.parseInt(b.id) - Number.parseInt(a.id);
    });
  }, [chatSessions, debouncedSearchTerm]);

  const handleDeleteClick = (id: string) => {
    onDeleteChat(id);
    setShowDropdownForChatId(null);
  };

  const handleRenameClick = (session: ChatSession) => {
    onRenameChat(session);
    setShowDropdownForChatId(null);
  };

  const handlePinToggle = (session: ChatSession) => {
    onUpdateChat(session.id, { isPinned: !session.isPinned });
    setShowDropdownForChatId(null);
  };

  return (
    <>
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className={`fixed top-4 left-4 z-40 p-2 rounded-md md:hidden ${
            theme === "dark"
              ? "bg-brand-secondary-dark text-text-primary-dark"
              : "bg-brand-secondary text-text-secondary"
          }`}
          aria-label="Toggle sidebar"
        >
          <PanelLeft className="h-6 w-6" />
        </button>
      )}

      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      <div
        className={`flex flex-col border-r transition-all duration-300 ease-in-out
          ${isMobile ? "fixed inset-y-0 left-0 z-40 w-64" : "relative h-screen"}
          ${
            isMobileOpen ? "translate-x-0" : isMobile ? "-translate-x-full" : ""
          }
          ${
            !isMobile && isOpen
              ? "w-64"
              : !isMobile && !isOpen && effectiveOpen
              ? "w-64"
              : !isMobile && !isOpen && !effectiveOpen
              ? "w-16"
              : ""
          }
          md:translate-x-0
          ${
            theme === "dark"
              ? "bg-card-dark border-border-dark text-text-primary-dark"
              : "bg-bg-light border-border-light text-text-primary"
          }`}
        onMouseEnter={() => !isMobile && !isOpen && setIsHovered(true)}
        onMouseLeave={() => !isMobile && !isOpen && setIsHovered(false)}
      >
        <div
          className={`p-4 border-b flex items-center justify-center ${
            theme === "dark" ? "border-border-dark" : "border-border-light"
          }`}
        >
          {!isMobile && (
            <button
              onClick={toggleSidebar}
              className={`p-2 rounded-full ${
                theme === "dark"
                  ? "hover:bg-brand-secondary-dark text-text-primary-dark"
                  : "hover:bg-brand-secondary text-text-secondary"
              }`}
              aria-label="Toggle sidebar"
            >
              <PanelLeft className="h-5 w-5" />
            </button>
          )}
          {effectiveOpen && (
            <h2
              className={`text-lg font-semibold flex-1 ml-2 ${
                theme === "dark"
                  ? "text-text-primary-dark"
                  : "text-text-primary"
              }`}
            >
              Chats
            </h2>
          )}
        </div>

        {effectiveOpen && (
          <div className="p-4 relative">
            <input
              type="text"
              placeholder="Search chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-8 w-full py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors text-base ${
                theme === "dark"
                  ? "bg-brand-secondary-dark border-border-dark text-text-primary-dark"
                  : "bg-card-light border-border-light text-text-primary"
              }`}
            />
            <Search
              className={`absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 ${
                theme === "dark"
                  ? "text-text-secondary-dark"
                  : "text-text-secondary"
              }`}
            />
          </div>
        )}

        <div className="p-2 flex items-center justify-center">
          <button
            onClick={() => {
              onNewChat();
              if (isMobile) setIsMobileOpen(false);
            }}
            className={`inline-flex items-center justify-center rounded-full text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 bg-brand-primary text-primary-foreground hover:bg-brand-primary-dark h-10
              ${effectiveOpen ? "w-full px-4 py-2" : "w-10 p-0"}`}
          >
            <Plus className={`h-5 w-5 ${effectiveOpen ? "mr-2" : ""}`} />
            {effectiveOpen && "New Chat"}
          </button>
        </div>

        <div
          className={`flex-1 px-4 space-y-2 ${
            effectiveOpen ? "overflow-y-auto" : "overflow-hidden"
          }`}
        >
          {effectiveOpen &&
            filteredAndSortedChatSessions.map((session) => (
              <div
                key={session.id}
                className={`flex items-center justify-between p-2 rounded-full cursor-pointer group
                ${
                  currentChatId === session.id
                    ? theme === "dark"
                      ? "bg-brand-secondary-dark text-text-primary-dark"
                      : "bg-brand-secondary text-brand-primary"
                    : theme === "dark"
                    ? "hover:bg-brand-secondary-dark"
                    : "hover:bg-brand-secondary"
                }
                ${!effectiveOpen ? "justify-center w-10 h-10" : ""}`}
              >
                <button
                  onClick={() => {
                    onSelectChat(session.id);
                    if (isMobile) setIsMobileOpen(false);
                  }}
                  className={`flex-1 text-left truncate text-base ${
                    !effectiveOpen ? "sr-only" : ""
                  } ${
                    theme === "dark"
                      ? "text-text-primary-dark"
                      : "text-text-primary"
                  }`}
                  title={session.title}
                >
                  {effectiveOpen && (
                    <span className="flex items-center">
                      {session.isPinned && (
                        <Pin
                          className={`h-4 w-4 mr-1.5 ${
                            theme === "dark"
                              ? "text-text-secondary-dark"
                              : "text-text-secondary"
                          }`}
                        />
                      )}
                      {session.title}
                    </span>
                  )}
                </button>

                {effectiveOpen && (
                  <div
                    className="relative"
                    ref={
                      showDropdownForChatId === session.id ? dropdownRef : null
                    }
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const newShowDropdownId =
                          showDropdownForChatId === session.id
                            ? null
                            : session.id;
                        setShowDropdownForChatId(newShowDropdownId);
                        if (newShowDropdownId === session.id) {
                          setHighlightedDropdownItemIndex(0);
                          setTimeout(() => {
                            const firstItem = dropdownItemRefs.current.get(
                              `${session.id}-0`
                            );
                            firstItem?.focus();
                          }, 0);
                        } else {
                          setHighlightedDropdownItemIndex(null);
                          moreVerticalButtonRefs.current
                            .get(session.id)
                            ?.focus();
                        }
                      }}
                      ref={(el) => {
                        if (el)
                          moreVerticalButtonRefs.current.set(session.id, el);
                        else moreVerticalButtonRefs.current.delete(session.id);
                      }}
                      className={`ml-2 p-1 rounded-full hover:bg-brand-secondary ${
                        theme === "dark"
                          ? "text-text-secondary-dark hover:bg-brand-secondary-dark"
                          : "text-text-secondary hover:text-text-primary"
                      }`}
                      aria-label={`Chat actions for ${session.title}`}
                      aria-haspopup="menu"
                      aria-expanded={showDropdownForChatId === session.id}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          const newShowDropdownId =
                            showDropdownForChatId === session.id
                              ? null
                              : session.id;
                          setShowDropdownForChatId(newShowDropdownId);
                          if (newShowDropdownId === session.id) {
                            setHighlightedDropdownItemIndex(0);
                            setTimeout(() => {
                              const firstItem = dropdownItemRefs.current.get(
                                `${session.id}-0`
                              );
                              firstItem?.focus();
                            }, 0);
                          }
                        }
                      }}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>

                    {showDropdownForChatId === session.id && (
                      <div
                        className={`absolute right-0 mt-2 w-40 rounded-md shadow-lg z-50 ${
                          theme === "dark"
                            ? "bg-card-dark border border-border-dark text-text-primary-dark"
                            : "bg-card-light border border-border-light text-text-primary"
                        }`}
                        role="menu"
                        aria-labelledby={`chat-actions-button-${session.id}`}
                        onKeyDown={(e) => {
                          const items = Array.from(
                            dropdownItemRefs.current.values()
                          ).filter(
                            (el) =>
                              el.id.startsWith(`${session.id}-`) && !el.disabled
                          );
                          if (items.length === 0) return;

                          let nextIndex = highlightedDropdownItemIndex;
                          if (e.key === "ArrowDown") {
                            e.preventDefault();
                            nextIndex =
                              highlightedDropdownItemIndex === null ||
                              highlightedDropdownItemIndex === items.length - 1
                                ? 0
                                : highlightedDropdownItemIndex + 1;
                          } else if (e.key === "ArrowUp") {
                            e.preventDefault();
                            nextIndex =
                              highlightedDropdownItemIndex === null ||
                              highlightedDropdownItemIndex === 0
                                ? items.length - 1
                                : highlightedDropdownItemIndex - 1;
                          } else if (e.key === "Escape") {
                            e.preventDefault();
                            setShowDropdownForChatId(null);
                            setHighlightedDropdownItemIndex(null);
                            moreVerticalButtonRefs.current
                              .get(session.id)
                              ?.focus();
                            return;
                          } else if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            if (highlightedDropdownItemIndex !== null) {
                              items[highlightedDropdownItemIndex]?.click();
                            }
                            return;
                          }

                          if (nextIndex !== null) {
                            setHighlightedDropdownItemIndex(nextIndex);
                            setTimeout(() => items[nextIndex]?.focus(), 0);
                          }
                        }}
                      >
                        <button
                          onClick={() => handlePinToggle(session)}
                          role="menuitem"
                          id={`${session.id}-0`}
                          ref={(el) => {
                            if (el)
                              dropdownItemRefs.current.set(
                                `${session.id}-0`,
                                el
                              );
                            else
                              dropdownItemRefs.current.delete(
                                `${session.id}-0`
                              );
                          }}
                          className={`block w-full text-left px-4 py-2 text-sm ${
                            theme === "dark"
                              ? "hover:bg-brand-secondary-dark"
                              : "hover:bg-brand-secondary"
                          } ${
                            highlightedDropdownItemIndex === 0
                              ? theme === "dark"
                                ? "bg-brand-secondary-dark"
                                : "bg-brand-secondary"
                              : ""
                          }`}
                          tabIndex={highlightedDropdownItemIndex === 0 ? 0 : -1}
                        >
                          {session.isPinned ? "Unpin" : "Pin"}
                        </button>
                        <button
                          onClick={() => handleRenameClick(session)}
                          role="menuitem"
                          id={`${session.id}-1`}
                          ref={(el) => {
                            if (el)
                              dropdownItemRefs.current.set(
                                `${session.id}-1`,
                                el
                              );
                            else
                              dropdownItemRefs.current.delete(
                                `${session.id}-1`
                              );
                          }}
                          className={`block w-full text-left px-4 py-2 text-sm ${
                            theme === "dark"
                              ? "hover:bg-brand-secondary-dark"
                              : "hover:bg-brand-secondary"
                          } ${
                            highlightedDropdownItemIndex === 1
                              ? theme === "dark"
                                ? "bg-brand-secondary-dark"
                                : "bg-brand-secondary"
                              : ""
                          }`}
                          tabIndex={highlightedDropdownItemIndex === 1 ? 0 : -1}
                        >
                          Rename
                        </button>
                        <button
                          onClick={() => handleDeleteClick(session.id)}
                          role="menuitem"
                          id={`${session.id}-2`}
                          ref={(el) => {
                            if (el)
                              dropdownItemRefs.current.set(
                                `${session.id}-2`,
                                el
                              );
                            else
                              dropdownItemRefs.current.delete(
                                `${session.id}-2`
                              );
                          }}
                          className={`block w-full text-left px-4 py-2 text-sm text-destructive hover:bg-red-50 ${
                            highlightedDropdownItemIndex === 2
                              ? "bg-red-50"
                              : ""
                          }`}
                          tabIndex={highlightedDropdownItemIndex === 2 ? 0 : -1}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
        </div>

        <div
          className={`p-4 border-t ${
            theme === "dark" ? "border-border-dark" : "border-border-light"
          }`}
        >
          <div
            className={`flex ${
              effectiveOpen ? "flex-row" : "flex-col"
            } items-center gap-2`}
          >
            <button
              onClick={onLogout}
              className={`inline-flex items-center justify-center rounded-full text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 h-10
                ${effectiveOpen ? "w-full px-4 py-2" : "w-10 p-0"}
                ${
                  theme === "dark"
                    ? "border border-border-dark bg-card-dark text-text-primary-dark hover:bg-brand-secondary-dark"
                    : "border border-border-light bg-card-light text-text-primary hover:bg-brand-secondary"
                }`}
            >
              <LogOut className={`h-5 w-5 ${effectiveOpen ? "mr-2" : ""}`} />
              {effectiveOpen && "Logout"}
            </button>
            <button
              onClick={toggleTheme}
              className={`inline-flex items-center justify-center rounded-full text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 h-10
                ${effectiveOpen ? "px-4 py-2" : "p-0"}
                ${effectiveOpen ? "w-auto" : "w-10"}
                ${
                  theme === "dark"
                    ? "border border-border-dark bg-card-dark text-text-primary-dark hover:bg-brand-secondary-dark"
                    : "border border-border-light bg-card-light text-text-primary hover:bg-brand-secondary"
                }`}
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
