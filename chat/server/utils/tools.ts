import { z } from 'zod'

/**
 * Detects agent commands in chat messages
 * @param message - The message text to analyze
 * @returns Detection result with agent info
 */
export function detectAgentCommand(message: string) {
  const agentPattern = /@(\w+(?:-\w+)*)-agent/g
  const matches = message.match(agentPattern)

  if (matches && matches.length > 0) {
    const agentName = matches[0].replace('@', '').replace('-agent', '')

    // Map agent names to tool names
    const agentMap: Record<string, string> = {
      'ip-blockchain': 'ipBlockchainAgent',
      'literature': 'literatureAgent',
      'peer-review': 'peerReviewAgent',
      'grant': 'grantAgent',
      'cross-domain': 'crossDomainAgent',
      'waiting': 'waitingAgent'
    }

    return {
      hasAgent: true,
      agentName: agentMap[agentName] || agentName,
      cleanMessage: message.replace(agentPattern, '').trim()
    }
  }

  return {
    hasAgent: false,
    agentName: null,
    cleanMessage: message
  }
}

// Helper functions
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
const randomHex = (length: number) => [...Array(length)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')
const randomId = () => Math.random().toString(36).substr(2, 9)

/**
 * Scientific discovery agent tools
 */
export const tools = {
  ipBlockchainAgent: {
    description: 'Protect intellectual property by registering research on blockchain',
    inputSchema: z.object({
      document: z.string().describe('Research document or abstract'),
      title: z.string().describe('Document title'),
      authors: z.array(z.string()).describe('List of authors').optional()
    }),
    execute: async ({ _document, title, authors }: { _document: string, title: string, authors?: string[] }) => {
      await sleep(1500) // Simulate hashing
      const txId = `0x${randomHex(64)}`
      await sleep(2000) // Simulate IPFS upload
      const ipfsHash = `Qm${randomHex(44)}`
      await sleep(1500) // Simulate blockchain mint

      return {
        status: 'protected',
        title,
        transactionId: txId,
        ipfsHash,
        timestamp: new Date().toISOString(),
        certificateUrl: `https://proof.science/cert/${randomId()}`,
        authors: authors || ['Anonymous'],
        message: `Your research "${title}" has been permanently recorded on the blockchain`
      }
    }
  },

  literatureAgent: {
    description: 'Search and analyze academic literature',
    inputSchema: z.object({
      query: z.string().describe('Research topic or keywords'),
      yearRange: z.string().describe('Year range like 2020-2024').optional(),
      sources: z.array(z.string()).describe('Specific sources').optional()
    }),
    execute: async ({ query, yearRange, sources }: { query: string, yearRange?: string, sources?: string[] }) => {
      await sleep(1000) // Simulate arXiv search
      await sleep(1200) // Simulate PubMed search
      await sleep(800) // Simulate Google Scholar

      const papersFound = Math.floor(Math.random() * 200) + 50

      return {
        status: 'completed',
        query,
        papersFound,
        sources: sources || ['arXiv', 'PubMed', 'Google Scholar'],
        yearRange: yearRange || '2020-2024',
        topPapers: [
          { title: 'Recent Advances in ' + query, year: 2024, citations: 42 },
          { title: 'A Comprehensive Review of ' + query, year: 2023, citations: 127 },
          { title: 'Novel Approaches to ' + query, year: 2024, citations: 18 }
        ],
        researchGaps: [
          'Limited studies on long-term effects',
          'Need for larger sample sizes',
          'Cross-disciplinary applications unexplored'
        ]
      }
    }
  },

  peerReviewAgent: {
    description: 'Provide comprehensive peer review of research papers',
    inputSchema: z.object({
      paper: z.string().describe('Paper abstract or full text'),
      field: z.string().describe('Research field').optional()
    }),
    execute: async ({ _paper, field }: { _paper: string, field?: string }) => {
      await sleep(2000) // Simulate methodology analysis
      await sleep(1500) // Simulate statistical check
      await sleep(1000) // Simulate literature comparison

      const score = (Math.random() * 3 + 7).toFixed(1)

      return {
        status: 'reviewed',
        field: field || 'General Science',
        overallScore: `${score}/10`,
        strengths: [
          'Clear research question and objectives',
          'Well-structured methodology',
          'Appropriate statistical analysis'
        ],
        weaknesses: [
          'Sample size could be larger',
          'Missing recent references from 2024'
        ],
        suggestions: [
          'Consider adding a control group',
          'Expand discussion of limitations',
          'Include more recent literature',
          'Add supplementary data'
        ],
        recommendation: parseFloat(score) > 7.5 ? 'Accept with minor revisions' : 'Major revisions needed'
      }
    }
  },

  grantAgent: {
    description: 'Find and match research funding opportunities',
    inputSchema: z.object({
      abstract: z.string().describe('Research abstract'),
      budget: z.string().describe('Estimated budget').optional(),
      duration: z.string().describe('Project duration').optional()
    }),
    execute: async ({ _abstract, _budget, _duration }: { _abstract: string, _budget?: string, _duration?: string }) => {
      await sleep(1500) // Simulate database searches
      await sleep(1000) // Simulate eligibility matching

      return {
        status: 'matched',
        grantsFound: 12,
        eligibleGrants: 8,
        topMatches: [
          {
            name: 'NSF Early Career Development Grant',
            amount: '$500,000',
            deadline: '2024-03-15',
            matchScore: '92%'
          },
          {
            name: 'NIH R01 Research Project Grant',
            amount: '$1,250,000',
            deadline: '2024-02-05',
            matchScore: '87%'
          },
          {
            name: 'EU Horizon Europe Collaborative',
            amount: '€2,000,000',
            deadline: '2024-04-20',
            matchScore: '79%'
          }
        ],
        tips: [
          'Your abstract aligns well with NSF priorities',
          'Consider collaboration for EU grants',
          'NIH grant requires preliminary data'
        ]
      }
    }
  },

  crossDomainAgent: {
    description: 'Discover interdisciplinary connections and applications',
    inputSchema: z.object({
      problem: z.string().describe('Research problem or concept'),
      currentField: z.string().describe('Current field').optional()
    }),
    execute: async ({ _problem, currentField }: { _problem: string, currentField?: string }) => {
      await sleep(1800) // Simulate cross-domain analysis
      await sleep(1200) // Simulate pattern matching

      return {
        status: 'analyzed',
        originalField: currentField || 'Not specified',
        connectionsFound: 7,
        crossDomainApplications: [
          {
            field: 'Biology',
            connection: 'Similar pattern found in protein folding mechanisms',
            potential: 'Could apply biomimetic approaches'
          },
          {
            field: 'Physics',
            connection: 'Analogous to quantum tunneling phenomena',
            potential: 'Mathematical models may transfer'
          },
          {
            field: 'Computer Science',
            connection: 'Resembles distributed consensus algorithms',
            potential: 'Could optimize using graph theory'
          }
        ],
        suggestedCollaborations: [
          'MIT Bio-Inspired Robotics Lab',
          'Stanford Network Analysis Group',
          'Cambridge Quantum Computing Initiative'
        ],
        novelApproach: `Consider combining ${currentField || 'your field'} with swarm intelligence principles for breakthrough results`
      }
    }
  },

  waitingAgent: {
    description: 'A simple agent that waits for a specified duration and returns a completion message',
    inputSchema: z.object({
      message: z.string().describe('Message to display while waiting').optional(),
      duration: z.number().describe('Duration to wait in seconds').default(4)
    }),
    execute: async ({ message = 'Processing...', duration = 4 }) => {
      await sleep(duration * 1000)

      return {
        status: 'completed',
        message: `Waiting agent completed! ${message ? `Initial message: "${message}"` : ''}`,
        duration: `${duration} seconds`,
        timestamp: new Date().toISOString()
      }
    }
  }
}

/**
 * Get text content from message parts
 * @param messageParts - The message parts array
 * @returns Concatenated text content
 */
export function getTextFromParts(messageParts: Array<{ type: string, text?: string }>): string {
  return messageParts
    ?.filter(part => part.type === 'text')
    ?.map(part => part.text)
    ?.join('') || ''
}
