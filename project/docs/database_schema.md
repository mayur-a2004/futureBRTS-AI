# FutureBuilder Database Schema (MongoDB)

## Collections

### 1. `landing_content`
Stores dynamic content for the landing page sections.
```json
{
  "_id": "ObjectId",
  "section_key": "String (e.g., 'hero', 'how_it_works', 'pricing')",
  "title": "String",
  "subtitle": "String",
  "cta_text": "String",
  "data": "Object (custom fields per section)",
  "is_active": "Boolean",
  "updated_at": "ISODate"
}
```

### 2. `landing_intents`
Captures raw user input from the landing page search/input.
```json
{
  "_id": "ObjectId",
  "session_id": "String (client-side UUID)",
  "user_id": "ObjectId (nullable, links to users if logged in)",
  "raw_text": "String",
  "detected_keywords": ["String"],
  "source": "String (default: 'landing_input')",
  "metadata": {
    "ip": "String",
    "device": "String",
    "location": "Object"
  },
  "created_at": "ISODate"
}
```

### 3. `seo_keywords`
Aggregated keyword data for analysis and ranking.
```json
{
  "_id": "ObjectId",
  "keyword": "String",
  "source_page": "String",
  "intent_type": "String (e.g., 'career_switch', 'student_exam')",
  "frequency": "Number",
  "first_seen": "ISODate",
  "last_seen": "ISODate"
}
```

### 4. `seo_meta`
Dynamic meta tag configurations for different pages.
```json
{
  "_id": "ObjectId",
  "page_path": "String (e.g., '/', '/builder')",
  "title": "String",
  "description": "String",
  "keywords": ["String"],
  "og_tags": {
    "title": "String",
    "description": "String",
    "image": "String"
  },
  "twitter_tags": {
    "card": "String",
    "site": "String",
    "title": "String"
  },
  "canonical_url": "String",
  "last_updated": "ISODate"
}
```

### 5. `seo_events`
Tracking for user interactions (clicks, views, conversions).
```json
{
  "_id": "ObjectId",
  "event_type": "String (view | click | conversion)",
  "page": "String",
  "element_id": "String",
  "session_id": "String",
  "user_id": "ObjectId (nullable)",
  "timestamp": "ISODate"
}
```
### 6. `page_versions`
Tracks versions of landing page content for A/B testing or history.
```json
{
  "_id": "ObjectId",
  "page_path": "String",
  "version_id": "String",
  "content_snapshot": "Object",
  "is_live": "Boolean",
  "created_by": "ObjectId",
  "created_at": "ISODate"
}
```
