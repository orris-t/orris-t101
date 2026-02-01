# Orris Stories - Medical Resident Cognitive Copilot

A lightweight web application that generates Instagram story content for medical residents using Claude AI. Built with Next.js and Tailwind CSS.

## Features

- 🔍 **Web Search Integration** - Fetches latest medical information via Tavily
- 🧠 **Extended Thinking** - Claude Sonnet 4.5 with reasoning capabilities
- 📊 **Progress Indicators** - Real-time status updates (searching → reasoning → generating)
- 🎯 Topic-based story generation for medical topics
- 📐 Three-dial decision framework (Recency, Cognitive Layer, Format)
- 📱 Clean, responsive UI optimized for mobile and desktop
- 📋 Copy to clipboard functionality (story only or with thinking)
- ⚡ Fast streaming responses

## Prerequisites

- Node.js 18+ installed
- Azure AI Services with Anthropic Claude access
- Azure Anthropic API credentials (endpoint and API key)
- Tavily API key for web search (get free key at [tavily.com](https://tavily.com))

## Azure Anthropic Setup

Before running the app, you need to set up Azure Anthropic:

1. **Create an Azure AI Services resource**
   - Go to [Azure Portal](https://portal.azure.com)
   - Create a new Azure AI Services resource with Anthropic Claude access

2. **Get your credentials**
   - Go to your Azure AI Services resource
   - Navigate to "Keys and Endpoint"
   - Copy:
     - Endpoint URL (e.g., `https://your-resource.services.ai.azure.com/anthropic/`)
     - API Key (Key 1 or Key 2)

## Local Development Setup

1. **Clone or navigate to the project directory**

```bash
cd orris-stories-app
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Then edit `.env.local` and add your credentials:

```
AZURE_ANTHROPIC_ENDPOINT=https://your-resource-name.services.ai.azure.com/anthropic/
AZURE_ANTHROPIC_API_KEY=your_azure_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
```

**Where to find these values:**
- `AZURE_ANTHROPIC_ENDPOINT`: Your Azure AI Services endpoint (found in Azure Portal > Keys and Endpoint)
- `AZURE_ANTHROPIC_API_KEY`: Your API key from Azure Portal > Keys and Endpoint
- `TAVILY_API_KEY`: Get free API key at [tavily.com](https://app.tavily.com)

4. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
orris-stories-app/
├── app/
│   ├── api/
│   │   └── generate/
│   │       └── route.ts       # API endpoint for Claude integration
│   ├── page.tsx               # Main UI component
│   └── layout.tsx
├── system prompt.md           # System prompt (in parent directory)
└── .env.local                 # Environment variables (create this)
```

## Deployment

### Deploy to Vercel (Recommended - Free)

1. **Push your code to GitHub**

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push -u origin main
```

2. **Deploy to Vercel**

- Go to [vercel.com](https://vercel.com)
- Click "Import Project"
- Select your GitHub repository
- Add environment variables:
  - `AZURE_ANTHROPIC_ENDPOINT`: Your Azure Anthropic endpoint
  - `AZURE_ANTHROPIC_API_KEY`: Your Azure API key
  - `TAVILY_API_KEY`: Your Tavily API key
- Click "Deploy"

Your app will be live at: `https://your-app-name.vercel.app`

### Deploy to Netlify

1. **Build the project**

```bash
npm run build
```

2. **Deploy to Netlify**

- Go to [netlify.com](https://netlify.com)
- Drag and drop your `.next` folder or connect your GitHub repo
- Add environment variables in Netlify settings:
  - `AZURE_ANTHROPIC_ENDPOINT`
  - `AZURE_ANTHROPIC_API_KEY`
  - `TAVILY_API_KEY`
- Deploy

### Other Hosting Options

- **Railway**: Easy deployment with built-in domain
- **Render**: Free tier available
- **AWS/Google Cloud**: For more control and scalability

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `AZURE_ANTHROPIC_ENDPOINT` | Your Azure Anthropic endpoint | Yes |
| `AZURE_ANTHROPIC_API_KEY` | Your Azure Anthropic API key | Yes |
| `TAVILY_API_KEY` | Tavily API key for web search | Yes |

## Usage

1. Enter a medical topic (e.g., "DKA", "Stroke", "Hypertension")
2. Click "Generate Story"
3. Watch the progress:
   - 🔍 **Searching** - Tavily fetches latest medical information
   - 🧠 **Reasoning** - Claude analyzes information with extended thinking
   - ✍️ **Generating** - Final story creation
4. Review the extended thinking process (optional)
5. Copy the story to clipboard or copy with thinking included

## System Prompt

The system prompt is loaded from `../system prompt.md` relative to the app directory. This contains the three-dial framework and content generation rules.

## API Cost Considerations

- Costs depend on your Azure AI Services pricing tier and Claude model used
- Using Claude 3.5 Sonnet model
- Monitor usage in Azure Portal > Your AI Services Resource > Metrics
- Consider adding rate limiting for public deployments
- Azure provides quota management to control costs

## Customization

### Change the Claude Model

Edit [app/api/generate/route.ts](app/api/generate/route.ts) and change the `model` parameter:
```typescript
model: 'claude-3-5-sonnet-20241022',  // or claude-3-opus-20240229, claude-3-haiku-20240307
```

### Adjust Generation Parameters

Edit [app/api/generate/route.ts](app/api/generate/route.ts) to modify:
- `max_tokens`: Maximum response length (default: 4096)
- `model`: Claude model version

### Modify the UI

Edit [app/page.tsx](app/page.tsx) to customize colors, layout, or add features.

### Update System Prompt

Edit `../system prompt.md` to change content generation rules.

## Troubleshooting

**Error: "Azure Anthropic configuration is incomplete"**
- Make sure `.env.local` exists with all required variables:
  - `AZURE_ANTHROPIC_ENDPOINT`
  - `AZURE_ANTHROPIC_API_KEY`
- Restart the dev server after adding environment variables

**Error: "Failed to generate story"**
- Verify your Azure API key is valid
- Ensure your Azure AI Services resource has quota available
- Verify you have access to Anthropic Claude models
- Check the browser console and terminal for detailed error messages

**Error: 404 or endpoint not found**
- Double-check your `AZURE_ANTHROPIC_ENDPOINT` includes the `/anthropic/` path
- Ensure the endpoint format is: `https://your-resource.services.ai.azure.com/anthropic/`

**System prompt not loading**
- Ensure `system prompt.md` is in the parent directory
- Check file permissions

## License

MIT License - feel free to use and modify as needed.

## Support

For issues or questions, please open an issue in the repository.
