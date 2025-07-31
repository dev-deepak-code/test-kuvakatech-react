"use client";

import type React from "react";
import { X, ImageIcon } from "lucide-react";

interface ImagePreview {
  id: string;
  url: string;
  file: File;
}

interface ChatInputFormProps {
  input: string;
  setInput: (input: string) => void;
  isLoading: boolean;
  imagePreviews: ImagePreview[];
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveImage: (id: string) => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  textInputRef: React.RefObject<HTMLInputElement | null>;
  theme: "light" | "dark";
}

export function ChatInputForm({
  input,
  setInput,
  isLoading,
  imagePreviews,
  handleImageUpload,
  handleRemoveImage,
  handleSubmit,
  fileInputRef,
  textInputRef,
  theme,
}: ChatInputFormProps) {
  return (
    <div className="p-4 max-w-3xl mx-auto w-full">
      <div
        className={`rounded-2xl border shadow-md p-3 ${
          theme === "dark"
            ? "bg-card-dark border-border-dark"
            : "bg-card-light border-border-light"
        }`}
      >
        {imagePreviews.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {imagePreviews.map((preview) => (
              <div
                key={preview.id}
                className={`relative w-20 h-20 rounded-md overflow-hidden border ${
                  theme === "dark"
                    ? "border-border-dark"
                    : "border-border-light"
                }`}
              >
                <img
                  src={preview.url || "/placeholder.svg"}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(preview.id)}
                  className="absolute top-0 right-0 bg-black bg-opacity-50 text-white rounded-bl-md p-1 hover:bg-opacity-75"
                  aria-label="Remove image"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            ref={textInputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message AI Assistant..."
            disabled={isLoading}
            className={`w-full h-10 px-3 py-2 text-base focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 rounded-xl ${
              theme === "dark"
                ? "bg-card-dark text-text-primary-dark"
                : "bg-card-light text-text-primary"
            }`}
          />
          <div className="flex items-center justify-between gap-3">
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={isLoading || imagePreviews.length >= 5}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none h-12 w-12 ${
                theme === "dark"
                  ? "bg-brand-secondary-dark text-text-secondary-dark hover:bg-gray-700"
                  : "bg-brand-secondary text-text-secondary hover:bg-brand-secondary-dark"
              }`}
              disabled={isLoading || imagePreviews.length >= 5}
              aria-label="Upload image"
            >
              <ImageIcon className="h-6 w-6" />
            </button>
            <button
              type="submit"
              disabled={
                isLoading || (!input.trim() && imagePreviews.length === 0)
              }
              className="inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-brand-primary text-primary-foreground hover:bg-brand-primary-dark h-12 w-12"
              aria-label="Send message"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}