/**
 * tests/mocks/server.ts
 *
 * Instance MSW server untuk test — diimpor test integration yang perlu
 * menimpa handler via `server.use(...)`.
 */

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
