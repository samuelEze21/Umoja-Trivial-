// @ts-ignore
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Umoja Trivia API',
    version: '1.0.0',
    description: 'API docs for authentication and game services',
  },
  servers: [{ url: 'http://localhost:5001' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      LoginRequest: {
        type: 'object',
        properties: { idToken: { type: 'string' } },
        required: ['idToken'],
      },
      AuthResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: { token: { type: 'string' }, user: { type: 'object' } },
          },
        },
      },
      StartSessionRequest: {
        type: 'object',
        properties: {
          userId: { type: 'string' },
        },
      },
      SubmitAnswerRequest: {
        type: 'object',
        properties: {
          sessionId: { type: 'string' },
          questionId: { type: 'string' },
          selectedOption: { type: 'string' },
        },
        required: ['sessionId', 'questionId', 'selectedOption'],
      },
      HintRequest: {
        type: 'object',
        properties: {
          sessionId: { type: 'string' },
          questionId: { type: 'string' },
          userId: { type: 'string' },
        },
        required: ['sessionId', 'questionId'],
      },
    },
  },
  paths: {
    '/api/auth/firebase-login': {
      post: {
        summary: 'Login with Firebase idToken (test: mock:+1234567890)',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } },
          },
        },
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } } },
      },
    },
    '/api/auth/refresh': {
      post: {
        summary: 'Refresh JWT token',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/auth/profile': {
      get: {
        summary: 'Get authenticated user profile',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/game/session': {
      post: {
        summary: 'Start a game session (guest or authenticated)',
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/StartSessionRequest' } } } },
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/game/session/{sessionId}/question': {
      get: {
        summary: 'Get next question for a session',
        parameters: [{ name: 'sessionId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/game/answer': {
      post: {
        summary: 'Submit an answer',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/SubmitAnswerRequest' } } } },
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/game/hint': {
      post: {
        summary: 'Get a hint',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/HintRequest' } } } },
        responses: { '200': { description: 'OK' } },
      },
    },
  },
};

export function mountSwagger(app: Express) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}