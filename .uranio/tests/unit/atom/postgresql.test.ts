/**
 * Unit tests for PostgreSQL Atom Client
 * Tests atom methods with mocked database connections
 */

import {PostgreSQLAtomClient} from '../../../src/atom/postgresql';
import {PostgreSQLClient} from '../../../src/client/postgresql';

type TestAtom = {
  _id: string;
  name: string;
  age: number;
  email: string;
};

describe('PostgreSQLAtomClient', () => {
  let mockClient: PostgreSQLClient;
  let atomClient: PostgreSQLAtomClient<TestAtom>;

  beforeEach(() => {
    mockClient = {
      exe: jest.fn(),
    } as any;
    atomClient = new PostgreSQLAtomClient(mockClient, 'test_table');
  });

  describe('countAtoms', () => {
    it('should count all atoms without WHERE clause', async () => {
      const mockResult = [[{count: 42}], []];
      (mockClient.exe as jest.Mock).mockResolvedValue(mockResult);

      const count = await atomClient.countAtoms();

      expect(count).toBe(42);
      expect(mockClient.exe).toHaveBeenCalledTimes(1);
      const callArgs = (mockClient.exe as jest.Mock).mock.calls[0][0];
      const {sql} = callArgs.postgres();
      expect(sql).toContain('SELECT COUNT(*) as count');
      expect(sql).toContain('FROM `test_table`');
      expect(sql).not.toContain('WHERE');
    });

    it('should count atoms with simple WHERE clause', async () => {
      const mockResult = [[{count: 10}], []];
      (mockClient.exe as jest.Mock).mockResolvedValue(mockResult);

      const count = await atomClient.countAtoms({age: 25});

      expect(count).toBe(10);
      expect(mockClient.exe).toHaveBeenCalledTimes(1);
      const callArgs = (mockClient.exe as jest.Mock).mock.calls[0][0];
      const {sql} = callArgs.postgres();
      expect(sql).toContain('SELECT COUNT(*) as count');
      expect(sql).toContain('WHERE');
    });

    it('should count atoms with comparison operators', async () => {
      const mockResult = [[{count: 5}], []];
      (mockClient.exe as jest.Mock).mockResolvedValue(mockResult);

      const count = await atomClient.countAtoms({age: {$gte: 18}});

      expect(count).toBe(5);
      expect(mockClient.exe).toHaveBeenCalledTimes(1);
    });

    it('should count atoms with multiple WHERE conditions', async () => {
      const mockResult = [[{count: 3}], []];
      (mockClient.exe as jest.Mock).mockResolvedValue(mockResult);

      const count = await atomClient.countAtoms({
        age: {$gte: 18},
        name: 'John',
      });

      expect(count).toBe(3);
      expect(mockClient.exe).toHaveBeenCalledTimes(1);
    });

    it('should return 0 when no rows match', async () => {
      const mockResult = [[{count: 0}], []];
      (mockClient.exe as jest.Mock).mockResolvedValue(mockResult);

      const count = await atomClient.countAtoms({name: 'NonExistent'});

      expect(count).toBe(0);
    });

    it('should return 0 when result is empty', async () => {
      const mockResult = [[], []];
      (mockClient.exe as jest.Mock).mockResolvedValue(mockResult);

      const count = await atomClient.countAtoms();

      expect(count).toBe(0);
    });

    it('should return 0 when count is null', async () => {
      const mockResult = [[{count: null}], []];
      (mockClient.exe as jest.Mock).mockResolvedValue(mockResult);

      const count = await atomClient.countAtoms();

      expect(count).toBe(0);
    });

    it('should count atoms with $in operator', async () => {
      const mockResult = [[{count: 15}], []];
      (mockClient.exe as jest.Mock).mockResolvedValue(mockResult);

      const count = await atomClient.countAtoms({
        name: {$in: ['John', 'Jane', 'Bob']},
      });

      expect(count).toBe(15);
      expect(mockClient.exe).toHaveBeenCalledTimes(1);
    });

    it('should count atoms with $or operator', async () => {
      const mockResult = [[{count: 20}], []];
      (mockClient.exe as jest.Mock).mockResolvedValue(mockResult);

      const count = await atomClient.countAtoms({
        $or: [{age: {$lt: 18}}, {age: {$gt: 65}}],
      });

      expect(count).toBe(20);
      expect(mockClient.exe).toHaveBeenCalledTimes(1);
    });

    it('should handle large counts', async () => {
      const mockResult = [[{count: 1000000}], []];
      (mockClient.exe as jest.Mock).mockResolvedValue(mockResult);

      const count = await atomClient.countAtoms();

      expect(count).toBe(1000000);
    });
  });
});
