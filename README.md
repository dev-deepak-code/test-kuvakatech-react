# AI Chat OTP Authentication

A modern, responsive AI chat application with secure phone-based OTP authentication, built with Next.js, TypeScript, and Tailwind CSS. This project demonstrates advanced frontend patterns including throttling, pagination, infinite scroll, and comprehensive form validation.

## 🌟 Live Demo

**Live Application:** [Deploy your app and add the link here]

## 📋 Project Overview

This is a Gemini-inspired AI chat interface that prioritizes user experience and security. The application features:

- **Secure Authentication**: Phone number verification with OTP
- **Modern Chat Interface**: Real-time streaming responses with typing indicators
- **Advanced UX Patterns**: Infinite scroll, pagination, throttling, and form validation
- **Responsive Design**: Works seamlessly across all devices
- **Dark/Light Theme**: User preference-based theming
- **Image Upload Support**: Multi-image upload with preview
- **Chat Management**: Create, rename, pin, and delete conversations
- **Local Storage**: Persistent chat history and user sessions

### Why We Built This UI

We chose to create this Gemini-inspired interface because:

1. **User-Centric Design**: The clean, modern interface prioritizes readability and ease of use
2. **Scalable Architecture**: Modular component structure allows for easy feature additions
3. **Performance Optimization**: Implements advanced patterns like infinite scroll and throttling
4. **Security First**: OTP authentication ensures secure access
5. **Accessibility**: Built with accessibility best practices in mind
6. **Developer Experience**: TypeScript and modern tooling for maintainable code

## 🚀 Setup and Run Instructions

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd ai-chat-otp-auth
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## 📁 Folder/Component Structure

```
ai-chat-otp-auth/
├── app/                          # Next.js 13+ App Router
│   ├── api/                      # API routes
│   │   ├── chat/                 # Chat API endpoint
│   │   └── countries/            # Countries data API
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main page component
├── components/                   # React components
│   ├── Chat/                     # Chat interface components
│   │   ├── ChatHeader.tsx        # Chat header with user info
│   │   ├── ChatInputForm.tsx     # Message input with image upload
│   │   ├── ChatInterface.tsx     # Main chat container
│   │   └── ChatMessages.tsx      # Message display with infinite scroll
│   ├── Login/                    # Authentication components
│   │   ├── CountrySelector.tsx   # Country code selector
│   │   └── LoginSignup.tsx       # Phone/OTP authentication
│   ├── Modal/                    # Modal components
│   │   ├── DeleteConfirmationModal.tsx
│   │   └── RenameModal.tsx
│   ├── Sidebar/                  # Chat sidebar
│   │   └── Sidebar.tsx           # Chat list and management
│   └── CustomToast.tsx           # Toast notifications
├── hooks/                        # Custom React hooks
│   └── use-toast.ts              # Toast management hook
├── utils/                        # Utility functions
│   └── validations.ts            # Zod validation schemas
├── public/                       # Static assets
└── [config files]                # Next.js, TypeScript, Tailwind configs
```

## 🔧 Implementation Details

### 1. Throttling Implementation

**Location**: `components/Chat/ChatInterface.tsx`

Throttling is implemented to prevent excessive API calls and improve performance:

```typescript
// Message submission throttling
const handleSubmit = async (e?: React.FormEvent) => {
  e?.preventDefault();
  if ((!input.trim() && imagePreviews.length === 0) || isLoading) return;
  // Prevents multiple simultaneous submissions
};

// Scroll throttling for infinite scroll
const handleScroll = () => {
  if (chatContainerRef.current) {
    const { scrollTop } = chatContainerRef.current;
    if (scrollTop === 0 && !isFetchingOlderMessages) {
      // Throttled scroll handling
    }
  }
};
```

### 2. Pagination Implementation

**Location**: `components/Chat/ChatInterface.tsx`

Pagination is implemented for efficient message loading:

```typescript
const messagesPerPage = 20;
const [currentPage, setCurrentPage] = useState(1);

// Calculate displayed messages based on current page
const startIndex = Math.max(0, totalMessages - currentPage * messagesPerPage);
const newDisplayed = allMessagesInCurrentChat.slice(startIndex);
```

### 3. Infinite Scroll Implementation

**Location**: `components/Chat/ChatMessages.tsx` and `ChatInterface.tsx`

Infinite scroll loads older messages when scrolling to the top:

```typescript
const handleScroll = () => {
  if (chatContainerRef.current) {
    const { scrollTop } = chatContainerRef.current;
    if (
      scrollTop === 0 &&
      displayedMessages.length < allMessagesInCurrentChat.length &&
      !isFetchingOlderMessages
    ) {
      setIsFetchingOlderMessages(true);
      setCurrentPage((prev) => prev + 1);
    }
  }
};
```

### 4. Form Validation Implementation

**Location**: `utils/validations.ts` and `components/Login/LoginSignup.tsx`

Comprehensive form validation using Zod schemas:

```typescript
// Phone number validation
export const phoneSchema = z.object({
  countryCode: z.string().min(1, "Please select a country"),
  phoneNumber: z
    .string()
    .min(6, "Phone number must be at least 6 digits")
    .max(15, "Phone number must be at most 15 digits")
    .regex(/^\d+$/, "Phone number must contain only digits"),
});

// OTP validation
export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d+$/, "OTP must contain only digits"),
});
```

### 5. Authentication Flow

**Location**: `components/Login/LoginSignup.tsx`

Two-step authentication process:

1. **Phone Number Entry**: Country selection + phone number input
2. **OTP Verification**: 6-digit code verification with countdown timer
3. **Session Management**: Local storage for persistent sessions

### 6. Real-time Chat Features

**Location**: `app/api/chat/route.ts`

Server-sent events for real-time message streaming:

```typescript
const stream = new ReadableStream({
  start(controller) {
    const words = response.split(" ");
    let index = 0;

    const interval = setInterval(() => {
      if (index < words.length) {
        const chunk = index === 0 ? words[index] : " " + words[index];
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`)
        );
        index++;
      } else {
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();
        clearInterval(interval);
      }
    }, 100);
  },
});
```

## 🎨 Key Features

### Authentication System

- Phone number verification with OTP
- Country code selection
- Session persistence
- Secure logout functionality

### Chat Interface

- Real-time message streaming
- Image upload support (up to 5 images)
- Message copying functionality
- Typing indicators
- Message timestamps

### Chat Management

- Create new conversations
- Rename chat titles
- Pin/unpin important chats
- Delete conversations with confirmation
- Persistent chat history

### User Experience

- Dark/light theme toggle
- Responsive design
- Loading states and skeletons
- Toast notifications
- Infinite scroll for message history
- Smooth animations and transitions

### Performance Optimizations

- Message pagination (20 messages per page)
- Throttled scroll handling
- Optimized re-renders
- Efficient state management
- Local storage for data persistence

## 🛠️ Technologies Used

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Tailwind CSS Animate
- **Forms**: React Hook Form, Zod validation
- **Icons**: Lucide React
- **UI Components**: Custom components with accessibility
- **State Management**: React hooks and local storage
- **API**: Next.js API routes with streaming responses

## 📱 Responsive Design

The application is fully responsive and optimized for:

- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)
