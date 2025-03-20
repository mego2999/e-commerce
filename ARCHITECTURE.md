# E-Commerce Application Architecture

This document outlines the architecture of our e-commerce application using Mermaid diagrams.

## Component Structure

```mermaid
graph TD
    App[App.js] --> Auth[AuthProvider]
    App --> Cart[CartProvider]
    App --> Nav[Navbar]
    App --> Routes[Routes]
    
    Routes --> Home[Home]
    Routes --> Login[Login]
    Routes --> Register[Register]
    Routes --> AdminDash[AdminDashboard]
    Routes --> Profile[Profile]
    Routes --> PrivateRoute[PrivateRoute]
    
    PrivateRoute --> MyOrders[MyOrders]
    
    Home --> ProductCard[ProductCard]
    Home --> Filters[Filters]
    
    AdminDash --> UserManagement[User Management]
    AdminDash --> ProductManagement[Product Management]
    
    Cart --> CartItem[CartItem]
```

## Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant UI as UI Components
    participant Auth as AuthContext
    participant Firebase as Firebase Auth
    participant DB as Firestore
    
    User->>UI: Enter credentials
    UI->>Auth: Call login/signup
    Auth->>Firebase: Authenticate
    Firebase-->>Auth: Return user object
    Auth->>DB: Fetch user data/role
    DB-->>Auth: Return user data
    Auth-->>UI: Update auth state
    UI-->>User: Redirect to appropriate page
```

## Data Flow

```mermaid
flowchart LR
    Client[Client Components] <--> Context[Context Providers]
    Context <--> Firebase[Firebase Services]
    
    subgraph Context Providers
        AuthContext[AuthContext]
        CartContext[CartContext]
    end
    
    subgraph Firebase Services
        Auth[Authentication]
        Firestore[Firestore DB]
    end
    
    subgraph Firestore Collections
        Users[(Users)]
        Products[(Products)]
        Orders[(Orders)]
        Categories[(Categories)]
    end
    
    Firestore --- Users
    Firestore --- Products
    Firestore --- Orders
    Firestore --- Categories
```

## Role-Based Access Control

```mermaid
graph TD
    User[User Role] --> USER[Regular User]
    User --> VIEWER[Viewer]
    User --> EDITOR[Editor]
    User --> ADMIN[Admin]
    
    USER --> ViewProducts[View Products]
    USER --> PlaceOrders[Place Orders]
    USER --> ViewOwnOrders[View Own Orders]
    
    VIEWER --> ViewProducts
    VIEWER --> ViewAllOrders[View All Orders]
    
    EDITOR --> ViewProducts
    EDITOR --> ViewAllOrders
    EDITOR --> EditProducts[Edit Products]
    
    ADMIN --> ViewProducts
    ADMIN --> ViewAllOrders
    ADMIN --> EditProducts
    ADMIN --> DeleteProducts[Delete Products]
    ADMIN --> ManageUsers[Manage Users]
``` 