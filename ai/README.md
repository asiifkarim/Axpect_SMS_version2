# AI-Powered Chatbot for Staff Management System

## Overview

This AI chatbot integrates seamlessly with your Django Staff Management System to automate operations and provide intelligent assistance through natural language processing. The chatbot can handle task management, attendance tracking, employee queries, and more.

## Features

### 🤖 **Natural Language Understanding**
- Powered by OpenAI GPT or Google Gemini APIs
- Understands context and intent from user messages
- Provides conversational responses with actionable results

### 📋 **Task Management**
- **Create Tasks**: "Assign a task to Ali to complete the project report"
- **View Tasks**: "Show my tasks" or "What are John's pending tasks?"
- **Task Status**: Automatically tracks and reports task progress

### 📅 **Attendance Management**
- **Check Attendance**: "Show my attendance" or "Check attendance for this week"
- **Attendance Reports**: View detailed attendance statistics and summaries
- **GPS Tracking**: Integration with existing GPS attendance system

### 👥 **Employee Information**
- **Employee Details**: "Show details for John Smith"
- **Team Lists**: "List all employees in Marketing department"
- **Role-based Access**: Respects user permissions and access levels

### 🔐 **Role-Based Access Control**
- **Managers/Admins**: Can create tasks, view all employee data, manage teams
- **Employees**: Can view their own data, check personal tasks and attendance
- **Secure Operations**: All database operations respect Django's permission system

## Installation & Setup

### 1. **API Configuration**

Add your AI API keys to your environment variables or `.env` file:

```bash
# For OpenAI (recommended)
OPENAI_API_KEY=your_openai_api_key_here

# For Google Gemini (alternative)
GEMINI_API_KEY=your_gemini_api_key_here

# Choose preferred model (default: openai)
AI_MODEL=openai  # or 'gemini'
```

### 2. **Dependencies**

Install required packages:

```bash
pip install openai google-generativeai
```

### 3. **Django Settings**

The AI app is already added to `INSTALLED_APPS` in your settings.py:

```python
INSTALLED_APPS = [
    # ... other apps
    'ai',
]
```

## Usage

### 🌐 **Web Interface**

1. **Access the Chatbot**: Navigate to `/chatbot/` in your browser
2. **Login Required**: Must be logged in to use the chatbot
3. **Modern UI**: Clean, responsive interface with chat bubbles and typing indicators

### 💬 **Sample Commands**

#### Task Management
```
"Assign a new task to Ali to complete the project report"
"Show all pending tasks for the marketing team"
"What are my tasks for this week?"
"Mark task #123 as completed"
```

#### Attendance Queries
```
"Show my attendance for this month"
"Check attendance report for John Smith"
"Who was absent yesterday?"
"What's my attendance percentage?"
```

#### Employee Information
```
"Show details for Sarah Johnson"
"List all employees in the IT department"
"Who are the managers in the company?"
"Show my profile information"
```

#### General Help
```
"Help"
"What can you do?"
"Show me available commands"
```

## API Endpoints

### 🔌 **REST API**

- **POST** `/chatbot/api/chat/` - Send messages to chatbot
- **GET** `/chatbot/` - Access web interface

#### Request Format
```json
{
    "message": "Show my tasks"
}
```

#### Response Format
```json
{
    "success": true,
    "response": "📋 Found 3 tasks for Admin User:",
    "action_result": {
        "success": true,
        "message": "Tasks retrieved successfully",
        "tasks": [...]
    }
}
```

## Architecture

### 📁 **File Structure**

```
ai/
├── __init__.py
├── apps.py
├── llm_handler.py      # AI model communication
├── actions.py          # Database operations
├── views.py           # Django views
├── urls.py            # URL routing
├── templates/
│   └── ai/
│       └── chatbot.html   # Chat interface
└── README.md
```

### 🔧 **Core Components**

#### **LLM Handler** (`llm_handler.py`)
- Manages communication with AI APIs (OpenAI/Gemini)
- Processes user context and generates responses
- Extracts actionable intents from natural language

#### **Actions Handler** (`actions.py`)
- Executes database operations based on AI intents
- Implements role-based access control
- Handles CRUD operations for tasks, attendance, employees

#### **Views** (`views.py`)
- Django views for web interface and API endpoints
- Handles authentication and request processing
- Integrates LLM responses with database actions

## Security & Permissions

### 🛡️ **Access Control**

- **Authentication Required**: All endpoints require user login
- **Role-Based Permissions**: Actions respect Django user roles
- **Data Privacy**: Users can only access data they're authorized to see

### 🔒 **Permission Matrix**

| Action | Employee | Manager | Admin/CEO |
|--------|----------|---------|-----------|
| View own tasks | ✅ | ✅ | ✅ |
| View others' tasks | ❌ | ✅ | ✅ |
| Create tasks | ❌ | ✅ | ✅ |
| View own attendance | ✅ | ✅ | ✅ |
| View all attendance | ❌ | ✅ | ✅ |
| List employees | ❌ | ✅ | ✅ |

## Customization

### 🎨 **UI Customization**

The chat interface uses Tailwind CSS and can be easily customized:

- **Colors**: Modify the gradient and color classes in `chatbot.html`
- **Layout**: Adjust the responsive grid and spacing
- **Animations**: Customize typing indicators and transitions

### 🧠 **AI Behavior**

Modify the system prompt in `llm_handler.py` to:

- Change the chatbot's personality
- Add new command patterns
- Customize response formats

### ⚡ **Adding New Actions**

1. Add new action function in `actions.py`
2. Register the action in `execute_action()` function
3. Update the system prompt to include new capabilities

## Troubleshooting

### 🔍 **Common Issues**

#### **API Key Issues**
```bash
# Check if API keys are set
echo $OPENAI_API_KEY
echo $GEMINI_API_KEY
```

#### **Permission Errors**
- Ensure user has proper role assignments in Django admin
- Check `user_type` field in CustomUser model

#### **Database Errors**
- Verify all migrations are applied: `python manage.py migrate`
- Check if Employee profile exists for the user

### 📊 **Testing**

Run the test script to verify functionality:

```bash
python test_chatbot.py
```

## Performance & Scaling

### ⚡ **Optimization Tips**

1. **API Rate Limits**: Implement caching for frequent queries
2. **Database Queries**: Use `select_related()` for efficient joins
3. **Response Time**: Consider async processing for complex operations

### 📈 **Monitoring**

- Monitor API usage and costs
- Track response times and user satisfaction
- Log errors and failed operations

## Future Enhancements

### 🚀 **Planned Features**

- **Voice Integration**: Speech-to-text and text-to-speech
- **Multi-language Support**: Internationalization
- **Advanced Analytics**: AI-powered insights and recommendations
- **Workflow Automation**: Complex multi-step operations
- **Integration APIs**: Connect with external tools (Slack, Teams, etc.)

## Support

For issues, feature requests, or questions:

1. Check the troubleshooting section above
2. Review Django logs for error details
3. Test with the provided test script
4. Verify API key configuration

---

**Built with ❤️ for efficient staff management automation**
