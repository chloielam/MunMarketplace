# MUN Marketplace — 4+1 View Diagrams

This captures the current architecture from the codebase (React frontend, NestJS backend, MySQL, Socket.IO chat, email OTP auth). URLs assume the global `/api` prefix set in `backend/src/main.ts`.

## Logical View (Domain Model)
```mermaid
classDiagram
  direction LR
  class User {
    uuid user_id
    mun_email
    first_name
    last_name
    password_hash
  }
  class UserProfile {
    bio
    city
    campus
    avatar_url
    rating
    total_ratings
  }
  class Listing {
    uuid id
    title
    description
    price
    currency
    category
    city
    campus
    imageUrls[]
    status( ACTIVE|PENDING|SOLD|HIDDEN )
    seller_id
    sold_to_user_id
    soldAt
  }
  class Conversation {
    uuid id
    participantIds[]
    listingId
    lastMessage
    lastMessageAt
  }
  class Message {
    uuid id
    conversationId
    senderId
    content
    createdAt
  }
  class SellerRating {
    uuid id
    seller_id
    buyer_id
    listing_id
    rating
    review
  }
  class Session {
    id
    json
    expiredAt
  }
  class OtpCode {
    id
    mun_email
    codeHash
    expiresAt
    used
    attempts
  }

  User "1" --> "1" UserProfile : owns
  User "1" --> "*" Listing : sells
  User "1" --> "*" Message : sends
  User "1" <-- "*" SellerRating : receives
  Listing "*" --> "0..1" User : soldTo(sold_to_user_id)
  Listing "1" --> "*" Conversation : discussedIn
  Conversation "1" --> "*" Message : contains
  SellerRating "*" --> "1" Listing : about
  Session "*" --> "1" User : authenticates
  OtpCode "*" --> "1" User : validatesEmail
```

## Development View (Code & Module Structure)
```mermaid
flowchart TD
  subgraph FE[Frontend (Vite React + Axios)]
    Pages --> Components --> Services --> APIClient[services/api.js Axios instance]
    APIClient --> LocalState[localStorage sessionUser]
  end

  subgraph BE[Backend (NestJS + TypeORM)]
    App[AppModule] --> Auth[AuthModule\nsessions + OTP + mailer]
    App --> Users[UsersModule\nusers + profiles]
    App --> Listings[ListingModule\nlisting.controller.ts\nuser-listing.controller.ts]
    App --> Chat[ChatModule\nChatGateway (Socket.IO)]
    App --> Ratings[SellerRatingsModule\naggregates profile ratings]
    App --> TestSupport[(TestSupportModule\nnon-prod only)]
    Auth --> Users
    Listings --> Users
    Chat --> Ratings
    Ratings --> Users
    App --> TypeORM[(TypeORM datasource)]
  end

  FE -->|HTTP /api...| BE
  FE -->|WebSocket /socket.io| Chat
  TypeORM --> DB[(MySQL in dev/prod; SQLite in tests)]
```

## Process View (Runtime Interaction & Concurrency)
```mermaid
sequenceDiagram
  participant U as User Browser
  participant FE as Frontend (React)
  participant BE as Backend (NestJS)
  participant DB as DB (TypeORM -> MySQL/SQLite)
  participant Mailer as MailerService (Gmail SMTP)

  U->>FE: Enter MUN email for OTP
  FE->>BE: POST /api/auth/send-otp
  BE->>Mailer: sendOtp(email)
  Mailer-->>BE: SMTP accepted

  U->>FE: Submit OTP + password
  FE->>BE: POST /api/auth/register or /api/auth/login
  BE->>DB: validate user + write Session entity
  BE-->>FE: 200 + session cookie (mun.sid)

  FE->>BE: GET /api/listings?filters...
  BE->>DB: query listings with pagination
  BE-->>FE: paged listings JSON

  U->>FE: Send chat message
  FE->>BE: WS sendMessage(conversationId, senderId, content)
  BE->>DB: persist Message, update Conversation.lastMessage
  BE-->>FE: emit newMessage to room participants
```

## Physical View (Deployment & Environment)
```mermaid
flowchart LR
  subgraph Client
    Browser[Browser\nReact SPA runtime]
  end

  subgraph AppTier
    Frontend[Static assets\nVite dev :5173 or CDN]
    Backend[NestJS API + Socket.IO\n:3000]
  end

  subgraph DataTier
    MySQL[(MySQL 8\nDocker service 3306)]
    phpMyAdmin[phpMyAdmin UI\nDocker :8081]
  end

  Browser -->|HTTPS| Frontend
  Frontend -->|REST /api + cookies| Backend
  Frontend -->|WS /socket.io| Backend
  Backend -->|TypeORM| MySQL
  phpMyAdmin <-->|SQL| MySQL
  Backend -->|SMTP| Gmail[marketplacemun@gmail.com]
```

## Scenario View (Key Use Cases)
### A. Seller posts listing, buyer browses
```mermaid
sequenceDiagram
  participant SellerFE as Seller UI
  participant BE as API
  participant DB as DB
  SellerFE->>BE: POST /api/auth/login (gets session)
  SellerFE->>BE: POST /api/me/listings {title, price, ...}
  BE->>DB: insert Listing(seller_id)
  BE-->>SellerFE: 201 Listing id
  Note over BE,DB: Listing.status defaults to ACTIVE
  BuyerFE->>BE: GET /api/listings?category=...
  BE->>DB: filter + paginate
  BE-->>BuyerFE: listings JSON + hasNext
```

### B. Buyer chats and rates seller after purchase
```mermaid
sequenceDiagram
  participant Buyer as Buyer UI
  participant BE as API/WS
  participant DB as DB
  Buyer->>BE: POST /api/chat/conversations {userId1=buyer,userId2=seller,listingId}
  BE->>DB: find/create Conversation
  Buyer->>BE: WS sendMessage(conversationId,...)
  BE->>DB: save Message, update Conversation.lastMessage
  BE-->>Buyer: WS newMessage broadcast
  Seller marks sold: PATCH /api/me/listings/:id/sold {buyerId}
  BE->>DB: update Listing.status=SOLD, sold_to_user_id=buyer
  Buyer->>BE: POST /api/users/:sellerId/ratings {listingId,rating,review}
  BE->>DB: upsert SellerRating + refresh profile aggregates
  BE-->>Buyer: rating receipt
```
