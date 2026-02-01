import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Read the system prompt
const systemPromptPath = path.join(process.cwd(), 'data', 'system-prompt.md');
let systemPrompt = '';

try {
  systemPrompt = fs.readFileSync(systemPromptPath, 'utf-8');
} catch (error) {
  console.error('Error reading system prompt:', error);
  systemPrompt = 'You are Orris Stories, a cognitive copilot for medical residents.';
}

// Read PDFs as base64
function readPDFsAsBase64() {
  const pdfDir = path.join(process.cwd(), 'data');
  const pdfFiles = [
    '682a3111-e4ac-4815-bf7e-722b36470678_Content_strategy_for_Instagram_stories-compressed.pdf',
    'orris story system-compressed.pdf',
    'orris_foundation (1)-compressed.pdf',
  ];

  const documents = [];

  for (const file of pdfFiles) {
    try {
      const filePath = path.join(pdfDir, file);
      const fileBuffer = fs.readFileSync(filePath);
      const base64Data = fileBuffer.toString('base64');

      documents.push({
        type: 'document',
        source: {
          type: 'base64',
          media_type: 'application/pdf',
          data: base64Data,
        },
      });
    } catch (error) {
      console.error(`Error reading PDF ${file}:`, error);
    }
  }

  return documents;
}

// Tavily web search function
async function searchWeb(query: string): Promise<string> {
  const tavilyApiKey = process.env.TAVILY_API_KEY;

  if (!tavilyApiKey) {
    return 'Web search unavailable: API key not configured.';
  }

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: tavilyApiKey,
        query: `${query} medical 2025 2026 latest guidelines`,
        search_depth: 'advanced',
        max_results: 5,
        include_answer: true,
      }),
    });

    if (!response.ok) {
      throw new Error('Search API error');
    }

    const data = await response.json();

    // Format search results
    let searchContext = '';
    if (data.answer) {
      searchContext += `Summary: ${data.answer}\n\n`;
    }

    if (data.results && data.results.length > 0) {
      searchContext += 'Recent Information:\n';
      data.results.forEach((result: any, index: number) => {
        searchContext += `${index + 1}. ${result.title}\n   ${result.content}\n   Source: ${result.url}\n\n`;
      });
    }

    return searchContext;
  } catch (error) {
    console.error('Web search error:', error);
    return 'Web search temporarily unavailable.';
  }
}

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const { topic } = await req.json();

        if (!topic || typeof topic !== 'string') {
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: 'error',
                message: 'Topic is required and must be a string',
              }) + '\n'
            )
          );
          controller.close();
          return;
        }

        // Validate Azure Anthropic configuration
        const azureEndpoint = process.env.AZURE_ANTHROPIC_ENDPOINT;
        const azureApiKey = process.env.AZURE_ANTHROPIC_API_KEY;

        if (!azureEndpoint || !azureApiKey) {
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: 'error',
                message: 'Azure Anthropic configuration is incomplete.',
              }) + '\n'
            )
          );
          controller.close();
          return;
        }

        // Step 1: Web Search
        controller.enqueue(
          encoder.encode(
            JSON.stringify({
              type: 'status',
              message: 'Searching for latest medical information...',
            }) + '\n'
          )
        );

        const searchResults = await searchWeb(topic);

        // Step 2: Load PDFs
        controller.enqueue(
          encoder.encode(
            JSON.stringify({
              type: 'status',
              message: 'Loading framework documents...',
            }) + '\n'
          )
        );

        const pdfDocuments = readPDFsAsBase64();

        // Step 3: Reasoning & Generation
        controller.enqueue(
          encoder.encode(
            JSON.stringify({
              type: 'status',
              message: 'Analyzing information and reasoning...',
            }) + '\n'
          )
        );

        // Construct Azure Anthropic endpoint URL
        const baseEndpoint = azureEndpoint.endsWith('/')
          ? azureEndpoint.slice(0, -1)
          : azureEndpoint;
        const url = `${baseEndpoint}/v1/messages`;

        // Build content array with PDFs and text
        const contentBlocks: any[] = [
          ...pdfDocuments,
          {
            type: 'text',
            text: `Topic: ${topic}\n\nRecent Medical Information:\n${searchResults}\n\nUsing the Orris Stories framework from the PDFs above and the recent medical information, create an Instagram story following the three-dial decision framework.`,
          },
        ];

        // Call Azure Anthropic API with extended thinking and PDFs
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': azureApiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-5',
            max_tokens: 8000,
            thinking: {
              type: 'enabled',
              budget_tokens: 3000,
            },
            system: systemPrompt,
            messages: [
              {
                role: 'user',
                content: contentBlocks,
              },
            ],
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Azure Anthropic API error:', errorData);
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: 'error',
                message: `Azure Anthropic API error: ${
                  errorData.error?.message || 'Unknown error'
                }`,
              }) + '\n'
            )
          );
          controller.close();
          return;
        }

        const data = await response.json();

        // Extract thinking and story content
        let thinking = '';
        let story = '';

        if (data.content && Array.isArray(data.content)) {
          for (const block of data.content) {
            if (block.type === 'thinking') {
              thinking = block.thinking || '';
            } else if (block.type === 'text') {
              story += block.text;
            }
          }
        }

        // Send thinking if available
        if (thinking) {
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: 'thinking',
                content: thinking,
              }) + '\n'
            )
          );
        }

        // Step 4: Generating story
        controller.enqueue(
          encoder.encode(
            JSON.stringify({
              type: 'status',
              message: 'Generating story...',
            }) + '\n'
          )
        );

        // Send final story
        controller.enqueue(
          encoder.encode(
            JSON.stringify({
              type: 'story',
              content: story || 'No story generated',
            }) + '\n'
          )
        );

        controller.close();
      } catch (error) {
        console.error('Error generating story:', error);
        controller.enqueue(
          encoder.encode(
            JSON.stringify({
              type: 'error',
              message: 'Failed to generate story. Please try again.',
            }) + '\n'
          )
        );
        controller.close();
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
