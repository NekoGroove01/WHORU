# AI Integration Guide

## Overview

The WHORU application includes powerful AI features powered by Google's Gemini API. The AI modal provides three main functions:

1. **Generate Questions** - Creates thoughtful questions based on group topics
2. **Generate Answers** - Provides detailed answers to questions
3. **Find Similar Questions** - Discovers related questions within the group

## Setup Instructions

### 1. Environment Configuration

Create a `.env.local` file in the project root with your Gemini API key:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Getting a Gemini API Key

1. Visit the [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key to your `.env.local` file

### 3. Testing the Integration

1. Start the development server: `npm run dev`
2. Visit `/ai-demo` to test all AI functions
3. Click the AI button (✨) to open the modal
4. Test each function with sample data

## API Endpoints

### Generate Questions

- **Endpoint**: `POST /api/ai/generate-question`
- **Purpose**: Creates questions based on group context
- **Rate Limit**: 10 requests per day per IP

### Generate Answers

- **Endpoint**: `POST /api/ai/generate-answer`
- **Purpose**: Generates answers for specific questions
- **Rate Limit**: 3 requests per question per IP

### Find Similar Questions

- **Endpoint**: `POST /api/ai/simillar-questions`
- **Purpose**: Finds semantically similar questions
- **Rate Limit**: No specific limit

## Integration Points

### AskQuestionForm

- **Context**: Receives group name as precontent
- **Function**: Primarily uses "generate-question"
- **Location**: `/group/[id]` pages

### AddAnswerForm

- **Context**: Receives question content as precontent
- **Function**: Primarily uses "generate-answer"
- **Location**: `/group/[id]/[questionId]` pages

### AIModal Component

- **Smart Context**: Automatically provides relevant context
- **Streaming Support**: Real-time response streaming for better UX
- **Error Handling**: Graceful fallbacks when API is unavailable

## Error Handling

When the Gemini API key is not configured:

- Users see a helpful error message
- Application continues to function normally
- UI flow remains accessible for testing

## Cost Optimization

- **Token Estimation**: ~4 characters per token
- **Rate Limiting**: Prevents excessive API usage
- **Usage Logging**: Tracks API consumption
- **Smart Caching**: Reduces redundant requests

## Development Tips

1. **Testing Without API Key**: The modal works without an API key - it shows appropriate error messages
2. **Local Development**: Use the demo page (`/ai-demo`) for testing
3. **Production Setup**: Ensure GEMINI_API_KEY is set in production environment
4. **Monitoring**: Check usage logs in the database for cost tracking
