// In-memory PrismaClient mock for tests

type Where = Record<string, any>;
type CreateArgs<T> = { data: T };
type UpdateArgs<T> = { where: Where; data: Partial<T> };
type FindArgs = { where?: Where };

let userIdSeq = 1;
let sessionIdSeq = 1;
let transferIdSeq = 1;
let progressIdSeq = 1;

const users: any[] = [];
const gameSessions: any[] = [];
const coinTransfers: any[] = [];
const userProgress: any[] = [];

const matchWhere = (item: any, where?: Where) => {
  if (!where) return true;
  return Object.entries(where).every(([key, val]) => {
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      // Nested where like { userId: { equals: 1 } }
      if ('equals' in val) return item[key] === val.equals;
      if ('in' in val) return Array.isArray(val.in) && val.in.includes(item[key]);
      if ('contains' in val) return String(item[key]).includes(val.contains);
      return item[key] === val;
    }
    return item[key] === val;
  });
};

const clone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

const prismaMock: any = {
  $connect: jest.fn().mockResolvedValue(undefined),
  $disconnect: jest.fn().mockResolvedValue(undefined),

  userProgress: {
    create: jest.fn().mockImplementation(async ({ data }: CreateArgs<any>) => {
      const newItem = { id: progressIdSeq++, createdAt: new Date(), updatedAt: new Date(), ...clone(data) };
      userProgress.push(newItem);
      return clone(newItem);
    }),
    findMany: jest.fn().mockImplementation(async ({ where }: FindArgs = {}) => {
      return clone(userProgress.filter(p => matchWhere(p, where)));
    }),
    deleteMany: jest.fn().mockImplementation(async (args?: FindArgs) => {
      if (!args?.where) {
        const count = userProgress.length;
        userProgress.length = 0;
        return { count };
      }
      const before = userProgress.length;
      for (let i = userProgress.length - 1; i >= 0; i--) {
        if (matchWhere(userProgress[i], args.where)) userProgress.splice(i, 1);
      }
      return { count: before - userProgress.length };
    }),
  },

  user: {
    deleteMany: jest.fn().mockImplementation(async (args?: FindArgs) => {
      if (!args?.where) {
        const count = users.length;
        users.length = 0;
        return { count };
      }
      const before = users.length;
      for (let i = users.length - 1; i >= 0; i--) {
        if (matchWhere(users[i], args.where)) users.splice(i, 1);
      }
      return { count: before - users.length };
    }),
    delete: jest.fn().mockImplementation(async ({ where }: { where: Where }) => {
      const idx = users.findIndex(u => matchWhere(u, where));
      if (idx === -1) throw new Error('Record not found');
      const deleted = users[idx];
      users.splice(idx, 1);
      return clone(deleted);
    }),
    create: jest.fn().mockImplementation(async ({ data }: CreateArgs<any>) => {
      const newItem = { id: userIdSeq++, createdAt: new Date(), updatedAt: new Date(), ...clone(data) };
      users.push(newItem);
      return clone(newItem);
    }),
    findUnique: jest.fn().mockImplementation(async ({ where }: { where: Where }) => {
      return clone(users.find(u => matchWhere(u, where)) ?? null);
    }),
    findFirst: jest.fn().mockImplementation(async ({ where }: { where?: Where }) => {
      // Special handling for phone number validation
      if (where && where.phoneNumber && where.id && where.id.not) {
        // This is checking for duplicate phone numbers
        return clone(users.find(u => 
          u.phoneNumber === where.phoneNumber && 
          u.id !== where.id.not
        ) ?? null);
      }
      return clone(users.find(u => matchWhere(u, where)) ?? null);
    }),
    findMany: jest.fn().mockImplementation(async ({ where }: FindArgs = {}) => {
      return clone(users.filter(u => matchWhere(u, where)));
    }),
    update: jest.fn().mockImplementation(async ({ where, data }: UpdateArgs<any>) => {
      const idx = users.findIndex(u => matchWhere(u, where));
      if (idx === -1) throw new Error('Record not found');
      users[idx] = { ...users[idx], ...clone(data), updatedAt: new Date() };
      return clone(users[idx]);
    }),
    updateMany: jest.fn().mockImplementation(async ({ where, data }: UpdateArgs<any>) => {
      let count = 0;
      users.forEach((u, i) => {
        if (matchWhere(u, where)) {
          users[i] = { ...u, ...clone(data), updatedAt: new Date() };
          count++;
        }
      });
      return { count };
    }),
    count: jest.fn().mockImplementation(async ({ where }: FindArgs = {}) => {
      return users.filter(u => matchWhere(u, where)).length;
    }),
  },

  gameSession: {
    deleteMany: jest.fn().mockImplementation(async (args?: FindArgs) => {
      if (!args?.where) {
        const count = gameSessions.length;
        gameSessions.length = 0;
        return { count };
      }
      const before = gameSessions.length;
      for (let i = gameSessions.length - 1; i >= 0; i--) {
        if (matchWhere(gameSessions[i], args.where)) gameSessions.splice(i, 1);
      }
      return { count: before - gameSessions.length };
    }),
    create: jest.fn().mockImplementation(async ({ data }: CreateArgs<any>) => {
      const newItem = { id: sessionIdSeq++, createdAt: new Date(), updatedAt: new Date(), ...clone(data) };
      gameSessions.push(newItem);
      return clone(newItem);
    }),
    findMany: jest.fn().mockImplementation(async ({ where }: FindArgs = {}) => {
      return clone(gameSessions.filter(s => matchWhere(s, where)));
    }),
    findFirst: jest.fn().mockImplementation(async ({ where }: { where?: Where }) => {
      return clone(gameSessions.find(s => matchWhere(s, where)) ?? null);
    }),
    update: jest.fn().mockImplementation(async ({ where, data }: UpdateArgs<any>) => {
      const idx = gameSessions.findIndex(s => matchWhere(s, where));
      if (idx === -1) throw new Error('Record not found');
      gameSessions[idx] = { ...gameSessions[idx], ...clone(data), updatedAt: new Date() };
      return clone(gameSessions[idx]);
    }),
  },

  coinTransfer: {
    deleteMany: jest.fn().mockImplementation(async (args?: FindArgs) => {
      if (!args?.where) {
        const count = coinTransfers.length;
        coinTransfers.length = 0;
        return { count };
      }
      const before = coinTransfers.length;
      for (let i = coinTransfers.length - 1; i >= 0; i--) {
        if (matchWhere(coinTransfers[i], args.where)) coinTransfers.splice(i, 1);
      }
      return { count: before - coinTransfers.length };
    }),
    create: jest.fn().mockImplementation(async ({ data }: CreateArgs<any>) => {
      const newItem = { id: transferIdSeq++, createdAt: new Date(), updatedAt: new Date(), ...clone(data) };
      coinTransfers.push(newItem);
      return clone(newItem);
    }),
    findMany: jest.fn().mockImplementation(async ({ where }: FindArgs = {}) => {
      return clone(coinTransfers.filter(t => matchWhere(t, where)));
    }),
    updateMany: jest.fn().mockImplementation(async ({ where, data }: UpdateArgs<any>) => {
      let count = 0;
      coinTransfers.forEach((t, i) => {
        if (matchWhere(t, where)) {
          coinTransfers[i] = { ...t, ...clone(data), updatedAt: new Date() };
          count++;
        }
      });
      return { count };
    }),
  },
};

// Replace PrismaClient constructor with our mock
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => prismaMock),
  };
});

export { prismaMock };