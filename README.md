# Cosecha Próspera - Technical Documentation

## 📋 Project Overview

**Cosecha Próspera** (Prosperous Harvest) is an AI-powered mobile application designed to help Colombian coffee farmers make informed decisions about when to sell their coffee harvest. The app provides personalized recommendations based on historical price data, weather patterns, and the farmer's individual sales history.

### Problem Statement

Small and medium-scale coffee farmers in Colombia's coffee-growing regions (Antioquia, Caldas, Quindío) face significant uncertainty when deciding the optimal time to sell their harvest. Without access to predictive analytics or market insights, they often sell at suboptimal prices, directly impacting their families' economic stability.

### Solution

An intelligent mobile application that:
- Aggregates historical coffee price data from the Colombian Coffee Growers Federation (FNC)
- Provides AI-powered analysis through conversational interface
- Allows farmers to track their personal sales history
- Delivers personalized recommendations based on individual context

---

## 🎯 Project Goals

### Primary Objectives
1. **Provide actionable insights**: Help farmers understand current market trends
2. **Personalized recommendations**: Context-aware advice based on user's history
3. **Accessibility**: Simple, intuitive interface for non-technical users
4. **Real-world impact**: Improve income stability for small coffee producers

### Success Metrics
- Functional MVP with core features operational
- AI responses that are contextually relevant and personalized
- Clean, intuitive UI/UX suitable for target demographic
- Complete documentation and demo-ready presentation

---

## 🏗️ Technical Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                 PRESENTATION LAYER                      │
│            React Native + Expo + NativeWind             │
│                                                         │
│  - Authentication Screens                               │
│  - Dashboard (Price Display)                            │
│  - AI Analysis Chat Interface                           │
│  - Personal Sales Diary (CRUD)                          │
└────────────────────────┬────────────────────────────────┘
                         │
                         │ HTTPS / REST API
                         │
┌────────────────────────┴────────────────────────────────┐
│                   BACKEND LAYER                         │
│            Supabase (BaaS Platform)                     │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ PostgreSQL Database                             │   │
│  │  - historical_prices                            │   │
│  │  - farmer_profiles                              │   │
│  │  - sales_notes                                  │   │
│  │  - auth.users (built-in)                        │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Authentication Service                          │   │
│  │  - Email/Password                               │   │
│  │  - Google OAuth (optional)                      │   │
│  │  - Apple Sign In (optional)                     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Edge Functions (Serverless - Deno)             │   │
│  │  - analizar-contexto: AI analysis orchestrator  │   │
│  │  - get-precio-actual: Latest price fetch        │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Row Level Security (RLS)                        │   │
│  │  - User data isolation                          │   │
│  │  - Public read for historical prices            │   │
│  └─────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────┘
                         │
                         │ HTTPS
                         │
┌────────────────────────┴────────────────────────────────┐
│                   AI LAYER                              │
│              OpenAI API / Claude API                    │
│                                                         │
│  Model: gpt-4o-mini (cost-effective for MVP)           │
│                                                         │
│  Input: System Prompt + Personalized Context           │
│  Output: Contextual Analysis & Recommendations         │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React Native 0.74+
- **Build Tool**: Expo 51+
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Navigation**: React Navigation 6.x
- **State Management**: React Hooks (useState, useEffect, useContext)
- **Language**: TypeScript

**Rationale**: React Native provides cross-platform development (iOS/Android) with a single codebase. Expo simplifies development workflow with hot reloading and easy testing.

### Backend (BaaS)
- **Platform**: Supabase
- **Database**: PostgreSQL 15+
- **Serverless Functions**: Deno (Edge Functions)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime (optional for future features)

**Rationale**: Supabase provides a complete backend solution with minimal setup, eliminating the need for custom server infrastructure.

### AI Integration
- **Primary**: OpenAI API (gpt-4o-mini)
- **Alternative**: Claude 3.5 Sonnet (Anthropic API)
- **Pattern**: Retrieval-Augmented Generation (RAG) - lite version

**Rationale**: Using pre-trained LLMs with prompt engineering is faster and more cost-effective than training custom models for an MVP. The RAG pattern ensures responses are grounded in actual user data.

### Data Storage
- **Structured Data**: PostgreSQL (via Supabase)
- **Local Cache**: AsyncStorage (React Native)
- **File Storage**: Supabase Storage (if needed for future features)

---

## 📊 Database Schema

### Tables Structure

#### `historical_prices` (Historical Prices)
```sql
CREATE TABLE historical_prices (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  fnc_price DECIMAL(12,2) NOT NULL,  -- Price per 125kg load
  ny_price DECIMAL(10,4),             -- NY Stock Exchange price
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Purpose**: Store historical coffee prices from FNC and international markets.

**Access**: Public read (authenticated users), Admin write

**Data Source**: Manual entry or web scraping from FNC website

---

#### `farmer_profiles` (Farmer Profile)
```sql
CREATE TABLE farmer_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  region TEXT,                         -- e.g., "Quindío", "Caldas"
  hectares DECIMAL(5,2),               -- Farm size in hectares
  coffee_variety TEXT,                 -- Coffee variety (optional)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Purpose**: Store contextual information about the farmer for personalized AI responses.

**Access**: User can only read/write their own profile (RLS enforced)

**Usage**: Injected into AI prompts to provide personalized recommendations

---

#### `sales_notes` (Sales Diary)
```sql
CREATE TABLE sales_notes (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  price DECIMAL(12,2) NOT NULL,        -- Price per load
  loads_quantity INTEGER NOT NULL,     -- Number of loads sold
  notes TEXT,                          -- Optional user notes
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Purpose**: Allow farmers to track their personal sales history.

**Access**: User can only access their own notes (RLS enforced)

**Usage**: 
- Historical reference for the user
- Context for AI to compare current prices with user's past sales

---

## 🎨 Application Features & Scope

### Feature 1: Authentication System

**Scope**: User registration and login

**User Stories**:
- As a farmer, I want to create an account with my email so I can access personalized features
- As a user, I want to log in securely so my data remains private
- As a user, I want to stay logged in so I don't have to authenticate every time

**Implementation Details**:
```
Screens:
├── LoginScreen
│   ├── Email input
│   ├── Password input
│   ├── "Login" button
│   ├── "Create Account" toggle
│   └── Error handling
└── (Future) OAuth options (Google, Apple)

Technical Requirements:
- Supabase Auth integration
- Secure token storage (AsyncStorage)
- Auto-refresh tokens
- Session persistence
- Input validation (email format, password strength)

Edge Cases:
- Network failure during login
- Invalid credentials
- Expired session
- First-time user onboarding
```

**Out of Scope for MVP**:
- Password reset functionality
- Social login (Google/Apple)
- Multi-factor authentication
- Profile picture upload

---

### Feature 2: Dashboard (Price Display)

**Scope**: Display current coffee prices and market information

**User Stories**:
- As a farmer, I want to see the current FNC reference price immediately upon login
- As a user, I want to see the NY stock exchange price to understand international trends
- As a user, I want to quickly access the AI analysis feature from the dashboard

**Implementation Details**:
```
Components:
├── DashboardScreen
│   ├── Header (App branding)
│   ├── PriceCard Component
│   │   ├── Current FNC price (large, prominent)
│   │   ├── Price change indicator (+/- percentage)
│   │   ├── Last update timestamp
│   │   └── NY exchange price (secondary info)
│   ├── "Analyze with AI" CTA button
│   ├── "My Sales Diary" navigation button
│   └── Pull-to-refresh functionality

Data Flow:
1. Component mounts → fetch latest price from Supabase
2. Query: SELECT * FROM historical_prices ORDER BY date DESC LIMIT 1
3. Calculate percentage change vs. previous day/week
4. Display in card with appropriate styling (green for up, red for down)
5. Cache data locally for offline viewing

UI/UX Guidelines:
- Price should be the focal point (large font, bold)
- Use color psychology (green = favorable, red = caution)
- Include context (date, comparison to average)
- Fast loading (< 2 seconds)
- Graceful degradation if data unavailable
```

**Out of Scope for MVP**:
- Price history chart/graph
- Multiple price types (washed vs. natural)
- Regional price variations
- Push notifications for price changes
- Predictive price modeling

---

### Feature 3: AI-Powered Analysis Chat

**Scope**: Conversational interface for personalized recommendations

**User Stories**:
- As a farmer, I want to ask "Should I sell now?" and receive a personalized answer
- As a user, I want the AI to consider my previous sales when making recommendations
- As a user, I want to understand the reasoning behind the AI's suggestion

**Implementation Details**:
```
Components:
├── AnalysisScreen
│   ├── Chat UI
│   │   ├── Message list (scrollable)
│   │   ├── User messages (right-aligned, blue)
│   │   ├── AI messages (left-aligned, white)
│   │   └── Loading indicator
│   ├── Input field
│   │   ├── Text input (multiline)
│   │   ├── Send button
│   │   └── Character limit indicator
│   └── Quick question buttons (optional)
│       ├── "Should I sell now?"
│       ├── "Analyze current price"
│       └── "What's the trend?"

Architecture Flow:
1. User types question → sends to Edge Function
2. Edge Function:
   a. Authenticates user
   b. Fetches context from database:
      - Last 12 months of price data
      - User's profile (region, farm size)
      - User's last 5 sales
   c. Constructs personalized prompt
   d. Calls OpenAI API with context
   e. Returns AI response
3. Display formatted response in chat

Prompt Engineering:
System Prompt:
"You are an expert advisor for Colombian coffee farmers. Analyze historical 
price data and provide personalized recommendations. Be specific with numbers, 
percentages, and clear action items. Use emojis for visual clarity. 
Format: Trend Analysis → Personal Context → Recommendation → Considerations"

Context Injection:
- Historical prices: "[Nov 2025: $1,890,000, Oct 2025: $1,850,000...]"
- User profile: "Farmer in Quindío with 5 hectares"
- User history: "Last sold in February at $1,750,000"
- Current price: "$1,890,000"
- Question: "{user_input}"

Response Format (AI generates):
📈 Current Trend: [analysis]
💰 Personal Context: [comparison to user's history]
✅ Recommendation: [clear action item]
⚠️ Considerations: [risks, external factors]

Technical Requirements:
- Token limit management (max 600 tokens output)
- Streaming responses (optional, for better UX)
- Error handling (API failures, rate limits)
- Message persistence (optional, store in DB)
- Cost monitoring (track API usage)
```

**Out of Scope for MVP**:
- Voice input/output
- Image analysis (coffee quality assessment)
- Multi-turn conversation memory (stateless per query)
- Multiple AI models comparison
- Real-time price alerts
- Shareable reports

---

### Feature 4: Personal Sales Diary (CRUD)

**Scope**: Allow users to record and view their sales history

**User Stories**:
- As a farmer, I want to record each sale (date, price, quantity) so I can track my performance
- As a user, I want to add notes about each sale (e.g., quality, buyer)
- As a user, I want to view my sales history to identify patterns
- As a user, I want to edit or delete entries if I made a mistake

**Implementation Details**:
```
Components:
├── DiaryScreen
│   ├── Header with "Add New Sale" button
│   ├── Sales list (FlatList)
│   │   ├── Individual sale cards
│   │   │   ├── Date (prominent)
│   │   │   ├── Price per load
│   │   │   ├── Quantity (number of loads)
│   │   │   ├── Total amount (calculated)
│   │   │   ├── Optional notes
│   │   │   └── Edit/Delete actions
│   │   └── Empty state (if no sales recorded)
│   └── Add/Edit Modal
│       ├── Date picker
│       ├── Price input (numeric)
│       ├── Quantity input (numeric)
│       ├── Notes input (multiline text)
│       ├── Save button
│       └── Cancel button

CRUD Operations:

CREATE:
- Form: date, price, loads_quantity, notes
- Validation: required fields (date, price, quantity)
- SQL: INSERT INTO sales_notes (user_id, date, price, loads_quantity, notes)
- UI feedback: Success toast, close modal, refresh list

READ:
- SQL: SELECT * FROM sales_notes WHERE user_id = {user_id} ORDER BY date DESC
- Display: Most recent sales first
- Performance: Pagination if > 50 entries (future)

UPDATE:
- Open modal with pre-filled data
- Allow editing all fields
- SQL: UPDATE sales_notes SET ... WHERE id = {id} AND user_id = {user_id}
- UI feedback: Success message

DELETE:
- Confirmation dialog ("Are you sure?")
- SQL: DELETE FROM sales_notes WHERE id = {id} AND user_id = {user_id}
- UI feedback: Success toast, remove from list

Calculations:
- Total per sale = price * loads_quantity
- Average price across all sales
- Total revenue to date

UI/UX Guidelines:
- Quick add (minimal taps to record a sale)
- Visual timeline (newest at top)
- Color coding (higher prices in green, lower in red vs. average)
- Swipe actions for quick edit/delete (future enhancement)
```

**Out of Scope for MVP**:
- Export to CSV/PDF
- Advanced filtering (by date range, price range)
- Sales statistics dashboard
- Photo attachments (coffee samples)
- Multiple buyers tracking
- Integration with accounting software

---

## 🔐 Security & Data Privacy

### Authentication & Authorization
- **JWT Tokens**: Issued by Supabase Auth, stored securely in AsyncStorage
- **Row Level Security (RLS)**: PostgreSQL policies ensure users only access their own data
- **API Key Protection**: OpenAI key stored as Supabase secret (never exposed to client)

### Data Protection
```sql
-- RLS Policies Example
CREATE POLICY "Users view own profile"
  ON farmer_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own notes"
  ON sales_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Best Practices
- HTTPS only communication
- Input validation on client and server
- SQL injection prevention (parameterized queries via Supabase client)
- Rate limiting on Edge Functions
- No sensitive data in logs

---

## 🚀 Deployment & Infrastructure

### Frontend Deployment
```
Development:
- Local testing: Expo Go app on physical device
- Hot reload for rapid iteration

Production:
- Option 1: Expo EAS Build (managed builds)
  - Build iOS IPA
  - Build Android APK/AAB
  - Submit to App Store / Play Store

- Option 2: Web export (demo purposes)
  - expo export:web
  - Host on Vercel/Netlify
```

### Backend Infrastructure
```
Supabase Project:
- Hosted PostgreSQL (Free tier: 500MB)
- Edge Functions (Free tier: 500K invocations/month)
- Auth (Free tier: 50K MAU)
- Region: South America (São Paulo) for lower latency

Environment Variables:
- SUPABASE_URL (public)
- SUPABASE_ANON_KEY (public, but with RLS protection)
- OPENAI_API_KEY (secret, server-side only)
```

### CI/CD (Future Enhancement)
```
- GitHub Actions for automated testing
- Automated EAS builds on git push
- Preview deployments for PR reviews
```

---

## 💰 Cost Analysis

### MVP Phase (3 months, 100 active users)
```
Supabase Free Tier:
✅ Database: 500MB (sufficient)
✅ Edge Functions: 500K invocations (sufficient)
✅ Auth: 50K MAU (sufficient)
Cost: $0/month

OpenAI API (gpt-4o-mini):
Pricing:
- Input: $0.15 per 1M tokens
- Output: $0.60 per 1M tokens

Estimated Usage (100 users, 5 queries/user/month = 500 queries):
- Average input: 800 tokens (context + question)
- Average output: 400 tokens
- Monthly tokens: 500 × (800 + 400) = 600K tokens
- Cost: (400K × $0.15 + 200K × $0.60) / 1M = ~$0.18/month

Total MVP Cost: < $1/month
```

### Scaling Projections
```
1,000 users:
- Supabase: Upgrade to Pro ($25/month)
- OpenAI: ~$20/month
Total: ~$45/month

10,000 users:
- Supabase: Pro + add-ons ($50/month)
- OpenAI: ~$200/month
Total: ~$250/month
```

---

## 📈 Development Roadmap

### Phase 1: MVP (Current - Week 1-2)
- ✅ Authentication system
- ✅ Dashboard with price display
- ✅ AI analysis chat
- ✅ Sales diary CRUD
- ✅ Basic responsive design

### Phase 2: Enhancement (Post-MVP)
- [ ] Price history charts
- [ ] Push notifications for price alerts
- [ ] Offline mode with data sync
- [ ] Social login (Google, Apple)
- [ ] Multi-language support (Spanish focus)

### Phase 3: Advanced Features
- [ ] Weather data integration
- [ ] Cooperative/community features
- [ ] Export reports (PDF)
- [ ] Advanced analytics dashboard
- [ ] Integration with FNC official APIs (if available)

---

## 🧪 Testing Strategy

### Unit Testing
```
Libraries: Jest + React Native Testing Library

Test Coverage:
- Utility functions (date formatting, price calculations)
- Custom hooks (useAuth, useSupabase)
- Component logic (form validation, data transformation)

Target: 70%+ coverage for business logic
```

### Integration Testing
```
Test Scenarios:
1. Auth flow: Register → Login → Logout
2. Data flow: Fetch prices → Display → Refresh
3. AI flow: Send question → Receive response → Display
4. CRUD flow: Create note → Read → Update → Delete

Tools: Detox (E2E) or manual testing for MVP
```

### Manual Testing Checklist
```
□ New user registration
□ Existing user login
□ Dashboard loads with correct prices
□ AI chat responds appropriately
□ Create sales note
□ Edit sales note
□ Delete sales note
□ App works offline (cached data)
□ App syncs when back online
□ Logout and session cleanup
```

---

## 📖 API Documentation

### Supabase Edge Function: `analyze-context`

**Endpoint**: `POST /functions/v1/analyze-context`

**Authentication**: Required (Bearer token in Authorization header)

**Request Body**:
```json
{
  "question": "Should I sell my coffee now?"
}
```

**Response** (Success - 200):
```json
{
  "analysis": "📈 Current Trend...",
  "current_price": 1890000,
  "average_12m": 1820000
}
```

**Response** (Error - 400):
```json
{
  "error": "Error message describing the issue"
}
```

**Process Flow**:
1. Validate authorization token
2. Extract user ID from token
3. Query database for context:
   - Historical prices (12 months)
   - User profile
   - User's sales history (last 5)
4. Build personalized context string
5. Call OpenAI API with system prompt + context
6. Return formatted response

**Rate Limiting**: 60 requests per minute per user (future implementation)

---

## 🎓 Learning Outcomes

This project demonstrates proficiency in:

### Technical Skills
- **Full-stack development**: React Native frontend + Supabase backend
- **AI integration**: Prompt engineering, RAG patterns, API integration
- **Database design**: PostgreSQL schema, RLS policies
- **Serverless architecture**: Edge Functions, BaaS platforms
- **Authentication**: Secure user management, token handling

### Soft Skills
- **Problem definition**: Identifying real-world pain points
- **Scope management**: Defining MVP vs. future features
- **Documentation**: Technical writing, architecture diagrams
- **User-centric design**: Focusing on target audience needs

### AI/ML Concepts
- **Retrieval-Augmented Generation (RAG)**: Context injection for personalized responses
- **Prompt engineering**: Crafting effective system prompts
- **LLM limitations**: Understanding when NOT to use AI
- **Ethical considerations**: Data privacy, bias awareness, transparency

---

## 🚨 Known Limitations & Future Improvements

### Current Limitations
1. **Data Source**: Manual price entry (FNC has no public API)
   - **Mitigation**: Web scraping or manual daily updates
   - **Future**: Partnership with FNC for API access

2. **Prediction Accuracy**: AI provides trends, not precise predictions
   - **Mitigation**: Clear disclaimers, educational context
   - **Future**: Integrate statistical models (Prophet, ARIMA)

3. **Offline Functionality**: Limited (read-only cached data)
   - **Mitigation**: Core features work with cached data
   - **Future**: Full offline mode with queue-based sync

4. **Scalability**: Single-region deployment
   - **Mitigation**: Sufficient for MVP and Colombian market
   - **Future**: Multi-region deployment, CDN for assets

### Ethical Considerations
- **Transparency**: AI recommendations include reasoning and limitations
- **Responsibility**: Clear disclaimer that AI is advisory, not guaranteed
- **Accessibility**: Simple language, avoid technical jargon
- **Bias Awareness**: Ensure recommendations don't favor large producers

---

## 📞 Support & Maintenance

### User Support (Post-Launch)
- In-app FAQ section
- Email support: support@cosechapropera.app
- WhatsApp community (common in rural Colombia)

### Maintenance Plan
- Weekly price data updates
- Monthly OpenAI API cost monitoring
- Quarterly user feedback surveys
- Biannual feature releases

---

## 📝 Conclusion

Cosecha Próspera represents a practical application of AI technology to solve a real-world problem affecting Colombian coffee farmers. By combining modern mobile development practices with generative AI, the app delivers personalized insights that were previously inaccessible to small producers.

The project's success lies not in technological complexity, but in thoughtful scope definition, user-centric design, and pragmatic implementation choices. It demonstrates that impactful AI applications don't require custom models or massive datasets—effective prompt engineering and context injection can deliver significant value with existing tools.

**Key Takeaways**:
- Solve real problems, don't chase technology trends
- MVP scope discipline enables faster delivery
- Generative AI shines when augmented with user context
- Simple UX is critical for non-technical users
- Ethical considerations should guide every design decision

---

## 📚 References & Resources

### Official Documentation
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Documentation](https://docs.expo.dev/)
- [Supabase Guides](https://supabase.com/docs)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [NativeWind Setup](https://www.nativewind.dev/)

### Domain-Specific Resources
- [Colombian Coffee Growers Federation](https://www.federaciondecafeteros.org/)
- [International Coffee Organization](https://www.ico.org/)
- Coffee price trends and analysis resources

### Development Tools
- [Expo Snack](https://snack.expo.dev/) - Online React Native playground
- [Supabase Studio](https://supabase.com/docs/guides/platform) - Database management
- [OpenAI Playground](https://platform.openai.com/playground) - Prompt testing

---

**Document Version**: 1.0  
**Last Updated**: November 29, 2025  
**Author**: Project Development Team  
**Status**: MVP Documentation Complete